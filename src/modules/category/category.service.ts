import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from '@prisma/client';
import { CategoryWithChildren } from './category.types';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async list() {
    let list = await this.prisma.category.findMany();

    let rootCategories = list.filter((category) => !category.parentId);

    return rootCategories.map((category) =>
      this.childCategories(list, category),
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

  create(params: CreateCategoryDto) {
    return this.prisma.category.create({ data: params });
  }

  async update(id: number, params: UpdateCategoryDto) {
    let category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) throw new NotFoundException('Category is not found');

    await this.prisma.category.update({
      where: { id: category.id },
      data: params,
    });

    return {
      message: 'Category is updated successfully',
    };
  }

  async deleteCategory(id: number) {
    return this.prisma.category.delete({ where: { id } });
  }
}
