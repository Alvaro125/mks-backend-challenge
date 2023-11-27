import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsStrongPassword,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Fulano de Tal',
    description: `O nome será utilizado para qualquer coisa (Perfil, Home Page, etc) que precise exibir informações da pessoa conectada.`,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'email@email.com',
    description: `O e-mail é necessário para o cadastro`,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Password@36',
    description: `É necessário informar uma senha.`,
  })
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}

export class LoginUserDto {
  @ApiProperty({
    example: 'email@email.com',
    description: `O e-mail é necessário para o login`,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Password@36',
    description: `É necessário informar uma senha relacionada ao email cadastrado`,
  })
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
