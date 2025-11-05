import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*', credentials: true } })
export class ChatGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // Barcha ulangan foydalanuvchilarni saqlaymiz
  // connectedUsers: Record<string, { id: string; name: string; role: string }> = {};

  // Initialization logic
  afterInit() {
    console.log('WebSocket gateway initialized');
  }

  handleConnection(socket: Socket) {
    console.log('User connected:', socket.id);
  }

  handleDisconnect(socket: Socket) {
    console.log('User disconnected:', socket.id);
    // delete this.connectedUsers[socket.id];
    // this.broadcastUsers();
  }

  // @SubscribeMessage('join')
  // handleJoin(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() data: { name: string; role: 'teacher' | 'student' },
  // ) {
  //   console.log("Join 2303");
    
  //   this.connectedUsers[socket.id] = {
  //     id: socket.id,
  //     name: data.name,
  //     role: data.role,
  //   };

  //   console.log(`${data.name} joined as ${data.role}`);
  //   this.broadcastUsers();
  // }

  // // Barcha foydalanuvchilarni teacher’ga yuboramiz
  // broadcastUsers() {
  //   const users = Object.values(this.connectedUsers);
  //   const teachers = users.filter((u) => u.role === 'teacher');

  //   this.server.emit('userList', users);
  //   // for (const teacher of teachers) {
  //   // }
  // }
}
