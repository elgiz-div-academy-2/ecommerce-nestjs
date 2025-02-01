import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class UserLoginDto {
  @Type()
  @IsEmail()
  @ApiProperty({ default: 'john@doe.com' })
  email: string;

  @Type()
  @IsString()
  @ApiProperty({ default: '123456' })
  @MinLength(6)
  password: string;
}
