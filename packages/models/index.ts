export interface Player {
  id: number;
  publicId: string;
  name: string;
}

export interface Game {
  id: number;
  publicId: string;
  players: Player[];
  host: Player;
  state: "waiting" | "playing" | "finished";
}

export interface Card {
  name: string;
  value: number;
  shortDescription: string;
  fullDescription: string[];
  quantity: number;
}

export type CardType =
  | "SPY"
  | "GUARD"
  | "PRIEST"
  | "BARON"
  | "HANDMAID"
  | "PRINCE"
  | "CHANCELLOR"
  | "KING"
  | "COUNTESS"
  | "PRINCESS";

export const Cards: Record<CardType, Card> = {
  SPY: {
    name: "Spy",
    value: 0,
    shortDescription: "Gain token if alive at end of round and only player to play spy",
    fullDescription: [
      "A Spy has no effect when played or discarded.",
      "At the end of the round, if you are the only player still in the round who played or discarded a Spy, you gain one favor token.",
      "This does not count as winning the round; the winner (even if it is you) still gains their token",
      "Even if you play and/or discard two Spies, you still gain only one token.",
    ],
    quantity: 2,
  } satisfies Card,
  GUARD: {
    name: "Guard",
    value: 1,
    shortDescription: "Guess a player's hand",
    fullDescription: [
      "Choose another player and name a character other than Guard. If the chosen player has that card in their hand, they are out of the round.",
    ],
    quantity: 0,
  } satisfies Card,
  PRIEST: {
    name: "Priest",
    value: 2,
    shortDescription: "Look at a hand",
    fullDescription: [
      "Choose another player and secretly look at their hand (without revealing it to anyone else).",
    ],
    quantity: 0,
  } satisfies Card,
  BARON: {
    name: "Baron",
    value: 3,
    shortDescription: "Compare hands",
    fullDescription: [
      "Choose another player. You and that player secretly compare your hands. Whoever has the lowervalue card is out of the round.",
      "If there is a tie, neither player is out of the round.",
    ],
    quantity: 2,
  } satisfies Card,
  HANDMAID: {
    name: "Handmaid",
    value: 4,
    shortDescription: "Protection until your next turn",
    fullDescription: [
      "Until the start of your next turn, other players cannot choose you for their card effects.",
      "In the rare case that all other players still in the round are “protected” by a Handmaid when you play a card, do the following:",
      "  - If that card requires you to choose another player (Guard, Priest, Baron, King), your card is played with no effect.",
      "  - If that card requires you to choose any player (Prince), then you must choose yourself for the effect.",
    ],
    quantity: 2,
  } satisfies Card,
  PRINCE: {
    name: "Prince",
    value: 5,
    shortDescription: "One player discards their hand",
    fullDescription: [
      "Choose any player (including yourself). That player discards their hand (without resolving its effect) and draws a new hand.",
      "If the deck is empty, the chosen player draws the facedown set-aside card.",
      "If a player chooses you for the Prince effect, and you are forced to discard the Princess, you are out of the round.",
    ],
    quantity: 2,
  } satisfies Card,
  CHANCELLOR: {
    name: "Chancellor",
    value: 6,
    shortDescription: "Draw 2 cards, keep 1, and place 2 at bottom of deck",
    fullDescription: [
      "Draw two cards from the deck into your hand. Choose and keep one of the three cards now in your hand, and place the other two facedown on the bottom of the deck in any order.",
      "If there is only one card in the deck, draw it and return one card. If there are no cards left, this card is played with no effect.",
    ],
    quantity: 2,
  } satisfies Card,
  KING: {
    name: "King",
    value: 7,
    shortDescription: "Trade hands",
    fullDescription: ["Choose another player and trade hands with that player."],
    quantity: 1,
  } satisfies Card,
  COUNTESS: {
    name: "Countess",
    value: 8,
    shortDescription: "Discard if caught with King or Prince",
    fullDescription: [
      "The Countess has no effect when played or discarded.",
      "You must play the Countess as the card for your turn if either the King or a Prince is the other card in your hand.",
      "You can still choose to play the Countess as the card for your turn even if you do not have the King or a Prince.",
      "When you play the Countess, do not reveal your other card; the other players will not know if you were forced to play it or chose to play it.",
      "The Countess’s effect does not apply when you draw cards for other effects (Chancellor).",
    ],
    quantity: 1,
  } satisfies Card,
  PRINCESS: {
    name: "Princess",
    value: 9,
    shortDescription: "Lose if discarded",
    fullDescription: [
      "If you either play or discard the Princess for any reason, you are immediately out of the round.",
    ],
    quantity: 1,
  } satisfies Card,
};

export const CardList = Object.entries(Cards) as [CardType, Card][];
