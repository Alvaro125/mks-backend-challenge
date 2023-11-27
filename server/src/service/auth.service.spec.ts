import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersEntity } from 'src/core/entity';
import { AuthModule, UserModule } from 'src/module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUser = new UsersEntity();
  mockUser.id = 'f3e2f253-87d5-4392-8487-7d5d8b993bac';
  mockUser.name = 'Fulano de Tal';
  mockUser.email = 'email@email.com';
  mockUser.password =
    '$2b$10$9dmwqrsTlnIiE5ZQgy2AquPovzjILnd57GfxfjkOjHX4D1k.3JRNS';

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        AuthModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [UsersEntity],
          synchronize: true,
        }),
      ],
      providers: [
        AuthService,
        UserService,
        JwtService,
        {
          provide: getRepositoryToken(UsersEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    authService = app.get<AuthService>(AuthService);
    userService = app.get<UserService>(UserService);
    jwtService = app.get<JwtService>(JwtService);
  });
  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
  describe('signIn', () => {
    it('should sign in a user and return an access token', async () => {
      // Mock the userService findOne method
      const mockUser = new UsersEntity();
      mockUser.id = 'f3e2f253-87d5-4392-8487-7d5d8b993bac';
      mockUser.name = 'Fulano de Tal';
      mockUser.email = 'email@email.com';
      mockUser.password =
        '$2b$10$9dmwqrsTlnIiE5ZQgy2AquPovzjILnd57GfxfjkOjHX4D1k.3JRNS';

      jest
        .spyOn(userService, 'findbyEmail')
        .mockImplementation(async () => mockUser);

      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      const mockAccessToken = 'mocked_access_token';
      jest
        .spyOn(jwtService, 'signAsync')
        .mockImplementation(async () => mockAccessToken);

      const result = await authService.signIn('email@email.com', 'Password@36');

      expect(userService.findbyEmail).toHaveBeenCalledWith('email@email.com');
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        'Password@36',
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.name,
      });
      expect(result).toEqual({ access_token: mockAccessToken });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest
        .spyOn(userService, 'findbyEmail')
        .mockImplementation(async () => null);
      await expect(
        authService.signIn('nonexistent@email.com', 'SomePassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if passwords do not match', async () => {
      jest.spyOn(userService, 'findbyEmail').mockImplementation(async () => {
        const mockUser = new UsersEntity();
        mockUser.id = 'f3e2f253-87d5-4392-8487-7d5d8b993bac';
        mockUser.name = 'Fulano de Tal';
        mockUser.email = 'email@email.com';
        mockUser.password =
          '$2b$10$9dmwqrsTlnIiE5ZQgy2AquPovzjILnd57GfxfjkOjHX4D1k.3JRNS';
        return mockUser;
      });
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
      await expect(
        authService.signIn('email@email.com', 'IncorrectPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
