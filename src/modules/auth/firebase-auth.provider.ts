import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FIREBASE_AUTH } from './constants';

export const FirebaseAuthProvider: Provider = {
  provide: FIREBASE_AUTH,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const projectId = configService.getOrThrow<string>('FIREBASE_PROJECT_ID');
    const clientEmail = configService.getOrThrow<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = configService
      .getOrThrow<string>('FIREBASE_PRIVATE_KEY')
      .replace(/\\n/g, '\n');

    const app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

    return getAuth(app);
  },
};
