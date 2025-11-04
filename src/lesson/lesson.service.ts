import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Lesson } from './models/lesson.models';
import { InjectModel } from '@nestjs/sequelize';
import { LessonDto } from './dto/lesson.dto';
import { UploadedService } from '../uploaded/uploaded.service';
import { Sequelize } from 'sequelize-typescript';
import { FilesService } from 'src/files/files.service';
import { Tests } from 'src/test/models/test.models';
import { Reyting } from 'src/reyting/models/reyting.models';
import { User } from 'src/user/models/user.models';
import { Op } from 'sequelize';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson) private lessonRepository: typeof Lesson,
    private uploadedService: UploadedService,
    private readonly filesService: FilesService,
  ) { }

  async create(user_id: number, lessonDto: LessonDto, video: any): Promise<object> {
    try {
      const lesson: any = await this.lessonRepository.create({
        user_id,
        title: lessonDto.title,
        content: lessonDto.content,
        published: lessonDto.published,
      });
      return lesson;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async getAll(subcategory_id: string, category_id: number): Promise<object> {
    try {
      subcategory_id = JSON.parse(subcategory_id || "[]");
      let category: any = {}
      let categoryInclude: any = {};

      if (!subcategory_id?.length && +category_id) {
      } else if (subcategory_id?.length) {
        category = {
          where: {
            subcategory_id: {
              [Op.in]: subcategory_id
            }
          }
        }
      }

      const lessons: any = await this.lessonRepository.findAll({
        attributes: {
          include: [
            [
              Sequelize.literal(`
                COALESCE((
                  SELECT COUNT(*) FROM "tests"
                  WHERE "tests"."lesson_id" = "Lesson"."id"
                )::int, 0)
              `),
              'tests_count',
            ],
          ]
        },
        order: [['id', 'ASC']],
      });
      // if (!lessons.length) {
      //   throw new NotFoundException('Lessons not found');
      // }
      return lessons;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getReyting(lesson_id: number): Promise<object> {
    try {
      const reyting: any = await this.lessonRepository.findAll({
        include: [{ model: Reyting }]
      });
      return reyting;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getById(id: number, user_id?: number): Promise<object> {
    try {
      user_id = user_id || null;
      let lesson: any = await this.lessonRepository.findOne({
        where: { id },
      });
      return lesson;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async pagination(page: number): Promise<object> {
    try {
      const offset = (page - 1) * 10;
      const limit = 10;
      const lessons = await this.lessonRepository.findAll({ offset, limit });
      const total_count = await this.lessonRepository.count();
      const total_pages = Math.ceil(total_count / 10);
      const response = {
        statusCode: HttpStatus.OK,
        data: {
          records: lessons,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
        },
      };
      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, lessonDto: LessonDto, video: any): Promise<object> {
    try {
      const { title } = lessonDto;
      const lesson = await this.lessonRepository.findByPk(id);
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      let update: any;

      const exist = await this.lessonRepository.findOne({
        where: { title },
      });
      if (exist) {
        throw new BadRequestException('Already created');
      }
      update = await this.lessonRepository.update(
        {
          title: lessonDto.title,
          published: lessonDto.published,
          content: lessonDto.content,
        },
        {
          where: { id },
          returning: true,
        },
      );

      return update[1][0];
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: number): Promise<object> {
    try {
      const lesson = await this.lessonRepository.findByPk(id);
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      lesson.destroy();
      return {
        statusCode: HttpStatus.OK,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}