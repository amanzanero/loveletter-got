import { z } from "zod";
import { observable } from "@trpc/server/observable";
import { publicProcedure, router } from "./context";
import { TRPCError } from "@trpc/server";
import { StoreError } from "../store";
import { Game } from "@repo/models";

export const gameRouter = router({
  game: publicProcedure
    .input(
      z.object({
        gameId: z.string(), // publicId
      })
    )
    .subscription(({ ctx, input }) => {
      return observable<Game>((emitter) => {
        const eventualReleasable = ctx.store.subscribeToGame(input.gameId, (game: Game) => {
          emitter.next(game);
        });

        eventualReleasable.catch((err) => {
          console.error(err);
          if (err instanceof StoreError) {
            emitter.error(new TRPCError({ code: "NOT_FOUND", message: err.message }));
          } else {
            emitter.error(
              new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "An error occurred while subscribing to the game.",
              })
            );
          }
        });

        return () => eventualReleasable.then((releasable) => releasable.release()).catch();
      });
    }),
});
