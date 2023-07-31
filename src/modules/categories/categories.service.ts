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
import { getErrors } from '@src/common/utils/error';
import { ERROR_CODES } from '@src/common/constants/error';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private categoriesRepository: CategoriesRepository,
    @Inject('categories-service') private client: ClientRMQ,
  ) {}

  async create(
    createCategoryDto: CategoryCreateInput,
  ): Promise<WithError<{ result: Category }>> {
    const categoryToCreate: Prisma.CategoryCreateInput = {
      guid: generateGuid(),
      userGuid: createCategoryDto.userGuid,
      title: createCategoryDto.title,
      description: createCategoryDto.description,
    };

    const { parentGuid } = createCategoryDto;

    if (parentGuid) {
      if (!(await this.categoriesRepository.getCategoryByGuid(parentGuid))) {
        throw new RpcException(`Category with id ${parentGuid} doesn't exist`);
      }

      categoryToCreate.parent = {
        connect: {
          guid: parentGuid,
        },
      };
    }

    const result = await this.categoriesRepository.createCategory(
      categoryToCreate,
    );

    this.client.emit<any, CategoryEvent>('category.category.add', {
      id: result.guid,
      title: result.title,
      description: result.description,
    });

    return { result, errors: null };
  }

  async update(
    guid: string,
    categoryUpdateDto: CategoryUpdateInput,
  ): Promise<WithError<{ result: Category }>> {
    if (!(await this.categoriesRepository.getCategoryByGuid(guid))) {
      throw new RpcException(
        getErrors({
          nonFieldErrors: ['Not found'],
          errorCode: ERROR_CODES.NOT_FOUND,
        }),
      );
    }

    const categoryToUpdate: Prisma.CategoryUpdateInput = {
      title: categoryUpdateDto.title,
      description: categoryUpdateDto.description,
    };

    const { parentGuid } = categoryUpdateDto;

    if (parentGuid) {
      if (!(await this.categoriesRepository.getCategoryByGuid(parentGuid))) {
        throw new RpcException(`Category with id ${parentGuid} doesn't exist`);
      }

      categoryToUpdate.parent = {
        connect: {
          guid: parentGuid,
        },
      };
    }

    if (guid === categoryUpdateDto.parentGuid) {
      throw new RpcException('Self nesting is not allowed');
    }

    const result = await this.categoriesRepository.updateCategory(
      guid,
      categoryToUpdate,
    );

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

    const { count, categories } = await this.categoriesRepository.getCategories(
      {
        skip,
        orderBy,
        where,
        take,
      },
    );

    return { results: categories, count, errors: null };
  }

  async detail({ guid }: Prisma.CategoryWhereUniqueInput): Promise<
    WithError<{
      result: Category;
    }>
  > {
    const category = await this.categoriesRepository.getCategoryByGuid(guid);

    if (!category) {
      throw new RpcException(
        getErrors({
          nonFieldErrors: ['Not found'],
          errorCode: ERROR_CODES.NOT_FOUND,
        }),
      );
    }

    return { result: category, errors: null };
  }
}
