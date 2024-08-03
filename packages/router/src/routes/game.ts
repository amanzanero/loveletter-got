import { z } from "zod";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import { publicProcedure, router } from "./context";

// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter();
const timers: Record<number, NodeJS.Timeout> = {};
let count = 0;

export const gameRouter = router({
  onAdd: publicProcedure.subscription(() => {
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

      emit.next("hi");

      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        ee.off("add", onAdd);
        timers[id] && clearTimeout(timers[id]);
      };
    });
  }),
  add: publicProcedure
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
