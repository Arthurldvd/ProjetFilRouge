// Contrôleur d'authentification
// Endpoints publics pour register/login/refresh
// Endpoint protégé pour récupérer le profil

import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto, RefreshResponseDto } from './dto/auth-response.dto';
import { UserDto } from '../users/dto/user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from './strategies/jwt.strategy';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 409,
    description: 'Email ou nom d\'utilisateur déjà utilisé',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Identifiants invalides',
  })
  @ApiResponse({
    status: 403,
    description: 'Compte désactivé',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Rafraîchissement du token d\'accès' })
  @ApiResponse({
    status: 200,
    description: 'Nouveau token généré',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token invalide ou expiré',
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Déconnexion',
    description:
      'Invalide la session côté client. Le refresh token doit être supprimé côté client.',
  })
  @ApiResponse({
    status: 200,
    description: 'Déconnexion réussie',
  })
  async logout(): Promise<{ message: string }> {
    // Note: Pour une implémentation complète, on pourrait blacklister le token
    // ou utiliser Redis pour stocker les tokens révoqués
    return { message: 'Déconnexion réussie' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer le profil de l\'utilisateur connecté' })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur',
    type: UserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  async getProfile(@CurrentUser() user: JwtPayload): Promise<UserDto> {
    return this.authService.getCurrentUser(user.sub);
  }
}

