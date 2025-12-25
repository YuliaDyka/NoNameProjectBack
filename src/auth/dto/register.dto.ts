import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @ApiProperty({ example: "Some username" })
    @IsString()
    username: string;

    @ApiProperty({ example: "user@example.com" })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "StrongPass123" })
    @IsString()
    @MinLength(4)
    password: string;
}
