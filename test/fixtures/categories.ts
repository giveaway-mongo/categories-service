import { Prisma } from '@prisma/generated';

export const categories: Prisma.CategoryCreateInput[] = [
  {
    guid: '039b06f5-e1e8-48f4-8de9-4f88da9e07df',
    userGuid: '66e33c1b-938a-497b-89db-56532322ac41',
    title: 'First category title',
    description: 'Some description',
  },
  {
    guid: '9c3feb28-1438-456e-be4f-d6edabebb3d2',
    userGuid: '66e33c1b-938a-497b-89db-56532322ac41',
    title: 'Second category title',
    description: 'Some description',
  },
];
