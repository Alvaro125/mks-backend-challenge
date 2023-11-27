import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateMovieDto } from 'src/core/dtos/movie.dto';
import { AuthGuard } from 'src/middleware/auth.guard';
import { MovieService } from 'src/service/movie.service';

@ApiTags('movies')
@ApiBearerAuth()
@Controller('movies')
@UseGuards(AuthGuard)
export class MoviesController {
  constructor(private readonly movieService: MovieService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  insert(@Body() createMovieDto: CreateMovieDto, @Request() req) {
    return this.movieService.insert(createMovieDto, req.user.id);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() createMovieDto: CreateMovieDto,
  ) {
    return this.movieService.updateOne(createMovieDto, id);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Delete('/:id')
  async idDelete(@Param('id') id: string) {
    return this.movieService.deleteOne(id);
  }

  @UseInterceptors(CacheInterceptor)
  @CacheKey('custom-key')
  @CacheTTL(30)
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async getId(@Param('id') id: string) {
    return this.movieService.getId(id);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async getAll() {
    return this.movieService.listAll();
  }
}
