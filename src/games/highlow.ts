// boardgame.io を使ったハイ&ロー(連勝マルチプライヤー式)のゲーム定義
import type { Game, Move } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";
import { buildDeck, rankValue, type PlayingCard } from "../lib/deck";

export type HlPhase = "betting" | "guessing" | "result";

export interface HighLowState {
  deck: PlayingCard[];
  current: PlayingCard | null;
  history: PlayingCard[];
  bet: number;
  streak: number;
  multiplier: number; // 現在の払い戻し倍率 (x100 で整数管理: 100 = 1.00)
  phase: HlPhase;
  roundId: number;
  payout: number;
  outcome: "cashout" | "lose" | null;
  lastGuess: "high" | "low" | null;
  lastCard: PlayingCard | null;
}

// 連勝ごとの倍率テーブル(x100)。1勝目 x1.3、以降どんどん上がる
const MULTIPLIERS = [130, 180, 250, 350, 500, 750, 1100, 1600, 2400, 3600];

function multiplierFor(streak: number): number {
  if (streak <= 0) return 100;
  return MULTIPLIERS[Math.min(streak, MULTIPLIERS.length) - 1];
}

function drawCard(G: HighLowState): PlayingCard {
  return G.deck.pop()!;
}

const start: Move<HighLowState> = ({ G, random }, bet: number) => {
  if (G.phase !== "betting") return INVALID_MOVE;
  if (!Number.isFinite(bet) || bet <= 0) return INVALID_MOVE;
  G.deck = random.Shuffle(buildDeck());
  G.current = drawCard(G);
  G.history = [G.current];
  G.bet = bet;
  G.streak = 0;
  G.multiplier = 100;
  G.payout = 0;
  G.outcome = null;
  G.lastGuess = null;
  G.lastCard = null;
  G.roundId += 1;
  G.phase = "guessing";
};

const guess: Move<HighLowState> = ({ G, random }, dir: "high" | "low") => {
  if (G.phase !== "guessing" || !G.current) return INVALID_MOVE;
  if (G.deck.length < 5) {
    // 残り枚数が少なくなったらリシャッフル(現在のカードは除外)
    const cur = G.current;
    G.deck = random
      .Shuffle(buildDeck())
      .filter((c) => c.id !== cur.id);
  }
  const next = drawCard(G);
  const a = rankValue(G.current.rank);
  const b = rankValue(next.rank);
  G.lastGuess = dir;
  G.lastCard = G.current;
  G.current = next;
  G.history.push(next);

  const correct = dir === "high" ? b >= a : b <= a; // 同値は勝ち扱い(プレイヤー有利で気持ちいい)
  if (correct) {
    G.streak += 1;
    G.multiplier = multiplierFor(G.streak);
  } else {
    G.outcome = "lose";
    G.payout = 0;
    G.phase = "result";
  }
};

const cashout: Move<HighLowState> = ({ G }) => {
  if (G.phase !== "guessing" || G.streak < 1) return INVALID_MOVE;
  G.outcome = "cashout";
  G.payout = Math.floor((G.bet * G.multiplier) / 100);
  G.phase = "result";
};

const nextRound: Move<HighLowState> = ({ G }) => {
  if (G.phase !== "result") return INVALID_MOVE;
  G.phase = "betting";
  G.current = null;
  G.history = [];
  G.bet = 0;
  G.streak = 0;
  G.multiplier = 100;
  G.outcome = null;
  G.payout = 0;
  G.lastGuess = null;
  G.lastCard = null;
};

export const HighLow: Game<HighLowState> = {
  name: "highlow",
  setup: (): HighLowState => ({
    deck: [],
    current: null,
    history: [],
    bet: 0,
    streak: 0,
    multiplier: 100,
    phase: "betting",
    roundId: 0,
    payout: 0,
    outcome: null,
    lastGuess: null,
    lastCard: null,
  }),
  moves: { start, guess, cashout, nextRound },
};

export { multiplierFor, MULTIPLIERS };
