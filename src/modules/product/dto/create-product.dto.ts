import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsString,
  Length,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateProductSpecValueDto {
  @Type()
  @IsString()
  @MinLength(1)
  @ApiProperty({ default: 'orange' })
  key: string;

  @Type()
  @IsString()
  @MinLength(1)
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

export class CreateProductTranslation {
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
  @IsString()
  @Length(2, 2)
  @ApiProperty({ default: 'en' })
  lang: string;
}

export class CreateProductDto {
  @Type(() => CreateProductTranslation)
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({ type: CreateProductTranslation, isArray: true })
  translations: CreateProductTranslation[];

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

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['specs']),
) {}
