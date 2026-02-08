import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

let pool: pg.Pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
} else {
  console.warn(
    "DATABASE_URL not set. Using a stub DB; routes requiring DB access will fail until configured.",
  );
  const stubPool = {
    query: () => {
      throw new Error("DATABASE_URL not set.");
    },
  } as unknown as pg.Pool;
  pool = stubPool;
}

export { pool };
export const db = drizzle(pool, { schema });
