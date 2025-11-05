import {
  Body,
  Controller,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { UserService } from '../user/user.service';
import { RoleService } from '../role/role.service';
import { extractUserIdFromToken } from 'src/utils/token';
import { JwtService } from '@nestjs/jwt';
import { ChatGateway } from 'src/gateway/gateway';
import { TestsService } from 'src/test/test.service';
let connectedUsers: Record<string, { id: string; name: string; role: string, code: string }> = {};
let trueAnswers: Record<string, { name: string; code: string, variant: number, countdown: number }> = {};

@ApiTags('chat')
@WebSocketGateway({ cors: { origin: '*', credentials: true } }) // cors
@Controller('chat')
export class ChatController
  implements OnGatewayConnection, OnGatewayDisconnect {
  // @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly testsService: TestsService,
    private readonly chatGateway: ChatGateway,
  ) { }
  
  // Initialization logic
  afterInit() {
    console.log('WebSocket gateway initialized');
  }

  handleConnection(socket: Socket) {
    console.log('User connected:', socket.id);
  }

  handleDisconnect(socket: Socket) {
    console.log('User disconnected:', socket.id);
    const user: any = connectedUsers[socket.id];
    delete connectedUsers[socket.id];
    if (user?.code) {
      this.broadcastUsers(user.code);
    }
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { code: string, name: string; role: 'teacher' | 'student' },
  ) {
    console.log("Join 2303");
    socket.join(String(data.code));
    connectedUsers[socket.id] = {
      id: socket.id,
      name: data.name,
      role: data.role,
      code: data.code,
    };

    console.log(`${data.name} joined as ${data.role}`);
    this.broadcastUsers(data.code);
  }

  @SubscribeMessage('startTest')
  async startTest(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { id: number },
    @ConnectedSocket() client: Socket,
    // @Headers() headers: string,
  ) {
    const user_id = extractUserIdFromToken(client.handshake.headers, this.jwtService, true);
    const test = await this.testsService.getByIdWithAnswer(data.id, user_id)

    this.chatGateway.server.to(String(test.code)).emit('testStarted', test);

    // countdown
    let seconds = 60;

    const interval = setInterval(() => {
      seconds--;

      // Hamma test ishtirokchilariga vaqtni yuborish
      this.chatGateway.server
        .to(String(test.code))
        .emit('countdown', { seconds });

      // Tugaganda to‘xtatish
      if (seconds <= 0) {
        const result = this.getAnswers(test.true_answer, test.code);

        clearInterval(interval);
        this.chatGateway.server
          .to(String(test.code))
          .emit('testFinished', { message: 'Test Finished!', result });
      }
    }, 1000);
  }

  getAnswers(correctVariant: number, code: string) {
    const minScore = 30; // minimal foiz, agar to'g'ri javob bersa

    // 1. Faqat to‘g‘ri javob berganlarni olish
    const correctUsers = Object.values(trueAnswers).filter(u => u.variant === correctVariant && u.code == code);

    if (correctUsers.length > 0) {
      const minCountdown = Math.min(...correctUsers.map(u => u.countdown));
      const maxCountdown = Math.max(...correctUsers.map(u => u.countdown));

      // 2. Natijalarni hisoblash
      const results = Object.values(trueAnswers).map(u => {
        if (u.variant !== correctVariant) {
          return { name: u.name, score: 0, countdown: u.countdown }; // noto‘g‘ri javob
        }

        if (minCountdown === maxCountdown) {
          return { name: u.name, score: 100, countdown: u.countdown }; // hammasi bir xil tezlikda javob bergan
        }

        // Countdown kattalashgani sari foiz kamayadi
        const ratio = (u.countdown - minCountdown) / (maxCountdown - minCountdown);
        const score = 100 - ratio * (100 - minScore); // 100 → 30 oralig‘ida
        return { name: u.name, score: Math.round(score), countdown: u.countdown };
      });
      return results;
    }
    return Object.values(trueAnswers).filter(u => u.code == code);
  }

  // Barcha foydalanuvchilarni teacherga yuborish
  broadcastUsers(code: string) {
    const users = Object.values(connectedUsers);

    this.chatGateway.server.to(String(code)).emit('userList', users.filter((u) => u.code == code && u.role == 'student'));
  }

  @ApiOperation({ summary: 'Get testss with pagination' })
  // @UseGuards(AuthGuard)
  @Post('/set-answer')
  async setAnswer(@Body() data: { name: string; code: string, countdown: number, variant: number, }) {
    trueAnswers[data.name] = {
      ...data, countdown: 60 - data.countdown,
    }
    console.log(trueAnswers);

    return {
      status: HttpStatus.OK,
      message: "Saved successfully"
    };
  }
}
