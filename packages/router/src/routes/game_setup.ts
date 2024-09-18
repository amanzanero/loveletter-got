import z from "zod";
import { publicProcedure, router } from "./context";
import { TRPCError } from "@trpc/server";
import { StoreError } from "../store";

export const gameSetupRouter = router({
  newGame: publicProcedure
    .input(
      z.object({
        hostPlayerName: z.string().max(25, "Name must be 25 characters or less."),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.store.createGame(input.hostPlayerName);
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof StoreError
              ? error.message
              : "An error occurred while creating the game.",
        });
      }
    }),
  joinGame: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        playerName: z.string().max(25, "Name must be 25 characters or less."),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game = await ctx.store.getOrFetchGame(input.gameId);
      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found.",
        });
      }
      if (game.state !== "waiting") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game has already started.",
        });
      }
      try {
        return await ctx.store.addPlayerToGame(input.gameId, input.playerName);
      } catch (error) {
        console.error(error);
        const message =
          error instanceof StoreError ? error.message : "An error occurred while joining the game.";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
    }),
  startGame: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const game = await ctx.store.getOrFetchGame(input.gameId);
        if (!game) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Game not found.",
          });
        }
        if (game.players.length < 2) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Need at least 2 players to start the game.",
          });
        }
        await ctx.store.updateGame(game.id, { state: "playing" });
      } catch (error) {
        console.error(error);
        const message =
          error instanceof StoreError
            ? error.message
            : "An error occurred while starting the game.";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
    }),
});
