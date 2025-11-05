import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class TestsDto {
  @ApiProperty({
    example: 1,
    description: 'id of the test',
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    example: 'Quyidagi izotopda nechta proton, elektron va neytron bor? 18^F-',
    description: 'The question text',
  })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({
    example: [
      '5 proton, 4 elektron, 2 neytron',
      '4 proton, 8 elektron, 1 neytron',
      '6 proton, 1 elektron, 8 neytron'
    ],
    description: 'Answer options for the question',
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  variants: string[];

  @ApiProperty({
    example: [1],
    description: 'True answer',
  })
  @IsNotEmpty()
  @IsNumber()
  true_answer: number;

  @ApiProperty({
    example: "Test",
    description: 'True answer',
  })
  @IsNotEmpty()
  @IsString()
  type: string;
}
