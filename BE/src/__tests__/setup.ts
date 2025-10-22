import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll } from '@jest/globals';

process.env.NODE_ENV = 'test';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    },
  },
});

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
