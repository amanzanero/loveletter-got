import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fallback, zodSearchValidator } from "@tanstack/router-zod-adapter";
import { useJoinGameMutation } from "./-setup_mutations";
import React from "react";
import { z } from "zod";

const joinSearchSchema = z.object({
  gameId: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/_setup/join")({
  component: Join,
  validateSearch: zodSearchValidator(joinSearchSchema),
});

function Join() {
  const { joinGame, error, status } = useJoinGameMutation();
  const { gameId: initialGameId } = Route.useSearch();
  const [gameId, setGameId] = React.useState(initialGameId);
  const [playerName, setPlayerName] = React.useState("");

  return (
    <form
      className="flex-1 flex flex-col max-w-md space-y-4 w-full"
      onSubmit={(e) => {
        e.preventDefault();
        joinGame(gameId, playerName);
      }}
    >
      <span>Game ID</span>
      <Input placeholder="Game ID" value={gameId} onChange={(e) => setGameId(e.target.value)} />
      <span>Player name</span>
      <Input placeholder="Your name" onChange={(e) => setPlayerName(e.target.value)} />
      <Button size="lg" disabled={status === "pending"} type="submit">
        Join Game
      </Button>
      {error && <p className="text-red-500">{error.message}</p>}
      <Button size="lg" variant="secondary" asChild>
        <Link to="..">Back</Link>
      </Button>
    </form>
  );
}
