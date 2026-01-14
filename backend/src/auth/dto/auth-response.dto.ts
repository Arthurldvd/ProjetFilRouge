// DTOs pour les réponses d'authentification

import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto';

export class AuthResponseDto {
  @ApiProperty({ description: 'Token d\'accès JWT (expire en 15 minutes)' })
  accessToken: string;

  @ApiProperty({ description: 'Token de rafraîchissement (expire en 7 jours)' })
  refreshToken: string;

  @ApiProperty({ description: 'Données de l\'utilisateur connecté' })
  user: UserDto;
}

export class RefreshResponseDto {
  @ApiProperty({ description: 'Nouveau token d\'accès JWT' })
  accessToken: string;
}

