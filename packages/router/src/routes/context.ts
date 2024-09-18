import { initTRPC } from "@trpc/server";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { db } from "../db/drizzle";
import { Store } from "../store";

export const createContext = (opts: CreateWSSContextFnOptions & { dbUrl: string }) => ({
  store: Store.getOrCreate(db(opts.dbUrl)),
});

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
