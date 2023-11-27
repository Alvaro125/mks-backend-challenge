import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../core/dtos';
import { UsersEntity } from '../core/entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}
  async create(data: CreateUserDto) {
    try {
      const userExist = await this.findbyEmail(data.email);
      if (userExist) throw Error('Usuario com este email já existe');
      const user = this.usersRepository.create(data);
      return this.usersRepository.save(user);
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

  async findbyEmail(email: string): Promise<UsersEntity | null> {
    return await this.usersRepository.findOne({
      where: {
        email: email,
      },
    });
  }
}
