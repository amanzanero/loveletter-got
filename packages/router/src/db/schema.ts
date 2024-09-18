// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { integer } from "drizzle-orm/pg-core";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const games = pgTable(
  "game",
  {
    id: serial("id").primaryKey(),
    publicId: varchar("public_id", { length: 256 }).notNull(),
    state: varchar("state", { length: 256 }).notNull().default("waiting"),
    hostPlayerId: integer("host_player_id"),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => ({})
);

export const gameRelations = relations(games, ({ one, many }) => ({
  host: one(players, {
    fields: [games.hostPlayerId],
    references: [players.id],
  }),
  players: many(players),
}));

export const players = pgTable("player", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 256 }).notNull(),
  gameId: integer("game_id")
    .references(() => games.id)
    .notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const playerRelations = relations(players, ({ one }) => ({
  game: one(games, {
    fields: [players.gameId],
    references: [games.id],
  }),
}));
