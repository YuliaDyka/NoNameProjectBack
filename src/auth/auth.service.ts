import {
    NotFoundException,
    ConflictException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "@/user/user.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) {}

    async register(username: string, email: string, password: string) {
        let user = await this.usersService.findByEmail(email);
        const hashed = await bcrypt.hash(password, 10);

        if (user) throw new ConflictException("Email is already in use");

        user = await this.usersService.create({
            username,
            email,
            password_hash: hashed,
            role: "User",
        });

        const tokens = await this.getTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException("User not found");

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) throw new UnauthorizedException("Invalid credentials");

        const tokens = await this.getTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    async refreshTokens(refreshToken: string) {
        const payload = await this.verifyRefreshToken(refreshToken);
        const user = await this.usersService.findById(payload.sub);
        if (!user || !user.refreshToken) throw new UnauthorizedException();
        const valid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!valid) throw new UnauthorizedException("Invalid refresh token");

        const tokens = await this.getTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    async changePassword(user_id: string, oldPassword: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { id: user_id } });
        if (!user) throw new NotFoundException("User not found")

        const valid = await bcrypt.compare(oldPassword, user.password_hash);
        if (!valid) throw new UnauthorizedException("Old password didn't match")

        const hashed = await bcrypt.hash(password, 10);
        return this.usersService.update(user_id, {password_hash: hashed});
    }

    async logout(userId: string) {
        return this.usersService.updateRefreshToken(userId, {
            refreshToken: null,
        });
    }

    async logoutDelete(userId: string) {
        await this.usersService.updateRefreshToken(userId, {
            refreshToken: null,
        });
        return this.usersService.delete(userId);
    }

    private async getTokens(userId: string, email: string, role) {
        const payload = { sub: userId, email, role };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET || 'super-secret',
            expiresIn: "15m",
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: "7d",
            secret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
        });

        return { accessToken, refreshToken };
    }

    private async updateRefreshToken(userId: string, refreshToken: string) {
        const hashed = await bcrypt.hash(refreshToken, 10);
        await this.usersService.updateRefreshToken(userId, {
            refreshToken: hashed,
        });
    }

    private async verifyRefreshToken(token: string) {
        try {
            return this.jwtService.verify(token, {
                secret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
            });
        } catch (e) {
            throw new UnauthorizedException("Invalid refresh token");
        }
    }
}
