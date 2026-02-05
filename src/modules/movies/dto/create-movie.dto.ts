import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum MovieStatusDto {
  PLANNED = 'PLANNED',
  WATCHED = 'WATCHED',
}

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsInt()
  @Min(1888)
  year?: number;

  @IsOptional()
  @IsEnum(MovieStatusDto)
  status?: MovieStatusDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rating?: number;

  @IsOptional()
  @IsString()
  watchedAt?: string;
}
