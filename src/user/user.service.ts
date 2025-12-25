import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}
      async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByIdSafe(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return this.getSafeUserData(user);
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.getSafeUserData(user));
  }

  async updateRefreshToken(
    id: string,
    data: Partial<{ refreshToken: string | null }>,
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async update(id: string, data: UpdateUserDto) {
    if (
      data.username === undefined &&
      data.email === undefined &&
      data.role === undefined &&
      data.password_hash === undefined
    )
      throw new BadRequestException('You need to specify at least one field');

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  private getSafeUserData = (user: any) => {
    return {
      id: user?.id,
      username: user?.username,
      email: user?.email,
      role: user?.role,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
    };
  };
}
