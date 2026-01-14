// DTO pour la connexion utilisateur

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Adresse email de l\'utilisateur',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe de l\'utilisateur',
    example: 'Password123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;
}

