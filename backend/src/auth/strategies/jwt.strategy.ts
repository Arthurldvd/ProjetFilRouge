// Stratégie Passport JWT pour valider les tokens d'accès
// Extrait et vérifie le JWT depuis le header Authorization

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'default-secret-change-in-production',
    });
  }

  /**
   * Appelé par Passport après validation du JWT
   * Vérifie que l'utilisateur existe toujours et est actif
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    // Retourne le payload qui sera attaché à request.user
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

