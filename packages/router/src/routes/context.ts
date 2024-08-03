import { initTRPC } from "@trpc/server";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";

// created for each request
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createContext = (_opts: CreateWSSContextFnOptions) => ({}); // no context
type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
