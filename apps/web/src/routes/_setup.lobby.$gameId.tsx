import { useToast } from "@/components/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useUserOrRedirect } from "@/lib/state/utils";
import { trpc, TRPCAppError } from "@/lib/trpc";
import { Game } from "@repo/models";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

const Lobby: React.FC = () => {
  const { gameId } = Route.useParams();
  const [gameState, setGameState] = React.useState<Game | null>(null);
  const [gameError, setGameError] = React.useState<TRPCAppError | null>(null);
  const user = useUserOrRedirect({ from: "/lobby/$gameId" });
  const nav = Route.useNavigate();
  const { toast } = useToast();

  trpc.game.game.useSubscription(
    { gameId },
    {
      onData: setGameState,
      onError: setGameError,
    }
  );
  const mutation = trpc.gameSetup.startGame.useMutation();

  const stringifiedPlayers = JSON.stringify(gameState?.players ?? {});
  React.useEffect(() => {
    if (gameState?.players && user) {
      // data has loaded
      if (!gameState.players.some((player) => player.publicId === user.publicId)) {
        // user is not in the game
        nav({ to: "/" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    stringifiedPlayers, // passing stringified version instead for deep equality check
    nav,
  ]);

  React.useEffect(() => {
    if (gameState?.state === "playing") {
      nav({ to: `/game/${gameId}` });
    }
  }, [gameState?.state, gameId, nav]);

  const isHost = gameState?.host.id === user?.id;

  return (
    <div>
      {gameState && user ? (
        <div>
          <h1>{gameState.publicId}</h1>
          <p>Players:</p>
          <ul className="list-disc">
            {gameState.players.map((player) => (
              <li className="ml-4" key={player.publicId}>
                {player.publicId === user.publicId ? (
                  <span className="font-bold">You ({player.name})</span>
                ) : (
                  player.name
                )}
              </li>
            ))}
          </ul>
          {isHost && (
            <>
              <div className="h-4" />
              <Button
                size="lg"
                disabled={gameState.players.length < 2 || mutation.isPending}
                onClick={() => mutation.mutate({ gameId })}
              >
                Start Game{gameState.players.length < 2 ? " (need at least 2 players)" : ""}
              </Button>
            </>
          )}
          <div className="h-4" />
          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/join?gameId=${encodeURIComponent(gameState.publicId)}`
              );
              toast({ title: "Link copied" });
            }}
          >
            Copy game link
          </Button>
        </div>
      ) : gameError ? (
        <div>
          <h1>Error</h1>
          <p>{gameError.message}</p>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export const Route = createFileRoute("/_setup/lobby/$gameId")({
  component: Lobby,
});
