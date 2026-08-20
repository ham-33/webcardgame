// トランプデッキのユーティリティ
export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank =
  | "A" | "2" | "3" | "4" | "5" | "6"
  | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface PlayingCard {
  suit: Suit;
  rank: Rank;
  id: string;
}

export const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
export const RANKS: Rank[] = [
  "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",
];

export function buildDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${suit}${rank}` });
    }
  }
  return deck;
}

// boardgame.io の random API 互換のシャッフル(呼び出し側が random.Shuffle を渡す)
export function isRed(card: PlayingCard): boolean {
  return card.suit === "♥" || card.suit === "♦";
}

// ハイ&ロー用: A=1 ... K=13
export function rankValue(rank: Rank): number {
  const i = RANKS.indexOf(rank);
  return i + 1;
}

// ブラックジャック用: A は 1 or 11、絵札は 10
export function bjHandValue(cards: PlayingCard[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === "A") {
      aces += 1;
      total += 1;
    } else if (c.rank === "J" || c.rank === "Q" || c.rank === "K") {
      total += 10;
    } else {
      total += rankValue(c.rank);
    }
  }
  let soft = false;
  if (aces > 0 && total + 10 <= 21) {
    total += 10;
    soft = true;
  }
  return { total, soft };
}

export function isBlackjack(cards: PlayingCard[]): boolean {
  return cards.length === 2 && bjHandValue(cards).total === 21;
}
