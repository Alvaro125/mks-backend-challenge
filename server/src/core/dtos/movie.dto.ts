import { IsString, IsNotEmpty, Min, IsInt, Max } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({
    example: 'Nome do Filme',
    description: `Nome do Filme que deseja cadastrar`,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 1999,
    description: `Ano de lançamento do Filme`,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  year: number;

  @ApiProperty({
    example: 60,
    description: `duração do filme em minutos`,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  length: number;

  @ApiProperty({
    example: 8,
    description: `Nota do Filme`,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({
    example: 'Genero',
    description: `Genero do Filme`,
  })
  @IsString()
  @IsNotEmpty()
  genre: string;
}

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
