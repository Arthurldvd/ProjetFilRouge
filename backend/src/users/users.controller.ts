// Contrôleur pour les opérations liées aux utilisateurs
// Les endpoints sont protégés par authentification JWT

import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs',
    type: [UserDto],
  })
  @ApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async findAll(): Promise<UserDto[]> {
    const users = await this.usersService.findAll();
    // Ne jamais exposer le mot de passe
    return users.map(
      ({ password: _, ...userWithoutPassword }) => userWithoutPassword,
    );
  }
}

