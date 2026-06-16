import type { Prisma } from '@prisma/client';

export const publicUserSelect = {
  createdAt: true,
  email: true,
  id: true,
  name: true,
  role: true,
  status: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;
