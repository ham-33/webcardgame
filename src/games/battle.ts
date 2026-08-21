// boardgame.io を使った MARV バトル(デッキ対戦)のゲーム定義
// 集めたカード5枚のデッキで CPU と対戦。属性相性 ×1.3 を読み合う。
import type { Game, Move } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";
import {
  CATALOG,
  CARD_BY_ID,
  effectivePower,
  hasAdvantage,
} from "../lib/cards";

export type BattlePhase = "betting" | "playing" | "result";

export interface RoundLog {
  playerCard: string;
  cpuCard: string;
  playerPower: number;
  cpuPower: number;
  playerAdv: boolean;
  cpuAdv: boolean;
  winner: "player" | "cpu" | "draw";
}

export interface BattleState {
  playerHand: string[]; // 残りカード id
  cpuHand: string[];
  playerWins: number;
  cpuWins: number;
  rounds: RoundLog[];
  bet: number;
  phase: BattlePhase;
  roundId: number;
  payout: number;
  outcome: "win" | "lose" | "draw" | null;
}

const start: Move<BattleState> = (
  { G, random },
  bet: number,
  deckIds: string[]
) => {
  if (G.phase !== "betting") return INVALID_MOVE;
  if (!Number.isFinite(bet) || bet <= 0) return INVALID_MOVE;
  if (
    !Array.isArray(deckIds) ||
    deckIds.length !== 5 ||
    deckIds.some((id) => !CARD_BY_ID[id])
  )
    return INVALID_MOVE;
  G.playerHand = [...deckIds];
  // CPU はカタログからランダム5枚(UR は出にくいよう N/R/SR 中心に重み付け)
  const pool = random.Shuffle(
    CATALOG.filter((c) => c.rarity !== "UR").map((c) => c.id)
  );
  const cpu = pool.slice(0, 4);
  // 1枚だけ SR 以上を保証して手応えを出す
  const strong = random.Shuffle(
    CATALOG.filter((c) => c.rarity === "SR" || c.rarity === "UR").map((c) => c.id)
  )[0];
  G.cpuHand = random.Shuffle([...cpu, strong]);
  G.playerWins = 0;
  G.cpuWins = 0;
  G.rounds = [];
  G.bet = bet;
  G.payout = 0;
  G.outcome = null;
  G.roundId += 1;
  G.phase = "playing";
};

const playCard: Move<BattleState> = ({ G, random }, cardId: string) => {
  if (G.phase !== "playing") return INVALID_MOVE;
  const idx = G.playerHand.indexOf(cardId);
  if (idx === -1) return INVALID_MOVE;

  const cpuIdx = Math.floor(random.Number() * G.cpuHand.length);
  const cpuId = G.cpuHand[cpuIdx];
  const pc = CARD_BY_ID[cardId];
  const cc = CARD_BY_ID[cpuId];

  const pPower = effectivePower(pc, cc);
  const cPower = effectivePower(cc, pc);
  const winner =
    pPower > cPower ? "player" : cPower > pPower ? "cpu" : "draw";

  G.rounds.push({
    playerCard: cardId,
    cpuCard: cpuId,
    playerPower: pPower,
    cpuPower: cPower,
    playerAdv: hasAdvantage(pc.element, cc.element),
    cpuAdv: hasAdvantage(cc.element, pc.element),
    winner,
  });
  if (winner === "player") G.playerWins += 1;
  if (winner === "cpu") G.cpuWins += 1;

  G.playerHand.splice(idx, 1);
  G.cpuHand.splice(cpuIdx, 1);

  if (G.playerHand.length === 0) {
    if (G.playerWins > G.cpuWins) {
      G.outcome = "win";
      G.payout = G.bet * 2;
    } else if (G.playerWins === G.cpuWins) {
      G.outcome = "draw";
      G.payout = G.bet;
    } else {
      G.outcome = "lose";
      G.payout = 0;
    }
    G.phase = "result";
  }
};

const nextRound: Move<BattleState> = ({ G }) => {
  if (G.phase !== "result") return INVALID_MOVE;
  G.phase = "betting";
  G.playerHand = [];
  G.cpuHand = [];
  G.playerWins = 0;
  G.cpuWins = 0;
  G.rounds = [];
  G.bet = 0;
  G.payout = 0;
  G.outcome = null;
};

export const MarvBattle: Game<BattleState> = {
  name: "marvbattle",
  setup: (): BattleState => ({
    playerHand: [],
    cpuHand: [],
    playerWins: 0,
    cpuWins: 0,
    rounds: [],
    bet: 0,
    phase: "betting",
    roundId: 0,
    payout: 0,
    outcome: null,
  }),
  moves: { start, playCard, nextRound },
};
