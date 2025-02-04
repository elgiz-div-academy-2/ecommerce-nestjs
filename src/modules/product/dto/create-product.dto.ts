import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateProductSpecValueDto {
  @Type()
  @IsString()
  @MinLength(3)
  @ApiProperty({ default: 'orange' })
  key: string;

  @Type()
  @IsString()
  @MinLength(3)
  @ApiProperty({ default: 'Orange' })
  value: string;
}

export class CreateProductSpecDto {
  @Type()
  @IsString()
  @MinLength(3)
  @ApiProperty({ default: 'color' })
  key: string;

  @Type()
  @IsString()
  @MinLength(3)
  @ApiProperty({ default: 'Color' })
  name: string;

  @Type(() => CreateProductSpecValueDto)
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({ type: CreateProductSpecValueDto, isArray: true })
  values: CreateProductSpecValueDto[];
}

export class CreateProductDto {
  @Type()
  @IsString()
  @MinLength(3)
  @ApiProperty({ default: 'Shoes' })
  title: string;

  @Type()
  @IsString()
  @MinLength(3)
  @ApiProperty({ default: 'shoes' })
  slug: string;

  @Type()
  @IsString()
  @MinLength(3)
  @ApiProperty({ default: 'good quality' })
  description: string;

  @Type()
  @IsNumber({}, { each: true })
  @IsArray()
  @ApiProperty({ default: [] })
  categories: number[];

  @Type(() => CreateProductSpecDto)
  @ValidateNested({ each: true })
  @IsArray()
  @ApiProperty({ type: CreateProductSpecDto, isArray: true })
  specs: CreateProductSpecDto[];
}
