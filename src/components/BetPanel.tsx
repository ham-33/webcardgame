import { useState } from "react";
import { useWallet } from "../store/wallet";

const CHIPS = [50, 100, 500, 1000];

// チップを積んでベット額を決めるパネル
export function BetPanel({
  onDeal,
  dealLabel = "ディール",
  minBet = 50,
}: {
  onDeal: (bet: number) => void;
  dealLabel?: string;
  minBet?: number;
}) {
  const coins = useWallet((s) => s.coins);
  const [bet, setBet] = useState(0);

  const add = (v: number) => setBet((b) => Math.min(b + v, coins));
  const broke = coins < minBet;

  return (
    <div className="bet-panel">
      <div className="bet-display">
        <span className="bet-label">BET</span>
        <span className="bet-amount">🪙 {bet.toLocaleString()}</span>
        {bet > 0 && (
          <button className="bet-clear" onClick={() => setBet(0)}>
            クリア
          </button>
        )}
      </div>
      <div className="chip-row">
        {CHIPS.map((v) => (
          <button
            key={v}
            className={`chip chip-${v}`}
            disabled={bet + v > coins}
            onClick={() => add(v)}
          >
            {v >= 1000 ? `${v / 1000}K` : v}
          </button>
        ))}
        <button
          className="chip chip-max"
          disabled={coins <= 0}
          onClick={() => setBet(coins)}
        >
          MAX
        </button>
      </div>
      {broke ? (
        <p className="broke-note">
          コインが足りません… デイリーボーナスを受け取ろう 🎁
        </p>
      ) : (
        <button
          className="btn btn-primary btn-deal"
          disabled={bet < minBet}
          onClick={() => {
            onDeal(bet);
            setBet(0);
          }}
        >
          {bet < minBet ? `最低ベット ${minBet} 🪙` : dealLabel}
        </button>
      )}
    </div>
  );
}
