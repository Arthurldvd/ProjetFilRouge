// Module Users - Gestion des utilisateurs
// Exporté pour être utilisé par le module Auth

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exporté pour AuthModule
})
export class UsersModule {}

