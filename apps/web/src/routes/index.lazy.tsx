import { Button } from "@/components/ui/button";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const nav = useNavigate({ from: "/" });
  return (
    <div className="w-full flex min-h-[100dvh] py-8 flex-col items-center">
      <div className="w-full max-w-screen-lg flex flex-col">
        <h1 className="text-3xl font-bold text-center">Love Letter</h1>

        <div className="h-12" />

        <div className="flex flex-col max-w-md space-y-4 self-center w-full">
          <Button size="lg" onClick={() => nav({ to: "/game" })}>
            New Game
          </Button>
          <Button size="lg" onClick={() => nav({ to: "/join" })}>
            Join Game
          </Button>
        </div>
      </div>
    </div>
  );
}
