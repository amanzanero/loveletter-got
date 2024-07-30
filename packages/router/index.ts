import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();

// created for each request
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createContext = (_opts: CreateWSSContextFnOptions) => ({}); // no context
type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();
const timers: Record<number, NodeJS.Timeout> = {};
let count = 0;

export const appRouter = t.router({
  onAdd: t.procedure.subscription(() => {
    // return an `observable` with a callback which is triggered immediately
    return observable<"hi">((emit) => {
      const onAdd = (data: "hi") => {
        // emit data to client
        emit.next(data);
      };
      // trigger `onAdd()` when `add` is triggered in our event emitter
      ee.on("add", onAdd);

      const id = count++;
      const timeout = setInterval(() => {
        emit.next("hi");
      }, 5000);
      timers[id] = timeout;

      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        ee.off("add", onAdd);
        timers[id] && clearTimeout(timers[id]);
      };
    });
  }),
  add: t.procedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        text: z.string().min(1),
      })
    )
    .mutation(async (opts) => {
      const post = { ...opts.input }; /* [..] add to db */
      ee.emit("add", post);
      return post;
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
