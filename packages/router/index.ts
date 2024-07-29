import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";

// created for each request
export const createContext = (_opts: CreateWSSContextFnOptions) => ({}); // no context
type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  getUser: t.procedure.input(z.string()).query((opts) => {
    opts.input; // string
    return { id: opts.input, name: "Bilbo" };
  }),
  createUser: t.procedure
    .input(z.object({ name: z.string().min(5) }))
    .mutation(async (opts) => {
      // use your ORM of choice
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
