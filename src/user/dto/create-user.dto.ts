import { IsString, IsOptional, IsEmail, IsEnum } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    username: string;

    @IsString()
    password_hash: string;

    @IsOptional()
    @IsEnum({
        ADMIN: "Admin",
        USER: "User",
    })
    role: "Admin" | "User" = "User";
}
