// boardgame.io を使ったビデオポーカー(Jacks or Better)のゲーム定義
import type { Game, Move } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";
import { buildDeck, rankValue, type PlayingCard } from "../lib/deck";

export type PokerPhase = "betting" | "draw" | "result";

export interface PokerState {
  deck: PlayingCard[];
  hand: PlayingCard[];
  held: boolean[];
  bet: number;
  phase: PokerPhase;
  roundId: number;
  payout: number;
  handName: string | null;
  mult: number;
}

export interface HandResult {
  name: string;
  mult: number; // 払い戻し倍率(0 = 負け)
}

// 役judge: A=1 だが ストレートでは A を 14 としても扱う
export function evaluateHand(hand: PlayingCard[]): HandResult {
  const values = hand.map((c) => rankValue(c.rank)).sort((a, b) => a - b);
  const suits = hand.map((c) => c.suit);
  const flush = suits.every((s) => s === suits[0]);

  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const groups = [...counts.values()].sort((a, b) => b - a);

  const uniq = [...counts.keys()].sort((a, b) => a - b);
  let straight = false;
  let royal = false;
  if (uniq.length === 5) {
    if (uniq[4] - uniq[0] === 4) straight = true;
    // A-10-J-Q-K (A=1, 10,11,12,13)
    if (uniq[0] === 1 && uniq[1] === 10 && uniq[4] === 13) {
      straight = true;
      royal = true;
    }
  }

  if (straight && flush && royal) return { name: "ロイヤルフラッシュ", mult: 250 };
  if (straight && flush) return { name: "ストレートフラッシュ", mult: 50 };
  if (groups[0] === 4) return { name: "フォーカード", mult: 25 };
  if (groups[0] === 3 && groups[1] === 2) return { name: "フルハウス", mult: 9 };
  if (flush) return { name: "フラッシュ", mult: 6 };
  if (straight) return { name: "ストレート", mult: 4 };
  if (groups[0] === 3) return { name: "スリーカード", mult: 3 };
  if (groups[0] === 2 && groups[1] === 2) return { name: "ツーペア", mult: 2 };
  if (groups[0] === 2) {
    // J以上のペアのみ勝ち (J=11, Q=12, K=13, A=1)
    const pairValue = [...counts.entries()].find(([, n]) => n === 2)![0];
    if (pairValue >= 11 || pairValue === 1)
      return { name: "ジャックス・オア・ベター", mult: 1 };
  }
  return { name: "役なし", mult: 0 };
}

const deal: Move<PokerState> = ({ G, random }, bet: number) => {
  if (G.phase !== "betting") return INVALID_MOVE;
  if (!Number.isFinite(bet) || bet <= 0) return INVALID_MOVE;
  G.deck = random.Shuffle(buildDeck());
  G.hand = G.deck.splice(0, 5);
  G.held = [false, false, false, false, false];
  G.bet = bet;
  G.payout = 0;
  G.handName = null;
  G.mult = 0;
  G.roundId += 1;
  G.phase = "draw";
};

const toggleHold: Move<PokerState> = ({ G }, i: number) => {
  if (G.phase !== "draw" || i < 0 || i > 4) return INVALID_MOVE;
  G.held[i] = !G.held[i];
};

const draw: Move<PokerState> = ({ G }) => {
  if (G.phase !== "draw") return INVALID_MOVE;
  for (let i = 0; i < 5; i++) {
    if (!G.held[i]) G.hand[i] = G.deck.pop()!;
  }
  const result = evaluateHand(G.hand);
  G.handName = result.name;
  G.mult = result.mult;
  G.payout = G.bet * result.mult;
  G.phase = "result";
};

const nextRound: Move<PokerState> = ({ G }) => {
  if (G.phase !== "result") return INVALID_MOVE;
  G.phase = "betting";
  G.hand = [];
  G.held = [false, false, false, false, false];
  G.bet = 0;
  G.payout = 0;
  G.handName = null;
  G.mult = 0;
};

export const VideoPoker: Game<PokerState> = {
  name: "videopoker",
  setup: (): PokerState => ({
    deck: [],
    hand: [],
    held: [false, false, false, false, false],
    bet: 0,
    phase: "betting",
    roundId: 0,
    payout: 0,
    handName: null,
    mult: 0,
  }),
  moves: { deal, toggleHold, draw, nextRound },
};

export const PAYTABLE: HandResult[] = [
  { name: "ロイヤルフラッシュ", mult: 250 },
  { name: "ストレートフラッシュ", mult: 50 },
  { name: "フォーカード", mult: 25 },
  { name: "フルハウス", mult: 9 },
  { name: "フラッシュ", mult: 6 },
  { name: "ストレート", mult: 4 },
  { name: "スリーカード", mult: 3 },
  { name: "ツーペア", mult: 2 },
  { name: "ジャックス・オア・ベター", mult: 1 },
];
