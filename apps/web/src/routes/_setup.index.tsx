import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_setup/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex-1 flex flex-col max-w-md space-y-4 self-center w-full">
      <Button size="lg" asChild>
        <Link to="/new">New Game</Link>
      </Button>
      <Button size="lg" asChild>
        <Link to="/join">Join Game</Link>
      </Button>
    </div>
  );
}
