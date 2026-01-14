// DTO pour exposer les données utilisateur (sans le mot de passe)
// Utilisé dans les réponses API pour garantir la sécurité

import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class UserDto {
  @ApiProperty({ description: 'Identifiant unique de l\'utilisateur' })
  id: string;

  @ApiProperty({ description: 'Adresse email de l\'utilisateur' })
  email: string;

  @ApiProperty({ description: 'Nom d\'utilisateur' })
  username: string;

  @ApiProperty({ enum: UserRole, description: 'Rôle de l\'utilisateur' })
  role: UserRole;

  @ApiProperty({ description: 'Indique si le compte est actif' })
  isActive: boolean;

  @ApiProperty({ description: 'Date de création du compte' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  updatedAt: Date;
}

