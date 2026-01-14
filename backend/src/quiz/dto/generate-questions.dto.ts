// DTO pour la génération de questions par IA

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class GenerateQuestionsDto {
  @ApiProperty({
    description: 'Thème des questions à générer',
    example: 'La révolution française',
  })
  @IsString()
  @IsNotEmpty()
  theme: string;

  @ApiProperty({
    description: 'Nombre de questions à générer (1-10)',
    example: 5,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  count: number;
}

export interface GeneratedQuestion {
  text: string;
  answers: {
    text: string;
    isCorrect: boolean;
  }[];
}

export interface GenerateQuestionsResponse {
  questions: GeneratedQuestion[];
}

