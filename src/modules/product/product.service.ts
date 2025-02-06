import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { UpsertProductVariantDto } from './dto/upsert-product-variant.dto';
import { connect } from 'http2';
import { UpsertProductSpecDto } from './dto/upsert-product-spec.dto';
import { GetProductListDto } from './dto/get-product-list.dto';

import { Prisma } from '@prisma/client';
@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  list(params: GetProductListDto) {
    let where: Prisma.ProductWhereInput = {};

    if (params.category) {
      where.categories = {
        some: {
          id: {
            in: params.category,
          },
        },
      };
    }
    if (params.minPrice || params.maxPrice) {
      where.variants = {
        some: {
          price: {
            gte: params.minPrice,
            lte: params.maxPrice,
          },
        },
      };
    }

    if (params.filters) {
      // let specFilters: Prisma.ProductVariantSpecWhereInput = {
      //   key
      // };

      let filters = Object.entries(params.filters).map(([key, value]) => ({
        key,
        value,
      }));

      if (where.variants?.some) {
        // where.variants.some.specs = {
        //   every: specFilters,
        // };
      } else {
        where.variants = {
          some: {
            AND: filters.map((filter) => ({
              specs: {
                some: {
                  key: filter.key,
                  value: filter.value,
                },
              },
            })),
          },
        };
      }
    }

    return this.prisma.product.findMany({
      where,
      include: {
        categories: true,
        variants: {
          include: {
            specs: true,
          },
        },
      },
    });
  }

  item(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
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
  }

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

  async updateProduct(id: number, params: UpdateProductDto) {
    let product = await this.prisma.product.findUnique({
      where: { id },
      include: { categories: { select: { id: true } } },
    });

    if (!product) throw new NotFoundException('Product is not found');

    const categories = params.categories?.map((category) => ({ id: category }));

    return await this.prisma.product.update({
      where: { id },
      data: {
        ...params,
        categories: categories && {
          disconnect: product.categories,
          connect: categories,
        },
      },
    });
  }

  async deleteProduct(id: number) {
    let product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product is not found');

    await this.prisma.product.delete({ where: { id } });

    return {
      message: 'Product is deleted successfully',
    };
  }

  async upsertProductSpec(id: number, params: UpsertProductSpecDto) {
    let product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        specs: {
          include: {
            values: true,
          },
        },
      },
    });

    if (!product) throw new NotFoundException('Product is not found');

    let productSpec = product.specs.find((spec) => spec.key === params.key);

    if (!productSpec) {
      await this.prisma.productSpec.create({
        data: {
          ...params,
          values: { create: params.values },
          productId: product.id,
        },
      });
      return {
        message: 'Product specification is created successfully',
      };
    } else {
      await this.prisma.productSpec.update({
        where: { id: productSpec.id },
        data: {
          ...params,
          values: {
            delete: productSpec.values,
            create: params.values,
          },
        },
      });

      return {
        message: 'Product specification is updated successfully',
      };
    }
  }
  async deleteProductSpec(id: number, specKey: string) {
    let product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        specs: true,
      },
    });

    if (!product) throw new NotFoundException('Product is not found');

    let productSpec = product.specs.find((spec) => spec.key === specKey);
    if (!productSpec)
      throw new NotFoundException('This specification is not found in product');

    await this.prisma.productSpec.delete({ where: { id: productSpec.id } });

    return {
      message: 'Specification is deleted successfully',
    };
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
