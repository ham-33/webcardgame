import { useEffect, useRef } from "react";
import type { BoardProps } from "boardgame.io/react";
import type { BattleState } from "../games/battle";
import { CARD_BY_ID } from "../lib/cards";
import { useWallet } from "../store/wallet";
import { useCollection, DECK_SIZE } from "../store/collection";
import { BetPanel } from "./BetPanel";
import { MarvCardView } from "./MarvCardView";

type Props = BoardProps<BattleState>;

export function BattleBoard({ G, moves }: Props) {
  const { spend, earn, recordGame } = useWallet();
  const deck = useCollection((s) => s.deck);
  const creditedRound = useRef(0);

  useEffect(() => {
    if (G.phase === "result" && G.roundId > creditedRound.current) {
      creditedRound.current = G.roundId;
      if (G.payout > 0) earn(G.payout);
      recordGame(G.payout - G.bet);
    }
  }, [G.phase, G.roundId, G.payout, G.bet, earn, recordGame]);

  const handleStart = (bet: number) => {
    if (deck.length !== DECK_SIZE) return;
    if (spend(bet)) moves.start(bet, deck);
  };

  const last = G.rounds[G.rounds.length - 1];

  return (
    <div className="table battle-table">
      {G.phase === "betting" ? (
        <div className="table-center">
          <h2 className="table-title">
            <span className="suit-deco">⚔️</span> MARV BATTLE
          </h2>
          <p className="table-rule">
            集めたカード5枚のデッキでCPUと5番勝負 / 属性相性で×1.3 / 3勝で勝利(2倍)
          </p>
          <div className="battle-deck-preview">
            {deck.map((id) => (
              <MarvCardView key={id} card={CARD_BY_ID[id]} compact />
            ))}
          </div>
          {deck.length !== DECK_SIZE ? (
            <p className="broke-note">
              デッキが{DECK_SIZE}枚未満です。コレクション画面で編成してください
            </p>
          ) : (
            <BetPanel onDeal={handleStart} dealLabel="⚔️ バトル開始" />
          )}
        </div>
      ) : (
        <>
          <div className="battle-score">
            <span className="bscore you">
              YOU <b>{G.playerWins}</b>
            </span>
            <span className="bscore-round">
              ROUND {G.rounds.length + (G.phase === "playing" ? 1 : 0)}/5
            </span>
            <span className="bscore cpu">
              <b>{G.cpuWins}</b> CPU
            </span>
          </div>

          <div className="battle-stage">
            {last ? (
              <div className="battle-round" key={G.rounds.length}>
                <div className={`battle-slot ${last.winner === "player" ? "won" : ""}`}>
                  <MarvCardView card={CARD_BY_ID[last.playerCard]} compact />
                  <span className="bpower">
                    {last.playerPower}
                    {last.playerAdv && <em className="adv">相性×1.3!</em>}
                  </span>
                </div>
                <span className={`battle-vs ${last.winner}`}>
                  {last.winner === "player"
                    ? "WIN"
                    : last.winner === "cpu"
                      ? "LOSE"
                      : "DRAW"}
                </span>
                <div className={`battle-slot ${last.winner === "cpu" ? "won" : ""}`}>
                  <MarvCardView card={CARD_BY_ID[last.cpuCard]} compact />
                  <span className="bpower">
                    {last.cpuPower}
                    {last.cpuAdv && <em className="adv">相性×1.3!</em>}
                  </span>
                </div>
              </div>
            ) : (
              <p className="poker-hint">出すカードを選ぼう。相手の残りカードの属性を読め！</p>
            )}
            <div className="battle-cpu-remain">
              CPU残り:{" "}
              {G.cpuHand.map((_, i) => (
                <span key={i} className="cpu-back">
                  🂠
                </span>
              ))}
            </div>
          </div>

          {G.phase === "playing" ? (
            <div className="battle-hand">
              {G.playerHand.map((id) => (
                <MarvCardView
                  key={id}
                  card={CARD_BY_ID[id]}
                  compact
                  onClick={() => moves.playCard(id)}
                />
              ))}
            </div>
          ) : (
            <div className="table-mid">
              <div
                className={`outcome-banner ${
                  G.outcome === "win" ? "win" : G.outcome === "draw" ? "push" : "lose"
                }`}
              >
                <span className="outcome-text">
                  {G.outcome === "win"
                    ? "VICTORY!"
                    : G.outcome === "draw"
                      ? "DRAW — 引き分け"
                      : "DEFEAT…"}
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
                もう一度バトル
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
