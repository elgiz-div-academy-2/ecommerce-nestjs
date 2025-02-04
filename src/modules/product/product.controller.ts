import { Body, Controller, Param, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';
import { UpsertProductVariantDto } from './dto/upsert-product-variant.dto';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  @Auth(UserRole.ADMIN)
  createProduct(@Body() body: CreateProductDto) {
    return this.productService.createProduct(body);
  }

  @Post(':id/variant')
  @Auth(UserRole.ADMIN)
  upsertVariant(
    @Param('id') id: number,
    @Body() body: UpsertProductVariantDto,
  ) {
    return this.productService.upsertVariant(id, body);
  }
}
