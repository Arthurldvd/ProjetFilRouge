// DTO pour soumettre les réponses à un quiz

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitAnswerDto {
  @ApiProperty({ description: 'ID de la question' })
  @IsNumber()
  questionId: number;

  @ApiProperty({ description: 'ID de la réponse sélectionnée' })
  @IsNumber()
  answerId: number;
}

export class SubmitQuizDto {
  @ApiProperty({
    description: 'Liste des réponses de l\'utilisateur',
    type: [SubmitAnswerDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];
}

