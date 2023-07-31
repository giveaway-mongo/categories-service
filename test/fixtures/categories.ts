import { Prisma } from '@prisma/generated';
import { faker } from '@faker-js/faker';

const userGuid = faker.string.uuid();

export const categories: Prisma.CategoryCreateInput[] = Array.from(
  { length: 3 },
  () => ({
    guid: faker.string.uuid(),
    userGuid: userGuid,
    title: faker.word.words(2),
    description: faker.lorem.sentence(),
  }),
);
