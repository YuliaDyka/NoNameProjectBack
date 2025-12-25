import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class ChangePassordDto {
    @ApiProperty({ example: "StrongPass123" })
    @IsString()
    @MinLength(4)
    password: string;

    @ApiProperty({ example: "StrongPass123" })
    @IsString()
    @MinLength(4)
    oldPassword: string;
}
