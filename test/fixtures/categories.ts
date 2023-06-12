import { Prisma } from '@prisma/generated';

export const categories: Prisma.CategoryCreateInput[] = [
  {
    guid: '66e33c1b-938a-497b-89db-56532322ac49',
    title: 'First category title',
    description: 'Some description',
  },
  {
    guid: '9c3feb28-1438-456e-be4f-d6edabebb3d2',
    title: 'Second sample title',
    description: 'Some description',
  },
];
