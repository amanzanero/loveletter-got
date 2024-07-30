import { createLazyFileRoute } from "@tanstack/react-router";
import { trpc } from "../../lib/trpc";

export const Route = createLazyFileRoute("/game/")({
  component: Game,
});

function Game() {
  trpc.onAdd.useSubscription(undefined, { onData: (d) => console.log(`Data: ${d}`) });

  return (
    <>
      <p className="text-2xl font-bold">Game</p>
    </>
  );
}
