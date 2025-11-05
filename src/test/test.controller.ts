import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { TestsService } from './test.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TestsDto } from './dto/test.dto';
import { extractUserIdFromToken } from 'src/utils/token';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Tests')
@Controller('tests')
export class TestsController {
  constructor(
    private readonly testsService: TestsService,
    private readonly jwtService: JwtService,
  ) { }

  @ApiOperation({ summary: 'Create a new tests' })
  @Post('/create')
  create(
    @Body() testsDto: TestsDto,
    @Headers() headers: Record<string, string>,
  ) {
    const user_id = extractUserIdFromToken(headers, this.jwtService, true);
    return this.testsService.create(testsDto, user_id);
  }
  
  @ApiOperation({ summary: 'Get tests by ID' })
  // @UseGuards(AuthGuard)
  @Get('/:id')
  getById(@Param('id') id: number, @Headers() headers: Record<string, string>) {
    const user_id = extractUserIdFromToken(headers, this.jwtService, true);
    return this.testsService.getById(id, user_id);
  }


  @ApiOperation({ summary: 'Get tests by ID' })
  // @UseGuards(AuthGuard)
  @Get('/code/:code')
  checkCode(@Param('code') code: string, @Headers() headers: Record<string, string>) {
    const user_id = extractUserIdFromToken(headers, this.jwtService, true);
    return this.testsService.checkCode(code, user_id);
  }

  @ApiOperation({ summary: 'Get testss with pagination' })
  // @UseGuards(AuthGuard)
  @Get('pagination/:page')
  pagination(@Param('page') page: number) {
    return this.testsService.pagination(page);
  }

  @ApiOperation({ summary: 'Delete tests' })
  // @UseGuards(AuthGuard)
  @Delete(':id')
  deleteTests(@Param('id') id: number) {
    return this.testsService.delete(id);
  }
}
