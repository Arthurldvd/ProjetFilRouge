import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizService } from './quiz.service';
import type { Quiz } from './quiz.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau quiz' })
  @ApiBody({ type: CreateQuizDto })
  @ApiResponse({ status: 201, description: 'Quiz créé avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  create(@Body() createQuizDto: CreateQuizDto): Quiz {
    return this.quizService.create(createQuizDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister tous les quiz' })
  @ApiResponse({ status: 200, description: 'Liste de tous les quiz.' })
  findAll(): Quiz[] {
    return this.quizService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Récupérer un quiz par son id' })
  @ApiResponse({ status: 200, description: 'Quiz trouvé.' })
  @ApiResponse({ status: 404, description: 'Quiz introuvable.' })
  findOne(@Param('id', ParseIntPipe) id: number): Quiz {
    return this.quizService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un quiz' })
  @ApiBody({ type: UpdateQuizDto })
  @ApiResponse({ status: 200, description: 'Quiz mis à jour.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 404, description: 'Quiz introuvable.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizDto: UpdateQuizDto,
  ): Quiz {
    return this.quizService.update(id, updateQuizDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un quiz' })
  @ApiResponse({ status: 200, description: 'Quiz supprimé.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 404, description: 'Quiz introuvable.' })
  remove(@Param('id', ParseIntPipe) id: number): void {
    this.quizService.remove(id);
  }
}
  