// DTO pour la mise à jour d'un quiz

import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuizDto } from './create-quiz.dto';

export class UpdateAnswerDto {
  @ApiProperty({ description: 'ID de la réponse (pour mise à jour)', required: false })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ description: 'Texte de la réponse' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;

  @ApiProperty({ description: 'Indique si cette réponse est correcte' })
  @IsBoolean()
  isCorrect: boolean;
}

export class UpdateQuestionDto {
  @ApiProperty({ description: 'ID de la question (pour mise à jour)', required: false })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ description: 'Texte de la question' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  text: string;

  @ApiProperty({ description: 'Liste des réponses', type: [UpdateAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerDto)
  answers: UpdateAnswerDto[];
}

export class UpdateQuizDto extends PartialType(CreateQuizDto) {
  @ApiProperty({
    description: 'Liste des questions du quiz',
    type: [UpdateQuestionDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionDto)
  questions?: UpdateQuestionDto[];
}
