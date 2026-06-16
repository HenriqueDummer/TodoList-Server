import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Auth, DecodedIdToken } from 'firebase-admin/auth';
import { FIREBASE_AUTH } from './constants';

@Injectable()
export class AuthService {
  constructor(@Inject(FIREBASE_AUTH) private readonly firebaseAuth: Auth) {}

  async verifyBearerToken(authorization?: string): Promise<DecodedIdToken> {
    if (!authorization) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    try {
      return await this.firebaseAuth.verifyIdToken(token);
    } catch {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
