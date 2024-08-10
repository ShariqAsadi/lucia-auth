import pg from 'pg';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
