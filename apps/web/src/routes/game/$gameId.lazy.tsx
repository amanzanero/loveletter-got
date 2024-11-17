import { createLazyFileRoute } from "@tanstack/react-router";
import { trpc, TRPCAppError } from "@/lib/trpc";
import React from "react";
import { useUserOrRedirect } from "@/lib/state/utils";
import { ReferenceCard } from "./-reference_card";
import { HelpCircle } from "lucide-react";
import { Game } from "@repo/models";
import { Board } from "./-board";

export const Route = createLazyFileRoute("/game/$gameId")({
  component: GamePage,
});

function GamePage() {
  const { gameId } = Route.useParams();
  const nav = Route.useNavigate();
  const [gameState, setGameState] = React.useState<Game | null>(null);
  const [, setGameError] = React.useState<TRPCAppError | null>(null);
  const user = useUserOrRedirect({ from: "/game/$gameId" });
  const [isReferenceOpen, setIsReferenceOpen] = React.useState(false);

  trpc.game.game.useSubscription(
    { gameId },
    {
      onData: setGameState,
      onError: setGameError,
    }
  );

  const toggleReference = () => setIsReferenceOpen((prev) => !prev);

  const playerIds = React.useMemo(
    () => gameState?.players.map((player) => player.id),
    [gameState?.players]
  );

  // check if user is in the game and redirect if not
  React.useEffect(() => {
    if (playerIds && user && !playerIds.some((id) => id === user.id)) {
      nav({ to: "/" });
    }
  }, [playerIds, user, nav]);

  return (
    <div className="min-h-screen bg-[#f0e6d6] p-4 md:p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center mb-8">Love Letter</h1>
      <button
        onClick={toggleReference}
        className="fixed top-4 right-4 bg-white rounded-full p-2 shadow-md"
        aria-label="Toggle card reference"
      >
        <HelpCircle size={24} />
      </button>
      <div className="bg-white h-96 w-full max-w-screen-md rounded-lg flex-1">
        {gameState === null ? <div>Loading ... </div> : <Board game={gameState} />}
      </div>
      <ReferenceCard isOpen={isReferenceOpen} onClose={() => setIsReferenceOpen(false)} />
    </div>
  );
}
