import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class GetProductListDto {
  @Transform(({ value }) => value?.split(',').map((item) => +item))
  @IsNumber({}, { each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty({ default: '1,2', type: String, required: false })
  category: number[];

  @Type()
  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiProperty({ default: 1, required: false })
  minPrice: number;

  @Type()
  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiProperty({ default: 1, required: false })
  maxPrice: number;

  @IsOptional()
  @Transform(({ value }) => {
    // Convert query string to object
    if (typeof value === 'string') {
      const filters = {};
      const pairs = value.split(',');
      pairs.forEach((pair) => {
        const [key, val] = pair.split(':');
        filters[key] = val;
      });
      return filters;
    }
    return value;
  })
  filters?: Record<string, string>;
}
