import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
  } from '@nestjs/common';
  import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
  import { CreateQuizDto } from './dto/create-quiz.dto';
  import { UpdateQuizDto } from './dto/update-quiz.dto';
  import { QuizService } from './quiz.service';
  import type { Quiz } from './quiz.service'; 
  
  @ApiTags('quizzes')
  @Controller('quizzes')
  export class QuizController {
    constructor(private readonly quizService: QuizService) {}
  
    @Post()
    @ApiOperation({ summary: 'Créer un nouveau quiz' })
    @ApiBody({ type: CreateQuizDto })
    @ApiResponse({ status: 201, description: 'Quiz créé avec succès.' })
    create(@Body() createQuizDto: CreateQuizDto): Quiz {
      return this.quizService.create(createQuizDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Lister tous les quiz' })
    @ApiResponse({ status: 200, description: 'Liste de tous les quiz.' })
    findAll(): Quiz[] {
      return this.quizService.findAll();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Récupérer un quiz par son id' })
    @ApiResponse({ status: 200, description: 'Quiz trouvé.' })
    @ApiResponse({ status: 404, description: 'Quiz introuvable.' })
    findOne(@Param('id', ParseIntPipe) id: number): Quiz {
      return this.quizService.findOne(id);
    }
  
    @Put(':id')
    @ApiOperation({ summary: 'Mettre à jour un quiz' })
    @ApiBody({ type: UpdateQuizDto })
    @ApiResponse({ status: 200, description: 'Quiz mis à jour.' })
    @ApiResponse({ status: 404, description: 'Quiz introuvable.' })
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateQuizDto: UpdateQuizDto,
    ): Quiz {
      return this.quizService.update(id, updateQuizDto);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer un quiz' })
    @ApiResponse({ status: 200, description: 'Quiz supprimé.' })
    @ApiResponse({ status: 404, description: 'Quiz introuvable.' })
    remove(@Param('id', ParseIntPipe) id: number): void {
      this.quizService.remove(id);
    }
  }
  