// Entité User représentant un utilisateur dans le système
// Pour l'instant stocké en mémoire, prêt pour une future intégration TypeORM/Prisma

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class User {
  id: string;
  email: string;
  username: string;
  password: string; // Hashé avec bcrypt
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

