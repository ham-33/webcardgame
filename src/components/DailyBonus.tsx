import { useState } from "react";
import {
  useWallet,
  bonusForStreak,
  DAILY_STREAK_CAP,
} from "../store/wallet";

export function DailyBonusModal({ onClose }: { onClose: () => void }) {
  const { streak, lastClaimDate, canClaimToday, claimDaily } = useWallet();
  const claimable = canClaimToday();
  const [claimed, setClaimed] = useState(0);

  // 今日受け取る場合のストリーク位置(未受取なら次の日、受取済なら現在)
  const nextStreak = claimable
    ? lastClaimDate ===
      (() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })()
      ? streak + 1
      : 1
    : streak;

  const handleClaim = () => {
    const amount = claimDaily();
    if (amount > 0) setClaimed(amount);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal daily-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="閉じる">
          ✕
        </button>
        <div className="daily-header">
          <div className="daily-glow">🎁</div>
          <h2>デイリーボーナス</h2>
          <p className="daily-sub">
            毎日ログインしてジェムをゲット！連続ログインでボーナスUP
          </p>
        </div>

        <div className="streak-grid">
          {Array.from({ length: DAILY_STREAK_CAP }, (_, i) => {
            const day = i + 1;
            const done = claimed
              ? day <= nextStreak
              : claimable
                ? day < nextStreak
                : day <= streak;
            const isNext = !claimed && claimable && day === nextStreak;
            return (
              <div
                key={day}
                className={`streak-cell ${done ? "done" : ""} ${isNext ? "next" : ""}`}
              >
                <span className="streak-day">
                  {day === DAILY_STREAK_CAP ? `${day}日+` : `${day}日`}
                </span>
                <span className="streak-coin">💎</span>
                <span className="streak-amt">{bonusForStreak(day)}</span>
              </div>
            );
          })}
        </div>

        {claimed > 0 ? (
          <div className="claim-result">
            <span className="claim-burst">+{claimed.toLocaleString()} 💎</span>
            <p>また明日も来てね！連続 {nextStreak} 日目</p>
            <button className="btn btn-gold" onClick={onClose}>
              プレイする
            </button>
          </div>
        ) : claimable ? (
          <button className="btn btn-gold btn-claim" onClick={handleClaim}>
            💎 {bonusForStreak(nextStreak).toLocaleString()} ジェム受け取る
          </button>
        ) : (
          <div className="claim-result">
            <p className="claimed-note">
              ✅ 本日分は受取済み(連続 {streak} 日)
              <br />
              次のボーナスは明日 0 時から
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
