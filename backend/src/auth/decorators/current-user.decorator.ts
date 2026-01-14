// Décorateur @CurrentUser() pour récupérer l'utilisateur depuis la requête
// Utilisation : @CurrentUser() user: JwtPayload

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // Si une propriété spécifique est demandée, la retourner
    if (data) {
      return user[data] as string;
    }

    return user;
  },
);

