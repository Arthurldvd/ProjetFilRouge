import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateQuizDto {
  @ApiProperty({
    description: 'Titre du quiz',
    example: 'Quiz NestJS de base',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Description du quiz',
    example: 'Un quiz pour tester vos connaissances sur NestJS.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Indique si le quiz est publié',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean = false;
}

