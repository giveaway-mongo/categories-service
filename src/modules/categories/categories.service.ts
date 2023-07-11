import { Inject, Injectable } from '@nestjs/common';
import { CategoryCreateInput } from './dto/create-category.dto';
import { CategoryUpdateInput } from './dto/update-category.dto';
import { Category, Prisma } from '@prisma/generated';
import { WithError } from '@src/common/types/utils';
import { generateGuid } from '@src/common/utils/generate-guid';
import { ClientRMQ, RpcException } from '@nestjs/microservices';
import { PrismaService } from '@src/prisma/prisma.service';
import { CategoryEvent } from './dto/broker.dto';
import { CategoryListRequest } from './dto/list-category.dto';
import { getListOptions } from '@src/common/utils/list-params';
import { PRISMA_ERROR_CODES } from '@src/constants/prisma-error-codes';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    @Inject('categories-service') private client: ClientRMQ,
  ) {}

  async create(
    createCategoryDto: CategoryCreateInput,
  ): Promise<WithError<{ result: Category }>> {
    const parent = createCategoryDto.parentGuid
      ? {
          connect: {
            guid: createCategoryDto.parentGuid,
          },
        }
      : undefined;

    const categoryToCreate: Prisma.CategoryCreateInput = {
      guid: generateGuid(),
      userGuid: createCategoryDto.userGuid,
      title: createCategoryDto.title,
      description: createCategoryDto.description,
      parent,
    };

    let result: Category;
    try {
      result = await this.prisma.category.create({
        data: categoryToCreate,
      });
    } catch (e) {
      if (e.code === PRISMA_ERROR_CODES.DEPENDING_RELATION_NOT_FOUND) {
        throw new RpcException('Invalid parentGuid');
      }
      throw e;
    }

    this.client.emit<any, CategoryEvent>('category.category.add', {
      id: result.guid,
      title: result.title,
      description: result.description,
    });

    return { result, errors: null };
  }

  async update(
    guid: string,
    categoryUpdateRequest: CategoryUpdateInput,
  ): Promise<WithError<{ result: Category }>> {
    const parent = categoryUpdateRequest.parentGuid
      ? {
          connect: {
            guid: categoryUpdateRequest.parentGuid,
          },
        }
      : undefined;

    if (guid === categoryUpdateRequest.parentGuid) {
      throw new RpcException('Self reference');
    }

    let result: Category;
    try {
      result = await this.prisma.category.update({
        data: {
          title: categoryUpdateRequest.title,
          description: categoryUpdateRequest.description,
          parent,
        },
        where: {
          guid,
        },
      });
    } catch (e) {
      if (e.code === PRISMA_ERROR_CODES.DEPENDING_RELATION_NOT_FOUND) {
        throw new RpcException('Invalid parentGuid');
      }
      throw e;
    }

    this.client.emit<any, CategoryEvent>('category.category.update', {
      id: result.guid,
      title: result.title,
      description: result.description,
    });

    return { result, errors: null };
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

    return { results, count, errors: null };
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

    return { result, errors: null };
  }
}
