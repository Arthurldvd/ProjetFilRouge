// Contrôleur Quiz - CRUD et gameplay
// Routes publiques pour consulter, routes protégées pour créer/modifier

import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import {
  GenerateQuestionsDto,
  GenerateQuestionsResponse,
} from './dto/generate-questions.dto';
import { QuizService } from './quiz.service';
import { AiGenerationService } from './ai-generation.service';
import type { Quiz, QuizResult } from './quiz.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly aiGenerationService: AiGenerationService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau quiz' })
  @ApiBody({ type: CreateQuizDto })
  @ApiResponse({ status: 201, description: 'Quiz créé avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  create(
    @Body() createQuizDto: CreateQuizDto,
    @CurrentUser() user: JwtPayload,
  ): Quiz {
    return this.quizService.create(createQuizDto, user.sub);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lister tous les quiz publiés' })
  @ApiResponse({ status: 200, description: 'Liste des quiz publiés.' })
  findAll(): Quiz[] {
    return this.quizService.findPublished();
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister mes quiz (publiés et brouillons)' })
  @ApiResponse({ status: 200, description: 'Liste des quiz de l\'utilisateur.' })
  findMyQuizzes(@CurrentUser() user: JwtPayload): Quiz[] {
    return this.quizService.findByAuthor(user.sub);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister tous les quiz (admin/créateur)' })
  @ApiResponse({ status: 200, description: 'Liste de tous les quiz.' })
  findAllAdmin(): Quiz[] {
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

  @Get(':id/play')
  @Public()
  @ApiOperation({ summary: 'Récupérer un quiz pour jouer (sans les réponses correctes)' })
  @ApiResponse({ status: 200, description: 'Quiz prêt à jouer.' })
  @ApiResponse({ status: 404, description: 'Quiz introuvable.' })
  findOneForPlay(@Param('id', ParseIntPipe) id: number) {
    return this.quizService.findOneForPlay(id);
  }

  @Post(':id/submit')
  @Public()
  @ApiOperation({ summary: 'Soumettre les réponses à un quiz' })
  @ApiBody({ type: SubmitQuizDto })
  @ApiResponse({ status: 200, description: 'Résultat du quiz.' })
  @ApiResponse({ status: 404, description: 'Quiz introuvable.' })
  submitQuiz(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitQuizDto: SubmitQuizDto,
  ): QuizResult {
    return this.quizService.submitAnswers(id, submitQuizDto.answers);
  }

  @Post('generate-questions')
  @Public()
  @ApiOperation({ summary: 'Générer des questions avec l\'IA' })
  @ApiBody({ type: GenerateQuestionsDto })
  @ApiResponse({
    status: 201,
    description: 'Questions générées avec succès.',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 500, description: 'Erreur lors de la génération.' })
  async generateQuestions(
    @Body() generateQuestionsDto: GenerateQuestionsDto,
  ): Promise<GenerateQuestionsResponse> {
    return this.aiGenerationService.generateQuestions(
      generateQuestionsDto.theme,
      generateQuestionsDto.count,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un quiz' })
  @ApiBody({ type: UpdateQuizDto })
  @ApiResponse({ status: 200, description: 'Quiz mis à jour.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Vous n\'êtes pas le propriétaire.' })
  @ApiResponse({ status: 404, description: 'Quiz introuvable.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizDto: UpdateQuizDto,
    @CurrentUser() user: JwtPayload,
  ): Quiz {
    // Vérifier que l'utilisateur est le propriétaire
    if (!this.quizService.isOwner(id, user.sub)) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce quiz');
    }
    return this.quizService.update(id, updateQuizDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un quiz' })
  @ApiResponse({ status: 200, description: 'Quiz supprimé.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Vous n\'êtes pas le propriétaire.' })
  @ApiResponse({ status: 404, description: 'Quiz introuvable.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): void {
    // Vérifier que l'utilisateur est le propriétaire
    if (!this.quizService.isOwner(id, user.sub)) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce quiz');
    }
    this.quizService.remove(id);
  }
}
