import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { CreateMovieDto } from 'src/core/dtos';
import { MoviesEntity, UsersEntity } from 'src/core/entity';
import { Repository } from 'typeorm';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(MoviesEntity)
    private readonly moviesRepository: Repository<MoviesEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}
  async insert(data: CreateMovieDto, userId: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          id: userId,
        },
      });
      const dtmovie = {
        ...data,
        userId: user,
      };
      const movie = this.moviesRepository.create(dtmovie);
      return this.moviesRepository.save(movie);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: error.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          cause: error,
        },
      );
    }
  }

  async listAll() {
    try {
      return await this.moviesRepository.find();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: error.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          cause: error,
        },
      );
    }
  }

  async getId(id: string) {
    try {
      const cachedData = await this.cacheService.get<{ name: string }>(id);
      if (cachedData) {
        console.log(`Getting data from cache!`);
        return cachedData;
      }
      const data = await this.moviesRepository.findOne({
        where: {
          id: id,
        },
      });
      await this.cacheService.set(id, data);
      return data;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: error.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          cause: error,
        },
      );
    }
  }

  async updateOne(data: CreateMovieDto, id: string) {
    try {
      const movie = await this.moviesRepository.findOne({
        where: {
          id: id,
        },
      });

      movie.genre = data.genre;
      movie.length = data.length;
      movie.name = data.name;
      movie.rating = data.rating;
      movie.year = data.year;

      return this.moviesRepository.save(movie);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: error.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          cause: error,
        },
      );
    }
  }

  async deleteOne(id: string) {
    try {
      const result = await this.moviesRepository.delete({
        id: id,
      });
      if (result.affected == 0) throw new Error('Movie not found');
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: error.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          cause: error,
        },
      );
    }
  }
}
