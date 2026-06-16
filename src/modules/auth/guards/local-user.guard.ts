import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuthService } from '../auth.service';
import type { AuthenticatedRequest } from '../types/authenticated-request';

@Injectable()
export class LocalUserGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const firebaseUser = await this.authService.verifyBearerToken(
      request.headers.authorization,
    );

    const user = await this.prisma.user.findUnique({
      where: { firebaseId: firebaseUser.uid },
    });

    if (!user) {
      throw new NotFoundException('Local user was not found. Register first.');
    }

    request.firebaseUser = firebaseUser;
    request.user = user;

    return true;
  }
}
