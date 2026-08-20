import { useEffect, useRef } from "react";
import type { BoardProps } from "boardgame.io/react";
import type { BlackjackState } from "../games/blackjack";
import { bjHandValue } from "../lib/deck";
import { useWallet } from "../store/wallet";
import { CardView } from "./CardView";
import { BetPanel } from "./BetPanel";

type Props = BoardProps<BlackjackState>;

const OUTCOME_LABEL: Record<string, { text: string; cls: string }> = {
  blackjack: { text: "BLACKJACK! ×2.5", cls: "win" },
  win: { text: "YOU WIN!", cls: "win" },
  push: { text: "PUSH — 引き分け", cls: "push" },
  lose: { text: "DEALER WINS", cls: "lose" },
};

export function BlackjackBoard({ G, moves }: Props) {
  const { spend, earn, recordGame } = useWallet();
  const creditedRound = useRef(0);

  // 結果フェーズに入ったら 1 ラウンド 1 回だけ払い戻し
  useEffect(() => {
    if (G.phase === "result" && G.roundId > creditedRound.current) {
      creditedRound.current = G.roundId;
      if (G.payout > 0) earn(G.payout);
      recordGame(G.payout - G.bet);
    }
  }, [G.phase, G.roundId, G.payout, G.bet, earn, recordGame]);

  const handleDeal = (bet: number) => {
    if (spend(bet)) moves.deal(bet);
  };

  const handleDouble = () => {
    if (spend(G.bet)) moves.double();
  };

  const playerVal = bjHandValue(G.player);
  const dealerVisible =
    G.phase === "playing" ? [G.dealer[0]] : G.dealer;
  const dealerVal =
    G.dealer.length > 0 ? bjHandValue(dealerVisible.filter(Boolean)) : null;
  const outcome = G.outcome ? OUTCOME_LABEL[G.outcome] : null;
  const canDouble =
    G.phase === "playing" &&
    G.player.length === 2 &&
    !G.doubled &&
    useWallet.getState().coins >= G.bet;

  return (
    <div className="table blackjack-table">
      {G.phase === "betting" ? (
        <div className="table-center">
          <h2 className="table-title">
            <span className="suit-deco">♠</span> BLACKJACK{" "}
            <span className="suit-deco">♥</span>
          </h2>
          <p className="table-rule">
            ディーラーは17でスタンド / ブラックジャックは 2.5 倍
          </p>
          <BetPanel onDeal={handleDeal} dealLabel="🃏 ディール" />
        </div>
      ) : (
        <>
          <div className="hand-area dealer-area">
            <div className="hand-label">
              DEALER{" "}
              {dealerVal && (
                <span className="hand-value">
                  {G.phase === "playing" ? `${dealerVal.total}+?` : dealerVal.total}
                </span>
              )}
            </div>
            <div className="hand-cards">
              {G.dealer.map((c, i) => (
                <CardView
                  key={c.id}
                  card={c}
                  faceDown={G.phase === "playing" && i === 1}
                  delay={i * 120}
                />
              ))}
            </div>
          </div>

          <div className="table-mid">
            {outcome && (
              <div className={`outcome-banner ${outcome.cls}`}>
                <span className="outcome-text">{outcome.text}</span>
                {G.payout > 0 && (
                  <span className="outcome-payout">
                    +{G.payout.toLocaleString()} 🪙
                  </span>
                )}
              </div>
            )}
            {G.phase === "playing" && (
              <div className="bet-chip-display">🪙 {G.bet.toLocaleString()}</div>
            )}
          </div>

          <div className="hand-area player-area">
            <div className="hand-label">
              YOU{" "}
              <span
                className={`hand-value ${playerVal.total > 21 ? "bust" : ""}`}
              >
                {playerVal.total}
                {playerVal.soft ? " (soft)" : ""}
              </span>
            </div>
            <div className="hand-cards">
              {G.player.map((c, i) => (
                <CardView key={c.id} card={c} delay={i * 120} />
              ))}
            </div>
          </div>

          <div className="action-bar">
            {G.phase === "playing" ? (
              <>
                <button className="btn btn-action btn-hit" onClick={() => moves.hit()}>
                  ヒット
                </button>
                <button
                  className="btn btn-action btn-stand"
                  onClick={() => moves.stand()}
                >
                  スタンド
                </button>
                <button
                  className="btn btn-action btn-double"
                  disabled={!canDouble}
                  onClick={handleDouble}
                >
                  ダブル ×2
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary btn-next"
                onClick={() => moves.nextRound()}
              >
                次のラウンドへ
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
