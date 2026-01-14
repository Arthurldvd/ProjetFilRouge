import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { AiGenerationService } from './ai-generation.service';

@Module({
  controllers: [QuizController],
  providers: [QuizService, AiGenerationService],
})
export class QuizModule {}

