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

    // expect(response.count).toEqual(3);

    // const results = response.results;
    // const count = response.count;

    // expect(count).toEqual(3);

    // expect(results[0].guid).toEqual('66e33c1b-938a-497b-89db-56532322ac49');
    // expect(results[0].title).toEqual('First sample title');
    // expect(results[0].text).toEqual('This is the first test sample!');

    // expect(results[1].guid).toEqual('9c3feb28-1438-456e-be4f-d6edabebb3d2');
    // expect(results[1].title).toEqual('Second sample title');
    // expect(results[1].text).toEqual('This is the second test sample!');

    // expect(results[2].guid).toEqual('039b06f5-e1e8-48f4-8de9-4f88da9e07df');
    // expect(results[2].title).toEqual('Third sample title');
    // expect(results[2].text).toEqual('This is the third test sample!');
  });

  // it('gets one sample', async () => {
  //   const response = await controller.detail({
  //     guid: '9c3feb28-1438-456e-be4f-d6edabebb3d2',
  //   });

  //   const result = response.result;

  //   expect(result.guid).toEqual('9c3feb28-1438-456e-be4f-d6edabebb3d2');
  //   expect(result.title).toEqual('Second sample title');
  //   expect(result.text).toEqual('This is the second test sample!');
  // });

  // it('adds one sample', async () => {
  //   const sample: SampleCreateRequest = {
  //     title: 'Title for created sample',
  //     text: 'Text for created sample',
  //   };

  //   const response = await controller.create(sample);

  //   expect(response.result.guid).toBeDefined();
  //   expect(response.result.title).toEqual(sample.title);
  //   expect(response.result.text).toEqual(sample.text);
  // });

  // it('updates one sample', async () => {
  //   const updatedSample: SampleUpdateRequest = {
  //     guid: '039b06f5-e1e8-48f4-8de9-4f88da9e07df',
  //     title: 'Updated title',
  //     text: 'Updated text',
  //   };

  //   const response = await controller.update(updatedSample);

  //   const result = response.result;

  //   expect(result.guid).toEqual(updatedSample.guid);
  //   expect(result.title).toEqual(updatedSample.title);
  //   expect(result.text).toEqual(updatedSample.text);

  //   const detailResponse = await controller.detail({
  //     guid: updatedSample.guid,
  //   });

  //   const detailResult = detailResponse.result;

  //   expect(detailResult.guid).toEqual(updatedSample.guid);
  //   expect(detailResult.title).toEqual(updatedSample.title);
  //   expect(detailResult.text).toEqual(updatedSample.text);
  // });
});