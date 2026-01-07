// Service d'authentification
// Gère l'inscription, la connexion et le rafraîchissement des tokens

import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, RefreshResponseDto } from './dto/auth-response.dto';
import { UserDto } from '../users/dto/user.dto';
import type { JwtPayload } from './strategies/jwt.strategy';
import type { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  // Durées d'expiration des tokens
  private readonly ACCESS_TOKEN_EXPIRATION = '15m';
  private readonly REFRESH_TOKEN_EXPIRATION = '7d';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Inscription d'un nouvel utilisateur
   * Crée l'utilisateur et génère les tokens JWT
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, username } = registerDto;

    // Création de l'utilisateur (le service vérifie les doublons)
    const user = await this.usersService.create(email, username, password);

    // Génération des tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Connexion utilisateur
   * Vérifie les credentials et retourne les tokens
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Recherche de l'utilisateur par email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Vérification que le compte est actif
    if (!user.isActive) {
      throw new ForbiddenException('Ce compte a été désactivé');
    }

    // Vérification du mot de passe
    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Mise à jour du timestamp
    await this.usersService.touch(user.id);

    // Génération des tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Rafraîchissement du token d'accès
   * Vérifie le refresh token et génère un nouveau access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponseDto> {
    try {
      // Vérification et décodage du refresh token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret:
            process.env.JWT_REFRESH_SECRET ||
            'default-refresh-secret-change-in-production',
        },
      );

      // Vérification que l'utilisateur existe toujours
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Token invalide');
      }

      // Génération d'un nouveau access token uniquement
      const accessToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          expiresIn: this.ACCESS_TOKEN_EXPIRATION,
        },
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedException(
        'Token de rafraîchissement invalide ou expiré',
      );
    }
  }

  /**
   * Récupère le profil de l'utilisateur courant
   */
  async getCurrentUser(userId: string): Promise<UserDto> {
    const user = await this.usersService.findByIdOrFail(userId);
    return this.sanitizeUser(user);
  }

  /**
   * Génère une paire access token / refresh token
   */
  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: userId,
      email,
      role: role as JwtPayload['role'],
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.ACCESS_TOKEN_EXPIRATION,
      }),
      this.jwtService.signAsync(payload, {
        secret:
          process.env.JWT_REFRESH_SECRET ||
          'default-refresh-secret-change-in-production',
        expiresIn: this.REFRESH_TOKEN_EXPIRATION,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Supprime le mot de passe des données utilisateur
   */
  private sanitizeUser(user: User): UserDto {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

