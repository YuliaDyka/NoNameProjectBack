import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { type Request } from 'express';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';

@ApiTags('Movies')
@UseGuards(JwtAuthGuard)
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @ApiOperation({ summary: 'Create movie' })
  @ApiResponse({ status: 201, description: 'Movie created' })
  async create(@Req() req: Request, @Body() dto: CreateMovieDto) {
    console.log('REQ.USER:', req.user);
    const user = req.user as { userId: string };
    return this.movieService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user movies' })
  @ApiResponse({ status: 200, description: 'Returns movies list' })
  async findAll(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.movieService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get movie by id' })
  @ApiResponse({ status: 200, description: 'Returns movie' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { userId: string };
    return this.movieService.findById(user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update movie' })
  @ApiResponse({ status: 200, description: 'Movie updated' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: Partial<CreateMovieDto>,
  ) {
    const user = req.user as { userId: string };
    return this.movieService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete movie' })
  @ApiResponse({ status: 200, description: 'Movie deleted' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { userId: string };
    return this.movieService.delete(user.userId, id);
  }
}
