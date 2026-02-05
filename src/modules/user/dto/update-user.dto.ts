import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsEmail, IsEnum } from "class-validator";

export class UpdateUserDto {
    @ApiPropertyOptional({ example: "example@example.com" })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: "example_user" })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiPropertyOptional({ example: "Pa$$word" })
    @IsOptional()
    @IsString()
    password_hash?: string;

    @ApiPropertyOptional({ example: "User" })
    @IsOptional()
    @IsEnum({
        ADMIN: "Admin",
        USER: "User",
    })
    role?: "Admin" | "User";

}
