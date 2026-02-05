import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'example_user' })
  @IsOptional()
  @IsString()
  @Length(3, 30)
  username?: string;
}
