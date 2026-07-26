import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(__dirname, '../../.env.local') });
config({ path: resolve(__dirname, '../.env.local') });

import 'reflect-metadata';

import { AppDataSource } from '@/lib/data-source';

async function main() {
  await AppDataSource.initialize();
  console.log('Running migrations...');
  const migrations = await AppDataSource.runMigrations();
  console.log(`Applied ${migrations.length} migration(s)`);
  await AppDataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
