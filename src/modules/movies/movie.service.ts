import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';

@Injectable()
export class MovieService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateMovieDto) {
    return this.prisma.movie.create({
      data: {
        ...data,
        userId,
      },
    });
  }
  async findAll(userId: string) {
    return this.prisma.movie.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  async findById(userId: string, id: string) {
    const movie = await this.prisma.movie.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!movie) throw new BadRequestException('Movie not found');

    return movie;
  }
  async delete(userId: string, id: string) {
    const movie = await this.findById(userId, id);

    return this.prisma.movie.delete({
      where: { id: movie.id },
    });
  }
  async update(userId: string, id: string, data: Partial<CreateMovieDto>) {
    if (Object.keys(data).length === 0)
      throw new BadRequestException('Nothing to update');

    await this.findById(userId, id);

    return this.prisma.movie.update({
      where: { id },
      data,
    });
  }

  async updatePoster(movieId: string, filename: string) {
    return this.prisma.movie.update({
      where: { id: movieId },
      data: {
        posterUrl: filename,
      },
    });
  }
  async deletePoster(movieId: string) {
    return this.prisma.movie.update({
      where: { id: movieId },
      data: {
        posterUrl: null,
      },
    });
  }
}
