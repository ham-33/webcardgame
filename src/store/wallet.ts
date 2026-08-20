// コイン残高・デイリーボーナス・ストリーク管理 (zustand + localStorage 永続化)
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const DAILY_BASE = 500;
export const DAILY_STREAK_STEP = 150;
export const DAILY_STREAK_CAP = 7; // 7日目以降は最大額で固定
export const STARTING_COINS = 2000;

export function bonusForStreak(streak: number): number {
  const s = Math.min(Math.max(streak, 1), DAILY_STREAK_CAP);
  return DAILY_BASE + (s - 1) * DAILY_STREAK_STEP;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface WalletState {
  coins: number;
  lastClaimDate: string | null;
  streak: number;
  totalEarned: number;
  totalGames: number;
  bestWin: number;
  canClaimToday: () => boolean;
  claimDaily: () => number; // 受け取った額を返す(受け取れない場合 0)
  spend: (amount: number) => boolean;
  earn: (amount: number) => void;
  recordGame: (netWin: number) => void;
}

export const useWallet = create<WalletState>()(
  persist(
    (set, get) => ({
      coins: STARTING_COINS,
      lastClaimDate: null,
      streak: 0,
      totalEarned: 0,
      totalGames: 0,
      bestWin: 0,

      canClaimToday: () => get().lastClaimDate !== todayKey(),

      claimDaily: () => {
        const st = get();
        if (!st.canClaimToday()) return 0;
        const continued = st.lastClaimDate === yesterdayKey();
        const newStreak = continued ? st.streak + 1 : 1;
        const amount = bonusForStreak(newStreak);
        set({
          coins: st.coins + amount,
          lastClaimDate: todayKey(),
          streak: newStreak,
          totalEarned: st.totalEarned + amount,
        });
        return amount;
      },

      spend: (amount) => {
        const st = get();
        if (amount <= 0 || st.coins < amount) return false;
        set({ coins: st.coins - amount });
        return true;
      },

      earn: (amount) => {
        if (amount <= 0) return;
        set((st) => ({
          coins: st.coins + amount,
          totalEarned: st.totalEarned + amount,
        }));
      },

      recordGame: (netWin) => {
        set((st) => ({
          totalGames: st.totalGames + 1,
          bestWin: Math.max(st.bestWin, netWin),
        }));
      },
    }),
    { name: "neondeck-wallet" }
  )
);
