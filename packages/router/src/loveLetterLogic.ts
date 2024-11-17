import { CardList, CardType } from "@repo/models";

export const initializeGame = ({
  playerIds,
}: {
  playerIds: number[];
}): {
  deck: CardType[];
  playerOrderAndHand: {
    playerId: number;
    hand: CardType[];
  }[];
  discarded: CardType[];
} => {
  const shuffledDeck = CardList.flatMap(
    ([cardType, card]) => Array(card.quantity).fill(cardType) as CardType[]
  ).sort(() => Math.random() - 0.5);
  const randomPlayerOrder = playerIds.sort(() => Math.random() - 0.5);
  const numCardsToReveal = playerIds.length === 2 ? 3 : 1;
  const discarded = shuffledDeck.splice(0, numCardsToReveal);
  const playerOrderAndHand = randomPlayerOrder.map((playerId) => ({
    playerId,
    hand: shuffledDeck.splice(0, 1),
  }));
  return {
    deck: shuffledDeck,
    playerOrderAndHand,
    discarded,
  };
};
