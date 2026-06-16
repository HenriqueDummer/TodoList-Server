import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FirebaseAuthenticatedRequest } from '../types/authenticated-request';

export const CurrentFirebaseUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<FirebaseAuthenticatedRequest>();
    return request.firebaseUser;
  },
);
