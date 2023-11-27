import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesController } from 'src/controller/movies.controller';
import { UsersEntity } from 'src/core/entity';
import { MoviesEntity } from 'src/core/entity/movie.entity';
import { MovieService } from 'src/service/movie.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MoviesEntity, UsersEntity]),
    CacheModule.register(),
  ],
  providers: [MovieService],
  controllers: [MoviesController],
  exports: [MovieService],
})
export class MoviesModule {}
