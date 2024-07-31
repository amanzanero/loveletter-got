// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration
import { sql } from "drizzle-orm";
import { pgTable, serial, timestamp, varchar, integer } from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "session",
  {
    id: serial("id").primaryKey(),
    sessionId: varchar("session_id", { length: 256 }).notNull(),
    refreshToken: varchar("refresh_token", { length: 256 }).notNull(),
    accessToken: varchar("access_token", { length: 256 }).notNull(),
    expiresIn: integer("expires_in").notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => ({})
);
