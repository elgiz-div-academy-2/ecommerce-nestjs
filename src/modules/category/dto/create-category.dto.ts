import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @Type()
  @IsString()
  @MinLength(3)
  @ApiProperty({ default: 'elektronika', required: false })
  name: string;

  @Type()
  @IsString()
  @MinLength(3)
  @ApiProperty({ default: 'elektronika', required: false })
  slug: string;

  @Type()
  @IsOptional()
  @ApiProperty({ default: null })
  @IsInt()
  @Min(1)
  parentId: number;
}
