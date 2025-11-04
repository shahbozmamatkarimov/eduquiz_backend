import { ApiProperty } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class LessonDto {
  @ApiProperty({
    example: 'Title',
    description: 'Lesson title',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: false,
    description: 'Lesson type',
  })
  @IsOptional()
  @IsBooleanString()
  published?: boolean;

  @ApiProperty({
    example: '<p>Content</p>',
    description: 'Video content',
  })
  @IsOptional()
  @IsString()
  content: string;
}
