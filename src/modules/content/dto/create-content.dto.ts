import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsString, Length, MinLength } from 'class-validator';

export class CreateContentDto {
  @Type(() => Object)
  @IsObject()
  @ApiProperty({ default: { en: 'title', az: 'title' } })
  title: Record<string, string>;

  @Type(() => Object)
  @IsObject()
  @ApiProperty({ default: { en: 'content', az: 'content' } })
  content: Record<string, string>;

  @Type(() => Object)
  @IsObject()
  @ApiProperty({ default: { en: 'slug', az: 'slug' } })
  slug: Record<string, string>;
}
