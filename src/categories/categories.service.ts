import { Inject, Injectable } from '@nestjs/common';
import { CategoryCreateRequest } from './dto/create-category.dto';
import { CategoryUpdateRequest } from './dto/update-category.dto';
import { Category, Prisma } from '@prisma/generated';
import { WithError } from '@src/common/types/utils';
import { generateGuid } from '@src/common/utils/generate-guid';
import { ClientRMQ } from '@nestjs/microservices';
import { PrismaService } from '@src/prisma/prisma.service';
import { CategoryEvent } from './dto/broker.dto';
import { CategoryListRequest } from './dto/list-category.dto';
import { getListOptions } from '@src/common/utils/list-params';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    @Inject('categories-service') private client: ClientRMQ,
  ) {}

  async create(
    createCategoryDto: CategoryCreateRequest,
  ): Promise<WithError<{ result: Category }>> {
    const categoryToCreate: Prisma.CategoryCreateInput = {
      guid: generateGuid(),
      title: createCategoryDto.title,
      description: createCategoryDto.description,
    };

    const result = await this.prisma.category.create({
      data: categoryToCreate,
    });

    this.client.emit<any, CategoryEvent>('category.category.add', {
      id: result.guid,
      title: result.title,
      description: result.description,
    });

    return { result, errors: [] };
  }

  async update(
    guid: string,
    category: CategoryUpdateRequest,
  ): Promise<WithError<{ result: Category }>> {
    const result = await this.prisma.category.update({
      data: category,
      where: {
        guid,
      },
    });

    this.client.emit<any, CategoryEvent>('category.category.add', {
      id: result.guid,
      title: result.title,
      description: result.description,
    });

    return { result, errors: [] };
  }

  async list(
    listRequest: CategoryListRequest,
  ): Promise<WithError<{ results: Category[]; count: number }>> {
    const { skip, orderBy, where, take } = getListOptions<
      Prisma.CategoryWhereInput,
      Prisma.CategoryOrderByWithRelationInput
    >(listRequest.options);

    const [count, results] = await this.prisma.$transaction([
      this.prisma.category.count(),
      this.prisma.category.findMany({
        skip,
        orderBy,
        where,
        take,
      }),
    ]);

    return { results, count, errors: [] };
  }

  async detail({ guid }: Prisma.CategoryWhereUniqueInput): Promise<
    WithError<{
      result: Category;
    }>
  > {
    const result = await this.prisma.category.findUniqueOrThrow({
      where: {
        guid,
      },
    });

    return { result, errors: [] };
  }
}
