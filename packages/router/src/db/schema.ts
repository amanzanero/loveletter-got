// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { boolean, integer, index } from "drizzle-orm/pg-core";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const games = pgTable(
  "game",
  {
    id: serial("id").primaryKey(),
    publicId: varchar("public_id", { length: 256 }).notNull(),
    state: varchar("state", { length: 256 }).notNull().default("waiting"),
    hostPlayerId: integer("host_player_id"),
    playerTurn: integer("player_turn").notNull().default(0),
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
  deck: many(gameDeck),
}));

export const players = pgTable("player", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 256 }).notNull(),
  gameId: integer("game_id")
    .references(() => games.id)
    .notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  tokens: integer("tokens").notNull().default(0),
  protected: boolean("protected").notNull().default(false),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const playerRelations = relations(players, ({ one, many }) => ({
  game: one(games, {
    fields: [players.gameId],
    references: [games.id],
  }),
  hand: many(playerHand),
}));

export const gameDeck = pgTable(
  "game_deck",
  {
    id: serial("id").primaryKey(),
    gameId: integer("game_id")
      .references(() => games.id)
      .notNull(),
    cardType: varchar("card_type", { length: 256 }).notNull(),
    location: varchar("location", { length: 256 }).notNull(),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => ({
    gameIdIdx: index("game_deck_game_id_idx").on(table.gameId),
  })
);

export const gameDeckRelations = relations(gameDeck, ({ one }) => ({
  game: one(games, {
    fields: [gameDeck.gameId],
    references: [games.id],
  }),
}));

export const playerHand = pgTable(
  "player_hand",
  {
    id: serial("id").primaryKey(),
    playerId: integer("player_id")
      .references(() => players.id)
      .notNull(),
    gameId: integer("game_id")
      .references(() => games.id)
      .notNull(),
    cardType: varchar("card_type", { length: 256 }).notNull(),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => ({
    gameIdIdx: index("player_hand_game_id_idx").on(table.gameId),
  })
);

export const playerHandRelations = relations(playerHand, ({ one }) => ({
  player: one(players, {
    fields: [playerHand.playerId],
    references: [players.id],
  }),
  game: one(games, {
    fields: [playerHand.gameId],
    references: [games.id],
  }),
}));
