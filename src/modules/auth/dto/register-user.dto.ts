import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class UserRegisterDto {
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
