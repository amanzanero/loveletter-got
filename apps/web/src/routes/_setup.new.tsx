import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";
import { useNewGame } from "./-setup_mutations";

const NewGame: React.FC = () => {
  const [userName, setUserName] = React.useState("");
  const mutation = useNewGame({ from: Route.fullPath });

  return (
    <form
      className="flex-1 flex flex-col max-w-md space-y-4 w-full"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.newGame(userName);
      }}
    >
      <Input placeholder="Player name" onChange={(e) => setUserName(e.target.value)} />
      <Button size="lg" disabled={userName.length === 0 || mutation.isPending} type="submit">
        New Game
      </Button>
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
      <Button size="lg" variant="secondary" asChild>
        <Link to="..">Back</Link>
      </Button>
    </form>
  );
};

export const Route = createFileRoute("/_setup/new")({
  component: NewGame,
});
