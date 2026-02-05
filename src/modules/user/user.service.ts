import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as fs from 'fs';
import * as path from 'path';

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
    avatarUrl: user?.avatarUrl, // 👈 ВАЖЛИВО
    createdAt: user?.createdAt,
    updatedAt: user?.updatedAt,
  };
};


  async updateProfile(id: string, data: UpdateProfileDto) {
  if (!data.username)
    throw new BadRequestException('Nothing to update');

  return this.prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async updateAvatar(userId: string, filename: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });

  // 🧹 видалити старий аватар
  if (user?.avatarUrl) {
    const oldAvatarPath = path.join(
      process.cwd(),
      user.avatarUrl.replace('/', ''),
    );

    if (fs.existsSync(oldAvatarPath)) {
      try {
        fs.unlinkSync(oldAvatarPath);
      } catch (err) {
        console.warn('Failed to delete old avatar:', err);
      }
    }
  }



  // 💾 зберегти новий шлях
  return this.prisma.user.update({
    where: { id: userId },
    data: {
      avatarUrl: `/uploads/avatars/${filename}`,
    },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      updatedAt: true,
    },
  });
}

async deleteAvatar(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });

  if (user?.avatarUrl) {
    const filePath = path.join(
      process.cwd(),
      user.avatarUrl.replace('/', ''),
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  return this.prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
    },
  });
}


}
