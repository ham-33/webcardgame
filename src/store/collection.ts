// カードコレクションとデッキ (zustand + localStorage 永続化)
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STARTER_CARDS } from "../lib/cards";

export const DECK_SIZE = 5;

interface CollectionState {
  owned: Record<string, number>; // cardId -> 所持枚数
  deck: string[]; // デッキ(cardId × DECK_SIZE)
  addCards: (ids: string[]) => void;
  toggleDeck: (id: string) => void;
  ownedCount: () => number;
  uniqueCount: () => number;
}

export const useCollection = create<CollectionState>()(
  persist(
    (set, get) => ({
      // スターターカード5枚を初期配布(そのまま初期デッキになる)
      owned: Object.fromEntries(STARTER_CARDS.map((id) => [id, 1])),
      deck: [...STARTER_CARDS],

      addCards: (ids) =>
        set((st) => {
          const owned = { ...st.owned };
          for (const id of ids) owned[id] = (owned[id] ?? 0) + 1;
          return { owned };
        }),

      toggleDeck: (id) =>
        set((st) => {
          if (st.deck.includes(id)) {
            return { deck: st.deck.filter((d) => d !== id) };
          }
          if (st.deck.length >= DECK_SIZE || !st.owned[id]) return st;
          return { deck: [...st.deck, id] };
        }),

      ownedCount: () =>
        Object.values(get().owned).reduce((s, n) => s + n, 0),
      uniqueCount: () => Object.keys(get().owned).length,
    }),
    { name: "marv-collection" }
  )
);
