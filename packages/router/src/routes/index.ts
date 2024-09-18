import { router } from "./context";
import { gameRouter } from "./game";
import { gameSetupRouter } from "./game_setup";

export const appRouter = router({
  game: gameRouter,
  gameSetup: gameSetupRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
