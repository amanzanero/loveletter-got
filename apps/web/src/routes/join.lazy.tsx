import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/join")({
  component: Join,
});

function Join() {
  const navigate = useNavigate();
  return (
    <div className="w-full flex min-h-[100dvh] py-8 flex-col items-center">
      <div className="w-full max-w-screen-lg flex flex-col">
        <h1 className="text-3xl font-bold text-center">Love Letter Online</h1>

        <div className="h-12" />

        <div className="flex flex-col max-w-md space-y-4 self-center w-full">
          <Input placeholder="Game ID" />
          <Button size="lg">Join Game</Button>
          <Button size="lg" variant="secondary" onClick={() => navigate({ to: ".." })}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
