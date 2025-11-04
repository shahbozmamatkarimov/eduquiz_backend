import { forwardRef, Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Lesson } from './models/lesson.models';
import { UploadedModule } from '../uploaded/uploaded.module';
import { ReytingModule } from 'src/reyting/reyting.module';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [SequelizeModule.forFeature([Lesson]), UploadedModule, FilesModule,],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule { }
