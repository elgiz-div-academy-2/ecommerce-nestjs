import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateCategoryTranslations {
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
  @IsString()
  @ApiProperty({ default: 'en', required: true })
  lang: string;
}
export class CreateCategoryDto {
  @Type()
  @IsOptional()
  @ApiProperty({ default: null })
  @IsInt()
  @Min(1)
  parentId: number;

  @Type(() => CreateCategoryTranslations)
  @ValidateNested({ each: true })
  @ApiProperty({ type: CreateCategoryTranslations, isArray: true })
  translations: CreateCategoryTranslations[];
}
