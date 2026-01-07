// Décorateur @Public() pour marquer une route comme accessible sans authentification
// Utilisé avec le guard global JWT pour contourner l'authentification

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

