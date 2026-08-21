import { useEffect, useRef } from "react";
import type { BoardProps } from "boardgame.io/react";
import type { HighLowState } from "../games/highlow";
import { multiplierFor } from "../games/highlow";
import { useWallet } from "../store/wallet";
import { CardView } from "./CardView";
import { BetPanel } from "./BetPanel";

type Props = BoardProps<HighLowState>;

export function HighLowBoard({ G, moves }: Props) {
  const { spend, earn, recordGame } = useWallet();
  const creditedRound = useRef(0);

  useEffect(() => {
    if (G.phase === "result" && G.roundId > creditedRound.current) {
      creditedRound.current = G.roundId;
      if (G.payout > 0) earn(G.payout);
      recordGame(G.payout - G.bet);
    }
  }, [G.phase, G.roundId, G.payout, G.bet, earn, recordGame]);

  const handleStart = (bet: number) => {
    if (spend(bet)) moves.start(bet);
  };

  const potential = Math.floor((G.bet * G.multiplier) / 100);
  const nextMult = multiplierFor(G.streak + 1);

  return (
    <div className="table highlow-table">
      {G.phase === "betting" ? (
        <div className="table-center">
          <h2 className="table-title">
            <span className="suit-deco">♦</span> HIGH &amp; LOW{" "}
            <span className="suit-deco">♣</span>
          </h2>
          <p className="table-rule">
            次のカードが高いか低いか予想 / 連勝で倍率UP / 同じ数字は勝ち
          </p>
          <BetPanel onDeal={handleStart} dealLabel="🔥 スタート" />
        </div>
      ) : (
        <>
          <div className="hl-streak-bar">
            <div className="hl-streak">
              <span className="hl-streak-num">{G.streak}</span>
              <span className="hl-streak-label">連勝</span>
            </div>
            <div className="hl-mult">
              倍率 <b>×{(G.multiplier / 100).toFixed(2)}</b>
              {G.phase === "guessing" && (
                <span className="hl-next-mult">
                  → 次勝てば ×{(nextMult / 100).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="hl-card-stage">
            {G.history.length > 1 && (
              <div className="hl-history">
                {G.history.slice(-6, -1).map((c) => (
                  <span key={c.id} className={`hl-mini ${["♥", "♦"].includes(c.suit) ? "red" : ""}`}>
                    {c.rank}
                    {c.suit}
                  </span>
                ))}
              </div>
            )}
            <CardView card={G.current} size="lg" key={G.current?.id} />
          </div>

          {G.phase === "guessing" ? (
            <>
              <div className="hl-guess-row">
                <button
                  className="btn btn-hl btn-high"
                  onClick={() => moves.guess("high")}
                >
                  ▲ HIGH
                </button>
                <button
                  className="btn btn-hl btn-low"
                  onClick={() => moves.guess("low")}
                >
                  ▼ LOW
                </button>
              </div>
              <button
                className="btn btn-gold btn-cashout"
                disabled={G.streak < 1}
                onClick={() => moves.cashout()}
              >
                💰 キャッシュアウト{" "}
                {G.streak >= 1 && `+${potential.toLocaleString()} 💎`}
              </button>
            </>
          ) : (
            <div className="table-mid">
              <div
                className={`outcome-banner ${G.outcome === "cashout" ? "win" : "lose"}`}
              >
                <span className="outcome-text">
                  {G.outcome === "cashout" ? "CASH OUT!" : "BUST…"}
                </span>
                {G.payout > 0 && (
                  <span className="outcome-payout">
                    +{G.payout.toLocaleString()} 💎
                  </span>
                )}
              </div>
              <button
                className="btn btn-primary btn-next"
                onClick={() => moves.nextRound()}
              >
                もう一度プレイ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
