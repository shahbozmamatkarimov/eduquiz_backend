import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import { FilesModule } from './files/files.module';
import { UserModule } from './user/user.module';
import { TestsModule } from './test/test.module';
import { UploadedModule } from './uploaded/uploaded.module';
import { NotificationModule } from './notification/notification.module';
import { RoleModule } from './role/role.module';
import { ReytingModule } from './reyting/reyting.module';
import { OtpModule } from './otp/otp.module';
import { MailModule } from './mail/mail.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ResetpasswordModule } from './resetpassword/resetpassword.module';
import { UserService } from './user/user.service';
import { Tests } from './test/models/test.models';
import { User } from './user/models/user.models';
import { Uploaded } from './uploaded/models/uploaded.models';
import { Notification } from './notification/models/notification.model';
import { Role } from './role/models/role.models';
import { Reyting } from './reyting/models/reyting.models';
import { TelegrafModule } from 'nestjs-telegraf';
// import { BOT_NAME } from './app.constants';
import { BotModule } from './bot/bot.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MyService } from './schedules/schedule.service';
import { StripeModule } from './stripe/stripe.module';
import { PaymentStripe } from './stripe/models/stripe.models';
import { BOT_NAME } from './app.constants';
import { Bot } from './bot/models/bot.model';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import pg from "pg"
import { Test_settings } from './test_settings/models/test_settings.models';
import { Lesson } from './lesson/models/lesson.models';
import { LessonModule } from './lesson/lesson.module';

@Module({
  imports: [
    // TelegrafModule.forRootAsync({
    //   botName: BOT_NAME,
    //   useFactory: () => {
    //     return process.env.NODE_ENV !== 'production' ? {
    //       token: process.env.BOT_TOKEN,
    //       includes: [BotModule],
    //       // launchOptions: {
    //       //   webhook: {
    //       //     domain: 'https://vercelbackend-production.up.railway.app',
    //       //     hookPath: '/api/webhook',
    //       //   }
    //       // }
    //     } : {
    //       token: process.env.BOT_TOKEN,
    //       // includes: [BotModule],
    //       launchOptions: {
    //         webhook: {
    //           domain: 'https://vercel-backend-bay.vercel.app',
    //           hookPath: '/api/webhook/bot',
    //         }
    //       }
    //     }
    //   },
    // }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.PGHOST,
      // port: Number(process.env.PG_PORT),
      username: process.env.PGUSER,
      password: String(process.env.PGPASSWORD),
      database: process.env.PGDATABASE,
      models: [
        Lesson,
        Tests,
        User,
        Uploaded,
        Notification,
        Role,
        Reyting,
        PaymentStripe,
        // Bot,
        Test_settings,
      ],
      // autoLoadModels: true,
      // synchronize: true,
      // sync: { alter: true },
      logging: true,
      dialectModule: pg,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, '..', 'static'),
      serveRoot: '/static',
    }),
    JwtModule.register({ global: true }),
    MailModule,
    FilesModule,
    LessonModule,
    TestsModule,
    UserModule,
    UploadedModule,
    NotificationModule,
    RoleModule,
    ReytingModule,
    OtpModule,
    CloudinaryModule,
    ResetpasswordModule,
    // BotModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MyService,
  ],
  exports: []
})
export class AppModule implements OnApplicationBootstrap {

  constructor(
    private readonly userService: UserService,
  ) { }

  async onApplicationBootstrap() {
    await this.userService.createDefaultUser();
    // ConsoleUtils.startAutoClear();
  }

}