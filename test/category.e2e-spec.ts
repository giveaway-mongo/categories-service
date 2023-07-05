import { INestApplication } from '@nestjs/common';
import { CategoriesController } from '@src/modules/categories/categories.controller';
import prisma from './client';
import { categories } from './fixtures/categories';
import { applyFixtures } from './utils/applyFixtures';
import {
  CategoryCreateRequest,
  CategoryUpdateRequest,
} from '@protogen/category/category';

describe('CategoryController (e2e)', () => {
  let app: INestApplication;
  let controller: CategoriesController;

  beforeEach(async () => {
    app = (global as any).app;
    controller = app.get<CategoriesController>(CategoriesController);

    await applyFixtures(categories, prisma.category);
  });

  it('gets list of categories', async () => {
    const response = await controller.list({ options: undefined });

    console.log(response);

    const results = response.results;
    const count = response.count;

    expect(count).toEqual(2);

    expect(results[0].guid).toEqual('039b06f5-e1e8-48f4-8de9-4f88da9e07df');
    expect(results[0].title).toEqual('First category title');
    expect(results[0].description).toEqual('Some description');

    expect(results[1].guid).toEqual('9c3feb28-1438-456e-be4f-d6edabebb3d2');
    expect(results[1].title).toEqual('Second category title');
    expect(results[1].description).toEqual('Some description');
  });

  it('gets one category', async () => {
    const response = await controller.detail({
      guid: '9c3feb28-1438-456e-be4f-d6edabebb3d2',
    });

    const result = response.result;

    expect(result.guid).toEqual('9c3feb28-1438-456e-be4f-d6edabebb3d2');
    expect(result.title).toEqual('Second category title');
    expect(result.description).toEqual('Some description');
  });

  it('adds one category', async () => {
    const category: CategoryCreateRequest = {
      title: 'Title for created category',
      description: 'Text for created category',
      userGuid: '039b06f5-e1e8-48f4-8de9-4f88da9e07d4',
      parentGuid: null,
    };

    const response = await controller.create(category);

    expect(response.result.guid).toBeDefined();
    expect(response.result.title).toEqual(category.title);
    expect(response.result.description).toEqual(category.description);
  });

  it('updates one category', async () => {
    const updatedCategory: CategoryUpdateRequest = {
      guid: '039b06f5-e1e8-48f4-8de9-4f88da9e07df',
      title: 'Updated title',
      description: 'Updated description',
      userGuid: '039b06f5-e1e8-48f4-8de9-4f88da9e07d4',
      parentGuid: null,
    };

    const response = await controller.update(updatedCategory);

    const result = response.result;

    expect(result.guid).toEqual(updatedCategory.guid);
    expect(result.title).toEqual(updatedCategory.title);
    expect(result.description).toEqual(updatedCategory.description);

    const detailResponse = await controller.detail({
      guid: updatedCategory.guid,
    });

    const detailResult = detailResponse.result;

    expect(detailResult.guid).toEqual(updatedCategory.guid);
    expect(detailResult.title).toEqual(updatedCategory.title);
    expect(detailResult.description).toEqual(updatedCategory.description);
  });
});
