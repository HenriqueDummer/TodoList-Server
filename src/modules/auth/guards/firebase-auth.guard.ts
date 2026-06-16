import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import type { FirebaseAuthenticatedRequest } from '../types/authenticated-request';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FirebaseAuthenticatedRequest>();
    request.firebaseUser = await this.authService.verifyBearerToken(
      request.headers.authorization,
    );

    return true;
  }
}
