import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/generated';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private prisma: PrismaService) {}

  async createCategory(
    createCategoryDto: Prisma.CategoryCreateInput,
  ): Promise<Category> {
    return this.prisma.category.create({ data: createCategoryDto });
  }

  async getCategoryByGuid(categoryGuid: string) {
    return this.prisma.category.findUnique({
      where: {
        guid: categoryGuid,
      },
    });
  }

  async updateCategory(
    categoryGuid: string,
    updateCategoryDto: Prisma.CategoryUpdateInput,
  ): Promise<Category> {
    return this.prisma.category.update({
      where: { guid: categoryGuid },
      data: updateCategoryDto,
    });
  }

  async getCategories({ skip, orderBy, where, take }) {
    const [count, categories] = await this.prisma.$transaction([
      this.prisma.category.count(),
      this.prisma.category.findMany({
        skip,
        orderBy,
        where,
        take,
      }),
    ]);

    return { count, categories };
  }
}
