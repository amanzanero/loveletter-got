import { eq } from "drizzle-orm";
import { DB } from "./db/drizzle";
import { games, players } from "./db/schema";
import { utcDateNow } from "./utils/time";
import { nanoid } from "nanoid";
import { Handle } from "./handle";
import { Game, Player } from "@repo/models";

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
        host: true,
        players: true,
      },
    });

    if (!game) {
      return null;
    }

    return {
      ...game,
      state: game.state as Game["state"],
      host: (() => {
        if (!game.host) {
          throw new StoreError("game_host_not_found");
        }
        return game.host;
      })(),
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

    const formattedGame = {
      ...txResult.game,
      state: txResult.game.state as Game["state"],
      host: txResult.roomHost,
      players: [txResult.roomHost],
    };

    const handle = new Handle(formattedGame);

    this.gameMap.set(txResult.game.publicId, Promise.resolve(handle));

    return formattedGame;
  }

  async updateGame(gameId: number, update: Partial<Game>): Promise<void> {
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
    const game = await this.db.query.games.findFirst({
      where: eq(games.publicId, publicGameId),
      columns: {
        id: true,
        publicId: true,
        state: true,
      },
      with: {
        host: true,
      },
    });

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
      const formattedGame = {
        ...game,
        state: game.state as Game["state"],
        host: gameHost,
        players: [player],
      };
      const newHandle = new Handle(formattedGame);
      this.gameMap.set(game.publicId, Promise.resolve(newHandle));
      return newHandle;
    })();

    // broadcast to all subscribers
    gameHandle.update((currentGame) => ({
      ...currentGame,
      players: [...currentGame.players, player],
    }));

    return {
      game: gameHandle.currentValue(),
      player,
    };
  }
}
