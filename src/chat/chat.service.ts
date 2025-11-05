import { Get, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chat } from './models/chat.model';
import { ChatDto } from './dto/chat.dto';
import { Op } from 'sequelize';
import { SearchDto } from './dto/search.dto';
import { Sequelize } from 'sequelize-typescript';
import { FilesService } from '../files/files.service';
import cloudinary from '../../cloudinary.config';
import { User } from '../user/models/user.models';
// import * as DeviceDetector from 'device-detector-js';
// import { ChatGateway } from '../gateway/gateway';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat) private readonly ChatRepository: typeof Chat,
    private readonly fileService: FilesService,
  ) { }
  // private readonly deviceDetector = new DeviceDetector();
}
