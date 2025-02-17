import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateCategoryDto,
  CreateCategoryTranslations,
} from './dto/create-category.dto';
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

    let translations = await this.createTranslations(
      category,
      params.translations,
    );

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
    let category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });

    if (!category) throw new NotFoundException('Category is not found');

    if (params.translations) {
      await this.prisma.translation.deleteMany({
        where: {
          id: {
            in: category.translations.map((data) => data.id),
          },
        },
      });

      let translations = await this.createTranslations(
        category,
        params.translations,
      );

      await this.prisma.category.update({
        where: { id: category.id },
        data: {
          ...params,
          translations: {
            connect: translations,
          },
        },
      });
    } else {
      await this.prisma.category.update({
        where: { id: category.id },
        data: {
          ...params,
          translations: undefined,
        },
      });
    }

    return {
      message: 'Category is updated successfully',
    };
  }

  createTranslations(
    category: Category,
    translations: CreateCategoryTranslations[],
  ) {
    let locales: any = [];

    for (let translation of translations) {
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

    return this.prisma.translation.createManyAndReturn({
      data: locales,
    });
  }

  async deleteCategory(id: number) {
    let category = await this.prisma.category.findFirst({ where: { id } });
    if (!category) throw new NotFoundException('Category is not found');

    await this.prisma.category.delete({ where: { id } });
    await this.prisma.translation.deleteMany({
      where: {
        model: 'category',
        modelId: category.id,
      },
    });

    return {
      message: 'Category is deleted sucecssfully',
    };
  }
}
