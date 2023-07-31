import * as GRPC from '@grpc/grpc-js';
import * as ProtoLoader from '@grpc/proto-loader';
import { protoPath } from '@src/constants/proto-path';
import prisma from './client';
import { categories } from './fixtures/categories';
import { applyFixtures } from './utils/applyFixtures';
import { CategoryCreateRequest } from '@protogen/category/category';

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 50051;

const URL = `${HOST}:${PORT}`;

describe('CategoryController (e2e)', () => {
  let client: any;

  beforeEach(async () => {
    await applyFixtures(categories, prisma.category);

    // Load proto-buffers for test gRPC dispatch
    const proto = ProtoLoader.loadSync(protoPath) as any;
    // Create Raw gRPC client object
    const protoGRPC = GRPC.loadPackageDefinition(proto) as any;
    // Create client connected to started services
    client = new protoGRPC.category.CategoriesService(
      URL,
      GRPC.credentials.createInsecure(),
    );
  });

  describe('ListCategory', () => {
    it('should get a list of categories', async () => {
      return new Promise<void>((resolve) => {
        client.ListCategory({}, (err: any, res: any) => {
          expect(err).toBeNull;
          expect(res.results).toHaveLength(categories.length);

          resolve();
        });
      });
    });
  });

  describe('CreateCategory', () => {
    it('should create a category', async () => {
      const category: CategoryCreateRequest = {
        userGuid: 'UserGuid',
        title: 'Mock title',
        description: 'Mock description',
        parentGuid: null,
      };

      return new Promise<void>((resolve) => {
        client.CreateCategory(category, (err: any, res: any) => {
          expect(err).toBeNull;

          expect(res.result.guid).toBeDefined();
          expect(res.result.title).toEqual(category.title);
          expect(res.result.description).toEqual(category.description);

          resolve();
        });
      });
    });

    it('should return 400 if validation failed', async () => {
      const category = {
        title: 'Mock title',
        description: '',
        parentGuid: null,
      };

      return new Promise<void>((resolve) => {
        client.CreateCategory(category, (err: any, res: any) => {
          expect(err).toBeNull;

          expect(res.errors.errorCode).toEqual(400);
          expect(res.errors.fieldErrors).toHaveLength(2);

          resolve();
        });
      });
    });

    it('should create a category with parent', async () => {
      const category: CategoryCreateRequest = {
        userGuid: 'UserGuid',
        title: 'Mock title',
        description: 'Mock description',
        parentGuid: categories[0].guid,
      };

      return new Promise<void>((resolve) => {
        client.CreateCategory(category, (err: any, res: any) => {
          expect(err).toBeNull;

          expect(res.result.guid).toBeDefined();
          expect(res.result.title).toEqual(category.title);
          expect(res.result.description).toEqual(category.description);
          expect(res.result.parentGuid).toEqual(category.parentGuid);

          resolve();
        });
      });
    });

    it('should throw if unknown parent guid is passed', async () => {
      const category: CategoryCreateRequest = {
        userGuid: 'UserGuid',
        title: 'Mock title',
        description: 'Mock description',
        parentGuid: 'invalidGuid',
      };

      return new Promise<void>((resolve) => {
        client.CreateCategory(category, (err: any, res: any) => {
          expect(err).toBeNull;

          expect(res.errors.errorCode).toEqual(400);

          resolve();
        });
      });
    });
  });

  describe('UpdateCategory', () => {
    it('should update category', async () => {
      const category = {
        guid: categories[0].guid,
        title: 'Updated title',
      };

      return new Promise<void>((resolve) => {
        client.UpdateCategory(category, (err: any, res: any) => {
          expect(err).toBeNull;

          expect(res.result.guid).toBeDefined();
          expect(res.result.title).toEqual(category.title);
          expect(res.result.description).toEqual(categories[0].description);

          resolve();
        });
      });
    });

    it('should return 400 if validation failed', async () => {
      const category = {
        guid: categories[0].guid,
        title: '',
        description: '',
      };

      return new Promise<void>((resolve) => {
        client.UpdateCategory(category, (err: any, res: any) => {
          expect(err).toBeNull;

          expect(res.errors.errorCode).toEqual(400);
          expect(res.errors.fieldErrors).toHaveLength(2);

          resolve();
        });
      });
    });

    it('should add parent to category', async () => {
      const category = {
        guid: categories[0].guid,
        parentGuid: categories[1].guid,
      };

      return new Promise<void>((resolve) => {
        client.UpdateCategory(category, (err: any, res: any) => {
          expect(err).toBeNull;

          expect(res.result.guid).toBeDefined();
          expect(res.result.title).toEqual(categories[0].title);
          expect(res.result.description).toEqual(categories[0].description);
          expect(res.result.parentGuid).toEqual(category.parentGuid);

          resolve();
        });
      });
    });

    it('should return 404 if unknown guid is passed', async () => {
      const category = {
        guid: 'invalidGuid',
        title: 'Updated title',
      };

      return new Promise<void>((resolve) => {
        client.UpdateCategory(category, (err: any, res: any) => {
          expect(err).toBeNull;

          expect(res.errors.errorCode).toEqual(404);

          resolve();
        });
      });
    });

    it('should return 400 if unknown parent guid is passed', async () => {
      const category = {
        guid: categories[0].guid,
        parentGuid: 'invalidGuid',
      };

      return new Promise<void>((resolve) => {
        client.UpdateCategory(category, (err: any, res: any) => {
          expect(err).toBeNull;

          expect(res.errors.errorCode).toEqual(400);

          resolve();
        });
      });
    });
  });

  describe('DetailCategory', () => {
    it('should get details of category', async () => {
      const category = {
        guid: categories[0].guid,
      };

      return new Promise<void>((resolve) => {
        client.DetailCategory(category, (err: any, res: any) => {
          expect(err).toBeNull;

          expect(res.result.guid).toEqual(categories[0].guid);
          expect(res.result.title).toEqual(categories[0].title);
          expect(res.result.description).toEqual(categories[0].description);

          resolve();
        });
      });
    });

    it('should return 404 if unknown category guid is passed', async () => {
      const category = {
        guid: 'invalidGuid',
      };

      return new Promise<void>((resolve) => {
        client.DetailCategory(category, (err: any, res: any) => {
          expect(err).toBeNull;

          expect(res.errors.errorCode).toEqual(404);

          resolve();
        });
      });
    });
  });
});
