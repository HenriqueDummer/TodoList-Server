import { Test, TestingModule } from '@nestjs/testing';
import type { Auth } from 'firebase-admin/auth';
import { AuthService } from './auth.service';
import { FIREBASE_AUTH } from './constants';

describe('AuthService', () => {
  let service: AuthService;
  let firebaseAuth: jest.Mocked<Pick<Auth, 'verifyIdToken'>>;

  beforeEach(async () => {
    firebaseAuth = {
      verifyIdToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FIREBASE_AUTH,
          useValue: firebaseAuth,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects a missing bearer token', async () => {
    await expect(service.verifyBearerToken()).rejects.toThrow(
      'Missing authorization header',
    );
  });

  it('rejects a malformed authorization header', async () => {
    await expect(service.verifyBearerToken('Basic token')).rejects.toThrow(
      'Invalid authorization header',
    );
  });

  it('rejects an invalid Firebase token', async () => {
    firebaseAuth.verifyIdToken.mockRejectedValue(new Error('invalid'));

    await expect(service.verifyBearerToken('Bearer token')).rejects.toThrow(
      'Invalid Firebase token',
    );
  });

  it('returns decoded Firebase identity for a valid bearer token', async () => {
    const decodedToken = {
      uid: 'firebase-user-id',
      email: 'user@example.com',
    };
    firebaseAuth.verifyIdToken.mockResolvedValue(decodedToken as never);

    await expect(service.verifyBearerToken('Bearer token')).resolves.toBe(
      decodedToken,
    );
    expect(firebaseAuth.verifyIdToken).toHaveBeenCalledWith('token');
  });
});
