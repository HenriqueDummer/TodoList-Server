import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firebaseId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  name?: string;
}
