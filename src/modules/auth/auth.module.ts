import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAuthProvider } from './firebase-auth.provider';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { LocalUserGuard } from './guards/local-user.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    FirebaseAuthProvider,
    FirebaseAuthGuard,
    LocalUserGuard,
  ],
  exports: [AuthService, FirebaseAuthGuard, LocalUserGuard],
})
export class AuthModule {}
