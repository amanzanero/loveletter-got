import { eq } from "drizzle-orm";
import { DB } from "./db/drizzle";
import { gameDeck, games, playerHand, players } from "./db/schema";
import { utcDateNow } from "./utils/time";
import { nanoid } from "nanoid";
import { Handle } from "./handle";
import { Cards, CardType, Game, Player } from "@repo/models";

type StoreErrorType =
  | "game_not_found"
  | "game_host_not_found"
  | "player_not_found"
  | "player_creation_failed"
  | "game_creation_failed";

export class StoreError extends Error {
  readonly errType: StoreErrorType;

  constructor(errType: StoreErrorType, message?: string) {
    const errMessage = (() => {
      if (message) return message;
      switch (errType) {
        case "game_not_found":
          return "Game not found.";
        case "game_host_not_found":
          return "Game host not found.";
        case "player_not_found":
          return "Player not found.";
        case "player_creation_failed":
          return "Failed to create player.";
        case "game_creation_failed":
          return "Failed to create game.";
      }
    })();
    super(errMessage);
    this.name = "StoreError";
    this.errType = errType;
  }
}

export interface Releasable {
  release(): void;
}

let store: Store | null = null;

export class Store {
  private db: DB;
  private gameMap: Map<string, Promise<Handle<Game> | null>> = new Map();

  private constructor(db: DB) {
    this.db = db;
  }

  static getOrCreate(db: DB): Store {
    return store ?? (store = new Store(db));
  }

  private async getGame(publicId: string): Promise<Game | null> {
    const game = await this.db.query.games.findFirst({
      where: eq(games.publicId, publicId),
      with: {
        host: {
          with: {
            hand: true,
          },
        },
        players: {
          with: {
            hand: true,
          },
          orderBy: (player, { asc }) => [asc(player.order)],
        },
        deck: {
          orderBy: (deck, { asc }) => [asc(deck.order)],
        },
      },
    });

    if (!game) {
      return null;
    }

    return {
      ...game,
      state: game.state as Game["state"],
      host: {
        ...(() => {
          if (!game.host) {
            throw new StoreError("game_host_not_found");
          }
          return game.host;
        })(),
        hand: game.host.hand.map((card) => Cards[card.cardType as CardType]),
      },
      players: game.players.map((player) => ({
        ...player,
        hand: player.hand.map((card) => Cards[card.cardType as CardType]),
      })),
      deck: game.deck
        .filter((card) => card.location === "deck")
        .map((card) => Cards[card.cardType as CardType]),
      discarded: game.deck
        .filter((card) => card.location === "discarded")
        .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())
        .map((card) => Cards[card.cardType as CardType]),
    };
  }

  async getOrFetchGame(publicId: string): Promise<Readonly<Game> | null> {
    const gameHandle = await this.gameMap.get(publicId);
    if (gameHandle) {
      return gameHandle.currentValue();
    }

    const game = await this.getGame(publicId);
    if (!game) return null;

    const handle = new Handle(game);
    this.gameMap.set(publicId, Promise.resolve(handle));

    return game;
  }

  async subscribeToGame(publicId: string, onChange: (game: Game) => void): Promise<Releasable> {
    const gameHandle = () => {
      const cachedGame = this.gameMap.get(publicId);

      if (cachedGame) {
        console.log(`[subscribeToGame] found cached game ${publicId}`);
        return cachedGame;
      }
      console.log(`[subscribeToGame] creating handle for game ${publicId}`);

      const eventualHandle = new Promise<Handle<Game> | null>((res, rej) => {
        (async () => {
          try {
            const game = await this.getGame(publicId);
            if (!game) {
              this.gameMap.delete(publicId);
              return res(null);
            }
            res(new Handle(game));
          } catch (err) {
            rej(err);
          }
        })();
      });

      this.gameMap.set(publicId, eventualHandle);

      return eventualHandle;
    };

    const listener = (game: Readonly<Game>) => {
      console.log(`[subscribeToGame][listener] emitting game ${game.publicId} to subscriber`);
      onChange(game);
    };
    const handle = await gameHandle();

    if (!handle) {
      throw new StoreError("game_not_found");
    }

    handle.onValue(listener);

    // broadcast the current value to the subscriber
    listener(handle.currentValue());

    return {
      release() {
        console.log(`releasing game ${publicId} subscription`);
        handle.offValue(listener);
      },
    };
  }

  async createGame(hostPlayerName: string): Promise<Game> {
    const gameId = nanoid();

    const txResult = await this.db.transaction(async (tx) => {
      const gameInsertResult = await tx
        .insert(games)
        .values({
          publicId: gameId,
          createdAt: utcDateNow(),
          updatedAt: utcDateNow(),
        })
        .returning();
      const game = gameInsertResult[0];

      if (!game) {
        throw new StoreError("game_creation_failed");
      }
      const playerResult = await tx
        .insert(players)
        .values({
          publicId: nanoid(),
          createdAt: utcDateNow(),
          updatedAt: utcDateNow(),
          order: 0,
          name: hostPlayerName,
          gameId: game.id,
        })
        .returning();
      const roomHost = playerResult[0];

      if (!roomHost) {
        throw new StoreError("player_creation_failed");
      }

      await tx.update(games).set({
        hostPlayerId: roomHost.id,
      });

      return {
        game,
        roomHost,
      };
    });

    const hostWithHand = {
      ...txResult.roomHost,
      hand: [],
    };

    const formattedGame = {
      ...txResult.game,
      state: txResult.game.state as Game["state"],
      host: hostWithHand,
      players: [hostWithHand],
      deck: [],
      discarded: [],
    };

    const handle = new Handle(formattedGame);

    this.gameMap.set(txResult.game.publicId, Promise.resolve(handle));

    return formattedGame;
  }

  async updateGame(
    gameId: number,
    update: Partial<Omit<Game, "players" | "host" | "deck" | "discarded">>
  ): Promise<void> {
    const updateResult = await this.db
      .update(games)
      .set(update)
      .where(eq(games.id, gameId))
      .returning();
    const game = updateResult[0];

    if (!game) {
      throw new StoreError("game_not_found");
    }

    const formattedGame = {
      ...game,
      state: game.state as Game["state"],
    };

    const gameHandle = await this.gameMap.get(game.publicId);
    if (gameHandle) {
      gameHandle.update((currentGame) => ({
        ...currentGame,
        ...formattedGame,
      }));
    }
  }

  async addPlayerToGame(
    publicGameId: string,
    playerName: string
  ): Promise<{ game: Game; player: Player }> {
    const game = await this.getGame(publicGameId);

    if (!game) {
      throw new StoreError("game_not_found");
    }

    const gameHost = game.host;
    if (!gameHost) {
      throw new StoreError("game_host_not_found");
    }

    const playerInsertResult = await this.db
      .insert(players)
      .values({
        publicId: nanoid(),
        createdAt: utcDateNow(),
        updatedAt: utcDateNow(),
        order: 0, // default to 0 for now, but will need to be updated when starting
        name: playerName,
        gameId: game.id,
      })
      .returning();
    const player = playerInsertResult[0];

    if (!player) {
      throw new StoreError("player_creation_failed");
    }

    const gameHandle: Handle<Game> = await (async () => {
      const handle = await (this.gameMap.get(game.publicId) ?? Promise.resolve(null));
      if (handle) return handle;
      console.log("handle didn't exist while adding player to game");
      // make the handle if it doesn't exist
      const newHandle = new Handle(game);
      this.gameMap.set(game.publicId, Promise.resolve(newHandle));
      return newHandle;
    })();

    // broadcast to all subscribers
    gameHandle.update((currentGame) => ({
      ...currentGame,
      players: [...currentGame.players, { ...player, hand: [] }],
    }));

    return {
      game: gameHandle.currentValue(),
      player: { ...player, hand: [] },
    };
  }

  async initGame(
    publicId: string,
    {
      gameId,
      playerOrderAndHand,
      deck,
      discarded,
    }: {
      gameId: number;
      playerOrderAndHand: { playerId: number; hand: CardType[] }[];
      deck: CardType[];
      discarded: CardType[];
    }
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await Promise.all([
        // update player orders
        ...playerOrderAndHand.map(({ playerId }, order) =>
          tx.update(players).set({ order }).where(eq(players.id, playerId))
        ),
        // update player hands
        tx.insert(playerHand).values(
          playerOrderAndHand.flatMap(({ playerId, hand }) =>
            hand.map((cardType, order) => ({
              playerId,
              gameId,
              cardType,
              order,
              createdAt: utcDateNow(),
              updatedAt: utcDateNow(),
            }))
          )
        ),
        // update deck
        tx.insert(gameDeck).values(
          deck
            .map((cardType, order) => ({
              gameId,
              cardType,
              location: "deck",
              order,
              createdAt: utcDateNow(),
              updatedAt: utcDateNow(),
            }))
            .concat(
              discarded.map((cardType, order) => ({
                gameId,
                cardType,
                location: "discarded",
                order,
                createdAt: utcDateNow(),
                updatedAt: utcDateNow(),
              }))
            )
        ),
        // update game state
        tx.update(games).set({ playerTurn: 0, state: "playing" }).where(eq(games.id, gameId)),
      ]);
    });

    const game = await this.getGame(publicId);
    const gameHandle = await this.gameMap.get(publicId);
    if (gameHandle && game) {
      gameHandle.update(() => game);
    }
  }
}
