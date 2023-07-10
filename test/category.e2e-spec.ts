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

  it('get: list of categories', async () => {
    const response = await controller.list({ options: undefined });

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

  it('get: one category', async () => {
    const response = await controller.detail({
      guid: '9c3feb28-1438-456e-be4f-d6edabebb3d2',
    });

    const result = response.result;

    expect(result.guid).toEqual('9c3feb28-1438-456e-be4f-d6edabebb3d2');
    expect(result.title).toEqual('Second category title');
    expect(result.description).toEqual('Some description');
  });

  it('add: one category', async () => {
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

  it('add: one category with parent', async () => {
    const category: CategoryCreateRequest = {
      userGuid: '66e33c1b-938a-497b-89db-56532322ac41',
      title: 'First category title',
      description: 'Some description',
      parentGuid: '9c3feb28-1438-456e-be4f-d6edabebb3d2',
    };

    const response = await controller.create(category);

    expect(response.result.guid).toBeDefined();
    expect(response.result.title).toEqual(category.title);
    expect(response.result.description).toEqual(category.description);
    expect(response.result.parentGuid).toBeDefined();
  });

  it('add: throw when invalid parentGuid provided', async () => {
    const category: CategoryCreateRequest = {
      userGuid: '66e33c1b-938a-497b-89db-56532322ac41',
      title: 'First category title',
      description: 'Some description',
      parentGuid: 'invalid',
    };

    const createFn = async () => await controller.create(category);

    await expect(createFn).rejects.toThrow();
  });

  it('update: one category', async () => {
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

  it('update: throw when invalid parentGuid provided', async () => {
    const category: CategoryUpdateRequest = {
      guid: '039b06f5-e1e8-48f4-8de9-4f88da9e07df',
      title: 'Updated title',
      description: 'Updated description',
      userGuid: '039b06f5-e1e8-48f4-8de9-4f88da9e07d4',
      parentGuid: 'invalid',
    };

    const createFn = async () => await controller.update(category);

    await expect(createFn).rejects.toThrow();
  });

  it('update: throw when self referencing', async () => {
    const category: CategoryUpdateRequest = {
      guid: '039b06f5-e1e8-48f4-8de9-4f88da9e07df',
      title: 'Updated title',
      description: 'Updated description',
      userGuid: '039b06f5-e1e8-48f4-8de9-4f88da9e07d4',
      parentGuid: '039b06f5-e1e8-48f4-8de9-4f88da9e07df',
    };

    const createFn = async () => await controller.update(category);

    await expect(createFn).rejects.toThrow();
  });
});
