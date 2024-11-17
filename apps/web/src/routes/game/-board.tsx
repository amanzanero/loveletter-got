import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserOrRedirect } from "@/lib/state/utils";
import { cn } from "@/lib/utils";
import { Card as CardModel, Game } from "@repo/models";
import { Shield } from "lucide-react";
import React from "react";

export const Board: React.FC<{ game: Game }> = ({ game }) => {
  const user = useUserOrRedirect({ from: "/game/$gameId" });
  const userPlayer = game.players.find((player) => player.publicId === user?.publicId)!;
  const currentPlayerTurn = game.players.find((player) => player.order === game.playerTurn)!;
  const isUserTurn = user?.publicId === currentPlayerTurn?.publicId;
  return (
    <div className="flex flex-col p-4 space-y-4">
      <div className="w-full flex justify-between">
        <Badge className="text-lg py-1 px-3">Deck: {game.deck.length} cards</Badge>
        <Badge variant="outline" className="text-lg py-1 px-3">
          {isUserTurn ? "Your turn" : `Turn: ${currentPlayerTurn.name}`}
        </Badge>
      </div>
      <DiscardedCards cards={game.discarded} />
      {isUserTurn ? (
        <CurrentHandPlaying
          hand={userPlayer.hand}
          onDiscard={(card) => {
            console.log("Discarding card", card);
          }}
        />
      ) : (
        <CurrentHandNotPlaying card={userPlayer.hand[0]} />
      )}
      <Players players={game.players} currentPlayerId={user?.publicId ?? ""} />
    </div>
  );
};

const cardColors: Record<string, string> = {
  Guard: "bg-gray-200",
  Priest: "bg-blue-200",
  Baron: "bg-green-200",
  Handmaid: "bg-yellow-200",
  Prince: "bg-purple-200",
  King: "bg-red-200",
  Countess: "bg-pink-200",
  Princess: "bg-indigo-200",
  Chancellor: "bg-teal-200",
};

const DiscardedCards: React.FC<{ cards: CardModel[] }> = ({ cards }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Discarded Cards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto py-4 px-2" style={{ minHeight: "100px" }}>
          {cards.map((card, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-16 h-24 ${cardColors[card.name]} rounded-md shadow-md flex flex-col justify-between p-1 text-xs font-semibold`}
              style={{
                marginLeft: index === 0 ? "0" : "-30px",
                zIndex: index,
              }}
            >
              <div>{card.name}</div>
              <div className="text-right">{card.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const CurrentHandPlaying: React.FC<{
  hand: CardModel[];
  onDiscard?: (card: CardModel) => void;
}> = ({ hand, onDiscard }) => {
  const [selectedCard, setSelectedCard] = React.useState<CardModel | null>(null);
  const handleCardSelect = (card: CardModel) => {
    setSelectedCard(card);
  };
  const handleDiscard = () => {
    if (selectedCard) {
      onDiscard?.(selectedCard);
      setSelectedCard(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Your Hand</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-4">
          {hand.map((card, i) => (
            <button
              key={card.name + i}
              onClick={() => handleCardSelect(card)}
              className={`w-32 h-48 rounded-lg ${cardColors[card.name]} ${
                selectedCard === card ? "ring-4 ring-blue-500" : ""
              } transition-all duration-200 ease-in-out transform ${
                selectedCard === card ? "scale-105" : "hover:scale-105"
              } focus:outline-none focus:ring-4 focus:ring-blue-500`}
              aria-pressed={selectedCard === card}
              aria-label={`Select ${card}`}
            >
              <div className="h-full flex flex-col justify-between p-2">
                <div className="text-lg font-bold">{card.name}</div>
                <div className="text-xs">{card.fullDescription}</div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={handleDiscard} disabled={!selectedCard} className="mt-4">
          Discard{selectedCard ? ` ${selectedCard.name}` : ""}
        </Button>
      </CardFooter>
    </Card>
  );
};

const CurrentHandNotPlaying: React.FC<{ card: CardModel }> = ({ card }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Your Hand</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-4">
          <button
            disabled
            className={cn(
              cardColors[card.name],
              "w-32 h-48 rounded-lg focus:outline-none focus:ring-4"
            )}
          >
            <div className="h-full flex flex-col justify-between p-2">
              <div className="text-lg font-bold">{card.name}</div>
              <div className="text-xs">{card.fullDescription}</div>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

const Players: React.FC<{ players: Game["players"]; currentPlayerId: string }> = ({
  players,
  currentPlayerId,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Players</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {players
            .sort((a, b) => a.order - b.order)
            .map((player) => {
              const isCurrentPlayer = currentPlayerId === player.publicId;
              return (
                <div
                  key={player.id}
                  className={cn(
                    "flex items-center justify-between p-2 border rounded",
                    isCurrentPlayer && "font-bold"
                  )}
                >
                  <span>
                    {player.name}
                    {isCurrentPlayer ? " (You)" : ""}
                  </span>
                  {player.protected && (
                    <Shield className="text-blue-500" size={20} aria-label="Protected" />
                  )}
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
};
