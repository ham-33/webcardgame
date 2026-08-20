// boardgame.io を使ったブラックジャックのゲーム定義
import type { Game, Move } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";
import {
  buildDeck,
  bjHandValue,
  isBlackjack,
  type PlayingCard,
} from "../lib/deck";

export type BjPhase = "betting" | "playing" | "result";

export interface BlackjackState {
  deck: PlayingCard[];
  player: PlayingCard[];
  dealer: PlayingCard[];
  bet: number;
  phase: BjPhase;
  roundId: number;
  // 払い戻し額(ベット込み)。負けは 0、プッシュは bet、勝ちは bet*2、BJ は bet*2.5
  payout: number;
  outcome: "win" | "lose" | "push" | "blackjack" | null;
  doubled: boolean;
}

const deal: Move<BlackjackState> = ({ G, random }, bet: number) => {
  if (G.phase !== "betting") return INVALID_MOVE;
  if (!Number.isFinite(bet) || bet <= 0) return INVALID_MOVE;
  G.deck = random.Shuffle(buildDeck());
  G.player = [G.deck.pop()!, G.deck.pop()!];
  G.dealer = [G.deck.pop()!, G.deck.pop()!];
  G.bet = bet;
  G.doubled = false;
  G.outcome = null;
  G.payout = 0;
  G.roundId += 1;

  const playerBJ = isBlackjack(G.player);
  const dealerBJ = isBlackjack(G.dealer);
  if (playerBJ || dealerBJ) {
    if (playerBJ && dealerBJ) {
      G.outcome = "push";
      G.payout = G.bet;
    } else if (playerBJ) {
      G.outcome = "blackjack";
      G.payout = Math.floor(G.bet * 2.5);
    } else {
      G.outcome = "lose";
      G.payout = 0;
    }
    G.phase = "result";
  } else {
    G.phase = "playing";
  }
};

function settle(G: BlackjackState) {
  const p = bjHandValue(G.player).total;
  const d = bjHandValue(G.dealer).total;
  if (p > 21) {
    G.outcome = "lose";
    G.payout = 0;
  } else if (d > 21 || p > d) {
    G.outcome = "win";
    G.payout = G.bet * 2;
  } else if (p === d) {
    G.outcome = "push";
    G.payout = G.bet;
  } else {
    G.outcome = "lose";
    G.payout = 0;
  }
  G.phase = "result";
}

function dealerPlay(G: BlackjackState) {
  while (bjHandValue(G.dealer).total < 17) {
    G.dealer.push(G.deck.pop()!);
  }
  settle(G);
}

const hit: Move<BlackjackState> = ({ G }) => {
  if (G.phase !== "playing") return INVALID_MOVE;
  G.player.push(G.deck.pop()!);
  if (bjHandValue(G.player).total > 21) {
    settle(G);
  }
};

const stand: Move<BlackjackState> = ({ G }) => {
  if (G.phase !== "playing") return INVALID_MOVE;
  dealerPlay(G);
};

// ダブルダウン: ベットを倍にして 1 枚だけ引いてスタンド(追加ベット分はUI側で残高から引く)
const double: Move<BlackjackState> = ({ G }) => {
  if (G.phase !== "playing" || G.player.length !== 2 || G.doubled)
    return INVALID_MOVE;
  G.bet *= 2;
  G.doubled = true;
  G.player.push(G.deck.pop()!);
  if (bjHandValue(G.player).total > 21) {
    settle(G);
  } else {
    dealerPlay(G);
  }
};

const nextRound: Move<BlackjackState> = ({ G }) => {
  if (G.phase !== "result") return INVALID_MOVE;
  G.phase = "betting";
  G.player = [];
  G.dealer = [];
  G.bet = 0;
  G.outcome = null;
  G.payout = 0;
  G.doubled = false;
};

export const Blackjack: Game<BlackjackState> = {
  name: "blackjack",
  setup: (): BlackjackState => ({
    deck: [],
    player: [],
    dealer: [],
    bet: 0,
    phase: "betting",
    roundId: 0,
    payout: 0,
    outcome: null,
    doubled: false,
  }),
  moves: { deal, hit, stand, double, nextRound },
};
