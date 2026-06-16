import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { User } from '../../../../generated/prisma/client';

export type FirebaseAuthenticatedRequest = Request & {
  firebaseUser: DecodedIdToken;
};

export type AuthenticatedRequest = FirebaseAuthenticatedRequest & {
  user: User;
};
