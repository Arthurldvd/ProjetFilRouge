// Service responsable de la gestion des utilisateurs
// Utilise un stockage en mémoire (prêt pour migration vers DB)

import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  // Stockage temporaire en mémoire
  // À remplacer par TypeORM/Prisma dans une future itération
  private users: User[] = [];

  private readonly SALT_ROUNDS = 10;

  /**
   * Crée un nouvel utilisateur avec mot de passe hashé
   */
  async create(
    email: string,
    username: string,
    password: string,
    role: UserRole = UserRole.USER,
  ): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingByEmail = await this.findByEmail(email);
    if (existingByEmail) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Vérifier si le username existe déjà
    const existingByUsername = await this.findByUsername(username);
    if (existingByUsername) {
      throw new ConflictException(
        'Un utilisateur avec ce nom d\'utilisateur existe déjà',
      );
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const now = new Date();
    const user = new User({
      id: randomUUID(),
      email,
      username,
      password: hashedPassword,
      role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    this.users.push(user);
    return user;
  }

  /**
   * Recherche un utilisateur par email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) || null;
  }

  /**
   * Recherche un utilisateur par nom d'utilisateur
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.users.find((user) => user.username === username) || null;
  }

  /**
   * Recherche un utilisateur par ID
   */
  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null;
  }

  /**
   * Récupère un utilisateur par ID (lève une exception si non trouvé)
   */
  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }

  /**
   * Vérifie si le mot de passe correspond au hash stocké
   */
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Récupère tous les utilisateurs (admin only)
   */
  async findAll(): Promise<User[]> {
    return this.users;
  }

  /**
   * Met à jour le timestamp updatedAt d'un utilisateur
   */
  async touch(userId: string): Promise<void> {
    const user = await this.findByIdOrFail(userId);
    user.updatedAt = new Date();
  }
}

