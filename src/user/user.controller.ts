import { Controller, Get, UseGuards, Req, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { Role } from '@/auth/roles.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

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

  @UseGuards(JwtAuthGuard)
  @Patch()
  @ApiOperation({ summary: 'Change user data' })
  @ApiResponse({ status: 200, description: 'User data changed' })
  @ApiResponse({ status: 401, description: 'Invalid credentionals' })
  async updateUser(@Req() req: Request, @Body() dto: UpdateUserDto) {
    const user = req.user as { userId: string };
    return this.userService.update(user.userId, dto);
  }
}
