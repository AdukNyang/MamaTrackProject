import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '../.env.local') });
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { entities } from '@/entities';

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  return url;
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: getDatabaseUrl(),
  ssl: process.env.DATABASE_URL?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : undefined,
  entities,
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

const globalForDb = globalThis as unknown as {
  dataSource: DataSource | undefined;
};

export async function getDataSource(): Promise<DataSource> {
  if (globalForDb.dataSource?.isInitialized) {
    return globalForDb.dataSource;
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  globalForDb.dataSource = AppDataSource;
  return AppDataSource;
}
