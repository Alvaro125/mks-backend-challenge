import { MoviesEntity, UsersEntity } from 'src/core/entity';
import { MovieService } from './movie.service';
import { DeleteResult, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { MoviesModule } from 'src/module/movies.module';
import { AuthModule } from 'src/module';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('MovieService', () => {
  let movieService: MovieService;
  let moviesRepository: Repository<MoviesEntity>;
  let usersRepository: Repository<UsersEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MoviesModule,
        AuthModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [MoviesEntity, UsersEntity],
          synchronize: true,
        }),
      ],
      providers: [
        MovieService,
        JwtService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: () => 'any value',
            set: () => jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MoviesEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UsersEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    movieService = module.get<MovieService>(MovieService);
    moviesRepository = module.get<Repository<MoviesEntity>>(
      getRepositoryToken(MoviesEntity),
    );
    usersRepository = module.get<Repository<UsersEntity>>(
      getRepositoryToken(UsersEntity),
    );
  });

  describe('insert', () => {
    // it('should insert a movie', async () => {
    //   const mockUser = new UsersEntity();
    //   mockUser.id = 'f3e2f253-87d5-4392-8487-7d5d8b993bac';
    //   mockUser.name = 'Fulano de Tal';
    //   mockUser.email = 'email@email.com';
    //   mockUser.password =
    //     '$2b$10$9dmwqrsTlnIiE5ZQgy2AquPovzjILnd57GfxfjkOjHX4D1k.3JRNS';
    //   jest
    //     .spyOn(usersRepository, 'findOne')
    //     .mockImplementation(async () => mockUser);

    //   const createMovieDto = {
    //     name: 'Test Movie',
    //     genre: 'Action',
    //     length: 120,
    //     rating: 4.5,
    //     year: 2022,
    //   };

    //   const result = await movieService.insert(createMovieDto, 'user-id');

    //   expect(usersRepository.findOne).toHaveBeenCalledWith({
    //     where: { id: 'user-id' },
    //   });
    //   expect(moviesRepository.create).toHaveBeenCalledWith({
    //     ...createMovieDto,
    //     userId: mockUser,
    //   });
    //   expect(moviesRepository.save).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       userId: mockUser,
    //     }),
    //   );
    //   expect(result).toEqual(expect.objectContaining(createMovieDto));
    // });

    it('should handle errors during insert', async () => {
      jest.spyOn(usersRepository, 'findOne').mockImplementation(async () => {
        throw new Error('User not found');
      });

      const createMovieDto = {
        name: 'Test Movie',
        genre: 'Action',
        length: 120,
        rating: 4.5,
        year: 2022,
      };

      await expect(
        movieService.insert(createMovieDto, 'user-id'),
      ).rejects.toThrow('Http Exception');
    });
  });

  describe('listAll', () => {
    it('should list all movies', async () => {
      const m1 = new MoviesEntity();
      m1.id = '1';
      m1.name = 'Movie 1';
      const m2 = new MoviesEntity();
      m2.id = '2';
      m2.name = 'Movie 2';
      const mockMovies = [m1, m2];

      jest
        .spyOn(moviesRepository, 'find')
        .mockImplementation(async () => mockMovies);

      const result = await movieService.listAll();

      expect(moviesRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockMovies);
    });

    it('should handle errors during listAll', async () => {
      jest.spyOn(moviesRepository, 'find').mockImplementation(async () => {
        throw new Error('Failed to fetch movies');
      });

      await expect(movieService.listAll()).rejects.toThrow('Http Exception');
    });
  });

  describe('getId', () => {
    it('should get a movie by id', async () => {
      const mockMovie = new MoviesEntity();
      mockMovie.id = '1';
      mockMovie.name = 'Test Movie';

      jest
        .spyOn(moviesRepository, 'findOne')
        .mockImplementation(async () => mockMovie);

      const result = await movieService.getId('1');

      expect(moviesRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockMovie);
    });

    it('should handle errors during getId', async () => {
      jest.spyOn(moviesRepository, 'findOne').mockImplementation(async () => {
        throw new Error('Failed to get movie');
      });

      await expect(movieService.getId('1')).rejects.toThrow('Http Exception');
    });
  });

  describe('updateOne', () => {
    it('should update a movie', async () => {
      const mockMovie = new MoviesEntity();
      mockMovie.id = '1';
      mockMovie.name = 'Old Movie';
      mockMovie.year = 2000;
      mockMovie.length = 120;
      mockMovie.rating = 5;
      mockMovie.genre = 'Genero';

      const updateMovieDto = {
        name: 'Nome do Filme',
        year: 1999,
        length: 60,
        rating: 8,
        genre: 'Genero',
      };

      jest
        .spyOn(moviesRepository, 'findOne')
        .mockImplementation(async () => mockMovie);
      jest
        .spyOn(moviesRepository, 'save')
        .mockImplementation(async () => ({ ...mockMovie, ...updateMovieDto }));

      const result = await movieService.updateOne(updateMovieDto, '1');

      expect(moviesRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(moviesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateMovieDto),
      );
      expect(result).toEqual(expect.objectContaining(updateMovieDto));
    });

    it('should handle errors during updateOne', async () => {
      jest.spyOn(moviesRepository, 'findOne').mockImplementation(async () => {
        throw new Error('Failed to get movie');
      });

      await expect(
        movieService.updateOne(
          {
            name: 'Updated Movie',
            year: 1999,
            length: 60,
            rating: 8,
            genre: 'Genero',
          },
          '1',
        ),
      ).rejects.toThrow('Http Exception');
    });
  });

  describe('deleteOne', () => {
    it('should delete a movie', async () => {
      const mockMovie = new MoviesEntity();
      mockMovie.id = '1';
      mockMovie.name = 'Test Movie';
      mockMovie.year = 2000;
      mockMovie.length = 120;
      mockMovie.rating = 5;
      mockMovie.genre = 'Genero';

      const del: DeleteResult = {
        raw: [],
        affected: 1,
      };
      jest
        .spyOn(moviesRepository, 'delete')
        .mockImplementation(async () => del);
      jest
        .spyOn(moviesRepository, 'findOne')
        .mockImplementation(async () => mockMovie);

      const result = await movieService.deleteOne('1');
      expect(moviesRepository.delete).toHaveBeenCalledWith({ id: '1' });
      expect(result).toEqual({
        raw: [],
        affected: 1,
      });
    });

    it('should handle errors during deleteOne', async () => {
      jest.spyOn(moviesRepository, 'findOne').mockImplementation(async () => {
        throw new Error('Failed to get movie');
      });

      await expect(movieService.deleteOne('1')).rejects.toThrow(
        'Http Exception',
      );
    });
  });

  // Add similar tests for other methods (listAll, getId, updateOne, deleteOne)
});
