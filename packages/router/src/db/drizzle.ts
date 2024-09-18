import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export type DB = PostgresJsDatabase<typeof schema>;

let _db: DB | undefined = undefined;

export const db = (dbUrl: string) => {
  if (_db) return _db;
  const queryClient = postgres(dbUrl);
  const newDb = drizzle(queryClient, { schema });
  _db = newDb;
  return newDb;
};
