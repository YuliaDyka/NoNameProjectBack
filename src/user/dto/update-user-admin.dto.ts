import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEmail, IsEnum, IsString } from 'class-validator';
import { Role } from '@/auth/roles.enum';

export class UpdateUserAdminDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Admin' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: 'hashed_password' })
  @IsOptional()
  @IsString()
  password_hash?: string;
}
