import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpsertProductVariantDto } from './dto/upsert-product-variant.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  createProduct(params: CreateProductDto) {
    const categories = params.categories.map((categoryId) => ({
      id: categoryId,
    }));

    const specs = params.specs.map((spec) => ({
      ...spec,
      values: { create: spec.values },
    }));

    return this.prisma.product.create({
      data: {
        ...params,
        categories: { connect: categories },
        specs: { create: specs },
      },
      include: {
        specs: {
          include: {
            values: true,
          },
        },
      },
    });
  }

  async upsertVariant(id: number, params: UpsertProductVariantDto) {
    let product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        specs: {
          include: {
            values: true,
          },
        },
        variants: {
          include: {
            specs: true,
          },
        },
      },
    });
    if (!product) throw new NotFoundException('Product is not found');

    let productSpecCheck = params.specs.every((paramSpec) => {
      return product.specs.some((productSpec) => {
        let keyCheck = productSpec.key === paramSpec.key;

        if (keyCheck) {
          return productSpec.values.some((specValue) => {
            return specValue.key === paramSpec.value;
          });
        }

        return false;
      });
    });

    if (!productSpecCheck)
      throw new BadRequestException(
        "This specifation for product doesn't exists",
      );

    let variantCheck = product.variants.find((productVariant) => {
      return productVariant.specs.every((item) => {
        return params.specs.some((element) => {
          return item.key === element.key && item.value === element.value;
        });
      });
    });

    if (variantCheck) {
      let result = await this.prisma.productVariant.update({
        where: { id: variantCheck.id },
        data: {
          ...params,
          specs: undefined,
        },
      });

      return {
        message: 'Product variant is updated',
        variant: result,
      };
    } else {
      let result = await this.prisma.productVariant.create({
        data: {
          ...params,
          productId: product.id,
          specs: {
            create: params.specs,
          },
        },
        include: {
          specs: true,
        },
      });
      return {
        message: 'Product variant is created successfully',
        variant: result,
      };
    }
  }
}
