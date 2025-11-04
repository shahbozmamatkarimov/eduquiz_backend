import { Module, forwardRef } from '@nestjs/common';
import { TestsService } from './test.service';
import { TestsController } from './test.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tests } from './models/test.models';
import { ReytingModule } from '../reyting/reyting.module';
import { Test_settingsModule } from '../test_settings/test_settings.module';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from 'src/files/files.module';
import { LessonModule } from 'src/lesson/lesson.module';

@Module({
  imports: [SequelizeModule.forFeature([Tests]), forwardRef(()=> ReytingModule), Test_settingsModule, JwtModule, FilesModule, LessonModule],
  controllers: [TestsController],
  providers: [TestsService],
  exports: [TestsService],
})
export class TestsModule { }
