import { Controller } from '@nestjs/common';
import { Payload, GrpcMethod } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';
import {
  CategoryCreateRequest,
  CategoryCreateResponse,
} from './dto/create-category.dto';
import {
  CategoryUpdateRequest,
  CategoryUpdateResponse,
} from './dto/update-category.dto';
import {
  CategoryListRequest,
  CategoryListResponse,
} from './dto/list-category.dto';
import {
  CategoryDetailRequest,
  CategoryDetailResponse,
} from './dto/detail-category.dto';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @GrpcMethod('CategoriesService', 'CreateCategory')
  async create(
    @Payload() createCategoryRequest: CategoryCreateRequest,
  ): Promise<CategoryCreateResponse> {
    const { result, errors } = await this.categoriesService.create(
      createCategoryRequest,
    );

    return { result, errors };
  }

  @GrpcMethod('CategoriesService', 'UpdateCategory')
  async update(
    categoryUpdateRequest: CategoryUpdateRequest,
  ): Promise<CategoryUpdateResponse> {
    const guid = categoryUpdateRequest.guid;

    const { result, errors } = await this.categoriesService.update(
      guid,
      categoryUpdateRequest,
    );

    return { result, errors };
  }

  @GrpcMethod('CategoriesService', 'ListCategory')
  async list(listRequest: CategoryListRequest): Promise<CategoryListResponse> {
    const { results, count, errors } = await this.categoriesService.list(
      listRequest,
    );

    return { results, count, errors };
  }

  @GrpcMethod('CategoriesService', 'DetailCategory')
  async detail({
    guid,
  }: CategoryDetailRequest): Promise<CategoryDetailResponse> {
    const { result, errors } = await this.categoriesService.detail({ guid });

    return { result, errors };
  }
}
