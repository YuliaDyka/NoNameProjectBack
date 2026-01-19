import { Controller, Get, UseGuards, Req, Patch, Body, BadRequestException, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { Role } from '@/auth/roles.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  UseInterceptors,
  UploadedFile,
  Post,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarMulterOptions } from './multer-avatar.config';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get loggined user' })
  @ApiResponse({ status: 200, description: 'Returns user data' })
  @ApiResponse({ status: 401, description: 'Invalid credentionals' })
  async getMe(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.userService.findByIdSafe(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users' })
  @ApiResponse({ status: 401, description: 'Invalid credentionals' })
  @ApiResponse({ status: 403, description: 'Do not have permission' })
  async getAll() {
    return this.userService.findAll();
  }

  // @UseGuards(JwtAuthGuard)
  // @Patch()
  // @ApiOperation({ summary: 'Change user data' })
  // @ApiResponse({ status: 200, description: 'User data changed' })
  // @ApiResponse({ status: 401, description: 'Invalid credentionals' })
  // async updateUser(@Req() req: Request, @Body() dto: UpdateUserDto) {
  //   const user = req.user as { userId: string };
  //   return this.userService.update(user.userId, dto);
  // }

  @UseGuards(JwtAuthGuard)
@Patch('me')
async updateMe(
  @Req() req: Request,
  @Body() dto: UpdateProfileDto,
) {
  const user = req.user as { userId: string };
  return this.userService.updateProfile(user.userId, dto);
}

@UseGuards(JwtAuthGuard)
@Post('me/avatar')
@UseInterceptors(FileInterceptor('avatar', avatarMulterOptions))
async uploadAvatar(
  @Req() req: Request,
  @UploadedFile() file: Express.Multer.File,
) {
  const user = req.user as { userId: string };

  if (!file) {
    throw new BadRequestException('File is required');
  }

  return this.userService.updateAvatar(user.userId, file.filename);
}

@UseGuards(JwtAuthGuard)
@Delete('me/avatar')
async deleteAvatar(@Req() req: Request) {
  const user = req.user as { userId: string };
  return this.userService.deleteAvatar(user.userId);
}
}




