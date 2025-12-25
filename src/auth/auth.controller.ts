import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { type Response, type Request } from 'express';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePassordDto as ChangePasswordDto } from './dto/changePassword.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Invalid dto' })
  @ApiResponse({ status: 409, description: 'Email is already in use' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.register(
      dto.username,
      dto.email,
      dto.password,
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });

    return { message: 'Registered' };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 201, description: 'User logined' })
  @ApiResponse({ status: 400, description: 'Invalid dto' })
  @ApiResponse({ status: 401, description: 'Invalid credentionals' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto.email, dto.password);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });

    return { message: 'Logged in' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token from cookie' })
  @ApiResponse({ status: 201, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid credentionals' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookie = req.cookies['refreshToken'];
    if (!cookie) throw new UnauthorizedException();

    const tokens = await this.authService.refreshTokens(cookie);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });

    return { message: 'Token Refreshed' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('changepassword')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 201, description: 'Password changed' })
  @ApiResponse({ status: 400, description: 'Invalid dto' })
  @ApiResponse({ status: 401, description: "Old password didn't match" })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changePasswor(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const user = req.user as { userId: string };
    await this.authService.changePassword(
      user.userId,
      dto.oldPassword,
      dto.password,
    );

    return { message: 'Password updated' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Log out user' })
  @ApiResponse({ status: 201, description: 'Logged out' })
  @ApiResponse({ status: 401, description: 'Invalid credentionals' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as { userId: string };
    await this.authService.logout(user.userId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { message: 'Logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout/delete')
  @ApiOperation({ summary: 'Log out user and delete account' })
  @ApiResponse({ status: 201, description: 'Logged out and deleted' })
  @ApiResponse({ status: 201, description: 'Logged out' })
  @ApiResponse({ status: 401, description: 'Invalid credentionals' })
  async logoutDelete(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as { userId: string };
    await this.authService.logoutDelete(user.userId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { message: 'Logged out and deleted' };
  }
}
