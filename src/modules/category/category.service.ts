import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category, Prisma } from '@prisma/client';
import { CategoryWithChildren } from './category.types';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ClsService } from 'nestjs-cls';
import { mapTranslation } from 'src/shared/utils/translation.utils';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private cls: ClsService,
  ) {}

  async list() {
    let list = await this.prisma.category.findMany({
      include: {
        translations: {
          where: { model: 'category', lang: this.cls.get('lang') },
        },
      },
    });

    let modifiedList = list.map((item) => mapTranslation(item));

    let rootCategories = modifiedList.filter((category) => !category.parentId);

    return rootCategories.map((category) =>
      this.childCategories(modifiedList, category),
    );
  }

  childCategories(list: Category[], category: Category): CategoryWithChildren {
    let children = list
      .filter((item) => item.parentId === category.id)
      .map((item) => this.childCategories(list, item));
    return {
      ...category,
      children: children.length ? children : undefined,
    };
  }

  async create(params: CreateCategoryDto) {
    let category = await this.prisma.category.create({
      data: {
        parentId: params.parentId,
      },
      include: {
        translations: true,
      },
    });

    let locales: any = [];

    for (let translation of params.translations) {
      locales.push({
        model: 'category',
        modelId: category.id,
        field: 'name',
        value: translation.name,
        lang: translation.lang,
      });

      locales.push({
        model: 'category',
        modelId: category.id,
        field: 'slug',
        value: translation.slug,
        lang: translation.lang,
      });
    }

    let translations = await this.prisma.translation.createManyAndReturn({
      data: locales,
    });

    await this.prisma.category.update({
      where: { id: category.id },
      data: {
        translations: {
          connect: translations,
        },
      },
    });
    category.translations = translations;

    return category;
  }

  async update(id: number, params: UpdateCategoryDto) {
    let category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) throw new NotFoundException('Category is not found');

    await this.prisma.category.update({
      where: { id: category.id },
      data: {}, //params,
    });

    return {
      message: 'Category is updated successfully',
    };
  }

  async deleteCategory(id: number) {
    return this.prisma.category.delete({ where: { id } });
  }
}
