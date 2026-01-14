// DTO pour la création d'un quiz avec questions à choix multiples

import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAnswerDto {
  @ApiProperty({
    description: 'Texte de la réponse',
    example: 'NestJS est un framework Node.js',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;

  @ApiProperty({
    description: 'Indique si cette réponse est correcte',
    example: true,
  })
  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @ApiProperty({
    description: 'Texte de la question',
    example: 'Qu\'est-ce que NestJS ?',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  text: string;

  @ApiProperty({
    description: 'Liste des réponses possibles',
    type: [CreateAnswerDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(2, { message: 'Une question doit avoir au moins 2 réponses' })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];
}

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

  @ApiProperty({
    description: 'Liste des questions du quiz',
    type: [CreateQuestionDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}
