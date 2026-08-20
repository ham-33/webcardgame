import { useEffect, useRef } from "react";
import type { BoardProps } from "boardgame.io/react";
import type { PokerState } from "../games/poker";
import { PAYTABLE } from "../games/poker";
import { useWallet } from "../store/wallet";
import { CardView } from "./CardView";
import { BetPanel } from "./BetPanel";

type Props = BoardProps<PokerState>;

export function PokerBoard({ G, moves }: Props) {
  const { spend, earn, recordGame } = useWallet();
  const creditedRound = useRef(0);

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

  return (
    <div className="table poker-table">
      {G.phase === "betting" ? (
        <div className="table-center">
          <h2 className="table-title">
            <span className="suit-deco">♣</span> VIDEO POKER{" "}
            <span className="suit-deco">♠</span>
          </h2>
          <p className="table-rule">
            残すカードを選んで1回だけ交換 / J以上のペアで勝ち
          </p>
          <details className="paytable-details">
            <summary>配当表を見る</summary>
            <table className="paytable">
              <tbody>
                {PAYTABLE.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td>×{p.mult}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
          <BetPanel onDeal={handleDeal} dealLabel="🎴 ディール" />
        </div>
      ) : (
        <>
          <div className="table-mid">
            {G.phase === "result" ? (
              <div
                className={`outcome-banner ${G.mult > 0 ? "win" : "lose"}`}
              >
                <span className="outcome-text">
                  {G.handName}
                  {G.mult > 0 && ` ×${G.mult}`}
                </span>
                {G.payout > 0 && (
                  <span className="outcome-payout">
                    +{G.payout.toLocaleString()} 💎
                  </span>
                )}
              </div>
            ) : (
              <p className="poker-hint">
                残したいカードをタップして <b>HOLD</b> → ドロー
              </p>
            )}
          </div>

          <div className="poker-hand">
            {G.hand.map((c, i) => (
              <button
                key={`${G.roundId}-${i}-${c.id}`}
                className={`poker-card ${G.held[i] ? "held" : ""}`}
                disabled={G.phase !== "draw"}
                onClick={() => moves.toggleHold(i)}
              >
                <CardView card={c} delay={i * 90} />
                <span className={`hold-badge ${G.held[i] ? "on" : ""}`}>
                  HOLD
                </span>
              </button>
            ))}
          </div>

          <div className="action-bar">
            {G.phase === "draw" ? (
              <button
                className="btn btn-primary btn-next"
                onClick={() => moves.draw()}
              >
                🔄 ドロー(交換して勝負)
              </button>
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
