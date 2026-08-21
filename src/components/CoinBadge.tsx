import { useEffect, useRef, useState } from "react";
import { useWallet } from "../store/wallet";

// ジェム残高をカウントアップ演出つきで表示するバッジ
export function GemBadge() {
  const gems = useWallet((s) => s.gems);
  const [display, setDisplay] = useState(gems);
  const raf = useRef<number>();

  useEffect(() => {
    const from = display;
    const to = gems;
    if (from === to) return;
    const start = performance.now();
    const dur = 600;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gems]);

  return (
    <div className="coin-badge" title="所持ジェム">
      <span className="coin-icon">💎</span>
      <span className="coin-amount">{display.toLocaleString()}</span>
    </div>
  );
}
