import { Test_settingsService } from './../test_settings/test_settings.service';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Tests } from './models/test.models';
import { InjectModel } from '@nestjs/sequelize';
import { TestsDto } from './dto/test.dto';
import { Sequelize } from 'sequelize-typescript';
import { CheckDto } from './dto/check.dto';
import { ReytingService } from '../reyting/reyting.service';
import { ReytingDto } from '../reyting/dto/reyting.dto';
import { FilesService } from 'src/files/files.service';
import { Test_settings } from 'src/test_settings/models/test_settings.models';
import { LessonService } from 'src/lesson/lesson.service';
import { generate } from 'otp-generator';

@Injectable()
export class TestsService {
  constructor(
    @InjectModel(Tests) private testsRepository: typeof Tests,
    private readonly reytingService: ReytingService,
    private readonly test_settingsService: Test_settingsService,
    private readonly fileService: FilesService,
    private readonly lessonService: LessonService,
  ) { }

  async create(testsDto: TestsDto, user_id: number): Promise<object> {
    try {
      // const {
      //   test,
      // } = testsDto;

      let variants: string[];

      variants = testsDto.variants;

      const code = generate(4, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      const test = await this.testsRepository.create({
        question: testsDto.question,
        variants,
        type: testsDto.type,
        true_answer: testsDto.true_answer,
        code,
        user_id,
      });


      return {
        statusCode: HttpStatus.OK,
        message: 'Created successfully',
        test,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async create_url(file: any) {
    try {
      console.log('object');
      if (file) {
        file = await this.fileService.createFile(file, 'image');
        console.log(file);
        if (file != 'error') {
          return { statusCode: HttpStatus.OK, data: file };
        } else {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Error while uploading a file',
          };
        }
      }
    } catch (error) {
      return { statusCode: HttpStatus.BAD_REQUEST, error: error.message };
    }
  }

  async getAll(class_name: number): Promise<object> {
    try {
      const tests = await this.testsRepository.findAll({
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM "lesson" WHERE "lesson"."id" = "Tests"."lesson_id" and "lesson"."class" = ${class_name})`,
              ),
              'lessonsCount',
            ],
            [
              Sequelize.literal(`(
                SELECT SUM("uploaded"."duration")
                FROM "lesson"
                INNER JOIN "video_lesson" ON "lesson"."id" = "video_lesson"."lesson_id"
                INNER JOIN "uploaded" ON "video_lesson"."video_id" = "uploaded"."id"  
                WHERE "lesson"."id" = "Tests"."lesson_id"
                AND "lesson"."class" = '${class_name}'
              )`),
              'totalDuration',
            ],
          ],
        },
      });
      return {
        statusCode: HttpStatus.OK,
        data: tests,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getLessonTestsCount(lesson_id: number): Promise<number> {
    try {
      const tests_count = await this.testsRepository.count({
        where: {}
      });
      return tests_count;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getTests(): Promise<object> {
    try {
      const testss = await this.testsRepository.findAll();
      return {
        statusCode: HttpStatus.OK,
        data: testss,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getById(id: number, user_id: number) {
    try {
      const tests = await this.testsRepository.findByPk(id, {
        attributes: { exclude: ['true_answer'] },
      });

      if (!tests) {
        throw new NotFoundException('Tests not found');
      }

      return tests;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getByIdWithAnswer(id: number, user_id: number) {
    try {
      const tests = await this.testsRepository.findByPk(id);

      if (!tests) {
        throw new NotFoundException('Tests not found');
      }

      return tests;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async checkCode(code: string, user_id: number) {
    try {
      const tests = await this.testsRepository.findOne({
        where: { code }
      });

      if (!tests) {
        throw new NotFoundException('Tests not found');
      }

      return true;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async checkById(id: number, answer: string): Promise<object> {
    try {
      const test = await this.testsRepository.findByPk(id);

      if (!test) {
        throw new NotFoundException('Tests not found');
      }
      let t = 0;
      let true_list = [];
      console.log(answer);
      if (!answer || !answer?.length || !answer[0]) {
        return [id, [false], test];
      }
      if (test.type == 'fill') {
        for (let i of test.variants) {
          if (this.containsAnswer(i.toString()) == this.containsAnswer(answer[0])) {
            return [id, [true]];
          }
        }
        return [id, [false], test];
      } else {
        // for (let i of test.true_answer) {
        //   if (test.variants[i] == answer[0][t]) {
        //     true_list.push(true);
        //   } else {
        //     true_list.push(false);
        //   }
        //   t++;
        // }
      }
      if (!true_list?.length) {
        true_list.push(false, test);
      }
      return [id, true_list, test];
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async checkAnswers(
    code: string,
    true_answer: number
  ): Promise<boolean> {
    try {
      const test = await this.testsRepository.findOne({
        where: { code }
      });

      if (!test) {
        throw new NotFoundException('Tests not found');
      }

      if (test.true_answer == true_answer) {
        return true;
      }
      return false;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // async getByTitle(title: string): Promise<object> {
  //   try {
  //     const tests = await this.testsRepository.findOne({
  //       where: { title },
  //     });
  //     if (!tests) {
  //       throw new NotFoundException('Tests not found');
  //     }
  //     return {
  //       statusCode: HttpStatus.OK,
  //       data: tests,
  //     };
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  async pagination(page: number): Promise<object> {
    try {
      const offset = (page - 1) * 10;
      const limit = 10;
      const testss = await this.testsRepository.findAll({ offset, limit });
      const total_count = await this.testsRepository.count();
      const total_pages = Math.ceil(total_count / 10);
      const response = {
        statusCode: HttpStatus.OK,
        data: {
          records: testss,
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

  // async update(id: number, questionDto: QuestionDto): Promise<object> {
  //   try {
  //     const tests = await this.testsRepository.findByPk(id);
  //     if (!tests) {
  //       throw new NotFoundException('Tests not found');
  //     }
  //     const update = await this.testsRepository.update(questionDto, {
  //       where: { id },
  //       returning: true,
  //     });
  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: 'Updated successfully',
  //       data: {
  //         tests: update[1][0],
  //       },
  //     };
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  async delete(id: number): Promise<object> {
    try {
      const tests = await this.testsRepository.findByPk(id);
      if (!tests) {
        throw new NotFoundException('Tests not found');
      }
      tests.destroy();
      return {
        statusCode: HttpStatus.OK,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Function to shuffle an array
  private shuffle(array: any[]): any[] {
    const shuffledArray = [...array];
    const data = [];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  }

  private maskMentions(html: string): string {
    let mentionCount = 0; // Nechta mention uchraganini sanash uchun
    return html.replace(
      /(<span[^>]*data-type="mention"[^>]*>)(@[\w👆🏾]+)(<\/span>)/g,
      (match, startTag, mentionText, endTag) => {
        mentionCount++; // Har bir uchragan mention uchun +1
        return `${startTag}<span>${mentionCount}</span>......${endTag}`;
      }
    );
  }

  private checkAnswerList(list: boolean[]): boolean {
    return list.every(item => item === true);
  }

  private containsAnswer(htmlString: string) {
    const textContent = htmlString.replace(/<[^>]*>/g, '').trim();
    return textContent.toLowerCase();
  }
}
