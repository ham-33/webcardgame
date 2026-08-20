// boardgame.io を使ったメモリーマッチ(神経衰弱)のゲーム定義
import type { Game, Move } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";

export const PAIR_SYMBOLS = ["🔥", "🌿", "💧", "☀️", "🌙", "💎"];
export const MAX_MISSES = 8;

export type MemoryPhase = "betting" | "playing" | "result";

export interface MemoryState {
  cards: string[]; // シャッフル済み 12 枚(6ペア)
  flipped: number[]; // 現在めくられている index(最大2)
  matched: boolean[];
  misses: number;
  pairsFound: number;
  bet: number;
  phase: MemoryPhase;
  roundId: number;
  payout: number;
  outcome: "clear" | "fail" | null;
}

// クリア時の倍率(x100): ミスが少ないほど高倍率
export function clearMultiplier(misses: number): number {
  if (misses <= 2) return 300;
  if (misses <= 4) return 250;
  if (misses <= 6) return 200;
  return 150;
}

const start: Move<MemoryState> = ({ G, random }, bet: number) => {
  if (G.phase !== "betting") return INVALID_MOVE;
  if (!Number.isFinite(bet) || bet <= 0) return INVALID_MOVE;
  G.cards = random.Shuffle([...PAIR_SYMBOLS, ...PAIR_SYMBOLS]);
  G.flipped = [];
  G.matched = Array(12).fill(false);
  G.misses = 0;
  G.pairsFound = 0;
  G.bet = bet;
  G.payout = 0;
  G.outcome = null;
  G.roundId += 1;
  G.phase = "playing";
};

const flip: Move<MemoryState> = ({ G }, i: number) => {
  if (G.phase !== "playing") return INVALID_MOVE;
  if (i < 0 || i >= 12 || G.matched[i] || G.flipped.includes(i))
    return INVALID_MOVE;
  if (G.flipped.length >= 2) return INVALID_MOVE;
  G.flipped.push(i);
};

// 2枚めくった後の判定(UI側が演出ディレイ後に呼ぶ)
const resolve: Move<MemoryState> = ({ G }) => {
  if (G.phase !== "playing" || G.flipped.length !== 2) return INVALID_MOVE;
  const [a, b] = G.flipped;
  if (G.cards[a] === G.cards[b]) {
    G.matched[a] = true;
    G.matched[b] = true;
    G.pairsFound += 1;
  } else {
    G.misses += 1;
  }
  G.flipped = [];

  if (G.pairsFound === PAIR_SYMBOLS.length) {
    G.outcome = "clear";
    G.payout = Math.floor((G.bet * clearMultiplier(G.misses)) / 100);
    G.phase = "result";
  } else if (G.misses >= MAX_MISSES) {
    // 失敗でも見つけたペア数に応じて 20%/ペア を払い戻し
    G.outcome = "fail";
    G.payout = Math.floor((G.bet * G.pairsFound * 20) / 100);
    G.phase = "result";
  }
};

const nextRound: Move<MemoryState> = ({ G }) => {
  if (G.phase !== "result") return INVALID_MOVE;
  G.phase = "betting";
  G.cards = [];
  G.flipped = [];
  G.matched = [];
  G.misses = 0;
  G.pairsFound = 0;
  G.bet = 0;
  G.payout = 0;
  G.outcome = null;
};

export const MemoryMatch: Game<MemoryState> = {
  name: "memory",
  setup: (): MemoryState => ({
    cards: [],
    flipped: [],
    matched: [],
    misses: 0,
    pairsFound: 0,
    bet: 0,
    phase: "betting",
    roundId: 0,
    payout: 0,
    outcome: null,
  }),
  moves: { start, flip, resolve, nextRound },
};
