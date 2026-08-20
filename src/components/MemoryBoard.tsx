import { useEffect, useRef } from "react";
import type { BoardProps } from "boardgame.io/react";
import type { MemoryState } from "../games/memory";
import { MAX_MISSES } from "../games/memory";
import { useWallet } from "../store/wallet";
import { BetPanel } from "./BetPanel";

type Props = BoardProps<MemoryState>;

export function MemoryBoard({ G, moves }: Props) {
  const { spend, earn, recordGame } = useWallet();
  const creditedRound = useRef(0);

  useEffect(() => {
    if (G.phase === "result" && G.roundId > creditedRound.current) {
      creditedRound.current = G.roundId;
      if (G.payout > 0) earn(G.payout);
      recordGame(G.payout - G.bet);
    }
  }, [G.phase, G.roundId, G.payout, G.bet, earn, recordGame]);

  // 2枚めくったら少し見せてから判定
  useEffect(() => {
    if (G.phase === "playing" && G.flipped.length === 2) {
      const t = setTimeout(() => moves.resolve(), 750);
      return () => clearTimeout(t);
    }
  }, [G.flipped.length, G.phase, moves]);

  const handleStart = (bet: number) => {
    if (spend(bet)) moves.start(bet);
  };

  return (
    <div className="table memory-table">
      {G.phase === "betting" ? (
        <div className="table-center">
          <h2 className="table-title">
            <span className="suit-deco">🧠</span> MEMORY MATCH
          </h2>
          <p className="table-rule">
            6ペアを見つけよう / ミス{MAX_MISSES}回まで / ミスが少ないほど高配当(最大×3)
          </p>
          <BetPanel onDeal={handleStart} dealLabel="🧩 スタート" />
        </div>
      ) : (
        <>
          <div className="memory-status">
            <span className="mem-stat">
              ペア <b>{G.pairsFound}</b>/6
            </span>
            <span className="mem-stat">
              ミス{" "}
              <b className={G.misses >= MAX_MISSES - 2 ? "danger" : ""}>
                {G.misses}
              </b>
              /{MAX_MISSES}
            </span>
          </div>

          <div className="memory-grid">
            {G.cards.map((sym, i) => {
              const faceUp = G.matched[i] || G.flipped.includes(i);
              return (
                <button
                  key={`${G.roundId}-${i}`}
                  className={`mem-card ${faceUp ? "up" : ""} ${G.matched[i] ? "matched" : ""}`}
                  disabled={
                    G.phase !== "playing" || faceUp || G.flipped.length >= 2
                  }
                  onClick={() => moves.flip(i)}
                >
                  <span className="mem-inner">
                    <span className="mem-face mem-front">{sym}</span>
                    <span className="mem-face mem-back">✦</span>
                  </span>
                </button>
              );
            })}
          </div>

          {G.phase === "result" && (
            <div className="table-mid">
              <div
                className={`outcome-banner ${G.outcome === "clear" ? "win" : "lose"}`}
              >
                <span className="outcome-text">
                  {G.outcome === "clear" ? "ALL CLEAR!" : "TIME OVER…"}
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
