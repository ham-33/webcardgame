import { useState } from "react";
import {
  CATALOG,
  PACK_PRICE,
  PACK_SIZE,
  RARITY_INFO,
  openPack,
  type MarvCard,
} from "../lib/cards";
import { useWallet } from "../store/wallet";
import { useCollection, DECK_SIZE } from "../store/collection";
import { MarvCardView } from "./MarvCardView";

export function CollectionScreen() {
  const gems = useWallet((s) => s.gems);
  const spend = useWallet((s) => s.spend);
  const { owned, deck, addCards, toggleDeck, uniqueCount } = useCollection();
  const [opened, setOpened] = useState<MarvCard[] | null>(null);
  const [tab, setTab] = useState<"collection" | "deck">("collection");

  const buyPack = () => {
    if (!spend(PACK_PRICE)) return;
    const cards = openPack(Math.random);
    addCards(cards.map((c) => c.id));
    setOpened(cards);
  };

  return (
    <div className="collection">
      <div className="collection-head">
        <div>
          <h2 className="collection-title">📚 コレクション</h2>
          <p className="collection-sub">
            {uniqueCount()}/{CATALOG.length} 種コンプリート
          </p>
        </div>
        <button
          className="btn btn-gold pack-btn"
          disabled={gems < PACK_PRICE}
          onClick={buyPack}
        >
          🎴 パックを引く
          <small>
            💎{PACK_PRICE} / {PACK_SIZE}枚
          </small>
        </button>
      </div>

      <div className="tab-row">
        <button
          className={`tab ${tab === "collection" ? "active" : ""}`}
          onClick={() => setTab("collection")}
        >
          カード一覧
        </button>
        <button
          className={`tab ${tab === "deck" ? "active" : ""}`}
          onClick={() => setTab("deck")}
        >
          デッキ編成 ({deck.length}/{DECK_SIZE})
        </button>
      </div>

      {tab === "deck" && (
        <p className="deck-help">
          所持カードをタップしてデッキに追加 / もう一度タップで外す。
          デッキは「MARVバトル」で使用します。属性バランスが勝負のカギ！
        </p>
      )}

      <div className="collection-grid">
        {CATALOG.map((card) => {
          const count = owned[card.id] ?? 0;
          const has = count > 0;
          const inDeck = deck.includes(card.id);
          if (tab === "deck") {
            if (!has) return null;
            return (
              <MarvCardView
                key={card.id}
                card={card}
                count={count}
                selected={inDeck}
                onClick={() => toggleDeck(card.id)}
              />
            );
          }
          return has ? (
            <MarvCardView key={card.id} card={card} count={count} />
          ) : (
            <div key={card.id} className="mcard mcard-unknown">
              <span className="mcard-art">❔</span>
              <span className="mcard-name">???</span>
              <span
                className="mcard-rarity"
                style={{ color: RARITY_INFO[card.rarity].color }}
              >
                {card.rarity}
              </span>
            </div>
          );
        })}
      </div>

      {opened && (
        <div className="modal-overlay" onClick={() => setOpened(null)}>
          <div className="modal pack-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="pack-title">✨ パック開封！</h2>
            <div className="pack-cards">
              {opened.map((c, i) => (
                <div
                  key={`${c.id}-${i}`}
                  className="pack-reveal"
                  style={{ animationDelay: `${i * 350}ms` }}
                >
                  <MarvCardView card={c} />
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => setOpened(null)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
