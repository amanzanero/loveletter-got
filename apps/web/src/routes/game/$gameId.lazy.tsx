import { createLazyFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { trpc, TRPCAppError } from "@/lib/trpc";
import React from "react";
import { useUserOrRedirect } from "@/lib/state/utils";
import { ReferenceCard } from "./-reference_card";
import { HelpCircle } from "lucide-react";
import { Game } from "@repo/models";

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
    <div className="flex gap-2">
      <button
        onClick={() => setIsReferenceOpen((curr) => !curr)}
        className="bg-white rounded-full p-2 shadow-md"
        aria-label="Toggle card reference"
      >
        <HelpCircle size={24} />
      </button>
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-4">
        <div className="flex-1 grid grid-cols-3 gap-4">
          <div className="bg-[#f0e6d6] rounded-lg p-4 flex flex-col items-center justify-center">
            <img
              src="/placeholder.svg"
              alt="Card"
              className="w-full h-auto"
              width="70"
              height="100"
              style={{ aspectRatio: "70/100", objectFit: "cover" }}
            />
            <div className="text-sm font-medium mt-2">Princess</div>
          </div>
          <div className="bg-[#f0e6d6] rounded-lg p-4 flex flex-col items-center justify-center">
            <img
              src="/placeholder.svg"
              alt="Card"
              className="w-full h-auto"
              width="70"
              height="100"
              style={{ aspectRatio: "70/100", objectFit: "cover" }}
            />
            <div className="text-sm font-medium mt-2">Countess</div>
          </div>
          <div className="bg-[#f0e6d6] rounded-lg p-4 flex flex-col items-center justify-center">
            <img
              src="/placeholder.svg"
              alt="Card"
              className="w-full h-auto"
              width="70"
              height="100"
              style={{ aspectRatio: "70/100", objectFit: "cover" }}
            />
            <div className="text-sm font-medium mt-2">King</div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="bg-[#f0e6d6] rounded-lg p-4 flex flex-col items-center justify-center">
            <img
              src="/placeholder.svg"
              alt="Card"
              className="w-full h-auto"
              width="70"
              height="100"
              style={{ aspectRatio: "70/100", objectFit: "cover" }}
            />
            <div className="text-sm font-medium mt-2">Guard</div>
          </div>
          <Button size="sm">Draw</Button>
        </div>
      </div>
      <div className="h-8" />
      <div className="flex gap-4">
        <Button variant="secondary" size="sm">
          Play
        </Button>
        <Button variant="secondary" size="sm">
          Discard
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">Hi</div>
      <ReferenceCard isOpen={isReferenceOpen} onClose={() => setIsReferenceOpen(false)} />
    </div>
  );
}

/**
 * import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Crown, HelpCircle, X } from "lucide-react";

// Mock data for demonstration
const players = [
  { id: 1, name: "Player 1", tokens: 2, protected: false },
  { id: 2, name: "Player 2", tokens: 1, protected: true },
  { id: 3, name: "Player 3", tokens: 0, protected: false },
  { id: 4, name: "Player 4", tokens: 3, protected: false },
];

const cards = [
  { id: 1, name: "Guard", value: 1, description: "Guess a player's hand" },
  { id: 2, name: "Priest", value: 2, description: "Look at a hand" },
  { id: 3, name: "Baron", value: 3, description: "Compare hands" },
  { id: 4, name: "Handmaid", value: 4, description: "Protection until your next turn" },
  { id: 5, name: "Prince", value: 5, description: "One player discards their hand" },
  { id: 6, name: "King", value: 6, description: "Trade hands" },
  { id: 7, name: "Countess", value: 7, description: "Discard if caught with King or Prince" },
  { id: 8, name: "Princess", value: 8, description: "Lose if discarded" },
];

function ReferenceCard({ isOpen, onClose }) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? 0 : "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg p-4 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Card Reference</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      <ul className="space-y-4">
        {cards.map((card) => (
          <li key={card.id} className="border-b pb-2">
            <h3 className="font-semibold">
              {card.name} ({card.value})
            </h3>
            <p className="text-sm text-gray-600">{card.description}</p>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function Component() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handlePlayerClick = (player) => {
    if (selectedCard && !player.protected) {
      setTargetPlayer(player);
      // Here you would implement the card effect logic
      setTimeout(() => {
        setSelectedCard(null);
        setTargetPlayer(null);
      }, 2000);
    }
  };

  const toggleReference = () => {
    setIsReferenceOpen(!isReferenceOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 p-4 md:p-8 relative">
      <h1 className="text-3xl font-bold text-center mb-8">Love Letter</h1>
      <button
        onClick={toggleReference}
        className="fixed top-4 right-4 bg-white rounded-full p-2 shadow-md"
        aria-label="Toggle card reference"
      >
        <HelpCircle size={24} />
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {players.map((player) => (
          <motion.div
            key={player.id}
            className={`bg-white rounded-lg shadow-lg p-4 ${
              targetPlayer?.id === player.id ? "ring-4 ring-blue-500" : ""
            }`}
            whileHover={{ scale: 1.02 }}
            onClick={() => handlePlayerClick(player)}
          >
            <h2 className="text-xl font-semibold mb-2">{player.name}</h2>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Crown className="text-yellow-500 mr-2" />
                <span>{player.tokens} tokens</span>
              </div>
              {player.protected && (
                <div className="flex items-center">
                  <Shield className="text-blue-500 mr-2" />
                  <span>Protected</span>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              {[1, 2].map((cardIndex) => (
                <motion.div
                  key={cardIndex}
                  className="w-16 h-24 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleCardClick(cards[Math.floor(Math.random() * cards.length)])}
                >
                  ?
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 flex justify-center space-x-8">
        <motion.div
          className="w-24 h-36 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold"
          whileHover={{ scale: 1.05 }}
        >
          Deck
        </motion.div>
        <motion.div
          className="w-24 h-36 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 font-bold"
          whileHover={{ scale: 1.05 }}
        >
          Discard
        </motion.div>
      </div>
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4"
          >
            <h3 className="text-lg font-semibold mb-2">Selected Card: {selectedCard.name}</h3>
            <p>Value: {selectedCard.value}</p>
            <p className="text-sm text-gray-600 mt-2">Click on a player to target them</p>
          </motion.div>
        )}
      </AnimatePresence>
      <ReferenceCard isOpen={isReferenceOpen} onClose={() => setIsReferenceOpen(false)} />
    </div>
  );
}

 */
