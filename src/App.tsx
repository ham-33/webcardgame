import { useEffect, useMemo, useState } from "react";
import { Client } from "boardgame.io/react";
import { Blackjack } from "./games/blackjack";
import { HighLow } from "./games/highlow";
import { BlackjackBoard } from "./components/BlackjackBoard";
import { HighLowBoard } from "./components/HighLowBoard";
import { DailyBonusModal } from "./components/DailyBonus";
import { CoinBadge } from "./components/CoinBadge";
import { useWallet } from "./store/wallet";

type Screen = "home" | "blackjack" | "highlow";

const GAMES: {
  id: Screen;
  title: string;
  desc: string;
  emoji: string;
  tag: string;
  cls: string;
}[] = [
  {
    id: "blackjack",
    title: "BLACKJACK",
    desc: "21を目指す王道カードゲーム。ダブルダウンで一発逆転、BJは2.5倍払い戻し。",
    emoji: "🃏",
    tag: "CLASSIC",
    cls: "g-bj",
  },
  {
    id: "highlow",
    title: "HIGH & LOW",
    desc: "次のカードは高い？低い？連勝するほど倍率が跳ね上がる。降りるタイミングが勝負。",
    emoji: "🔥",
    tag: "STREAK",
    cls: "g-hl",
  },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [showDaily, setShowDaily] = useState(false);
  const canClaim = useWallet((s) => s.canClaimToday());
  const { totalGames, bestWin, streak } = useWallet();

  // 初回ロード時、当日分が未受取なら自動でボーナスモーダルを開く
  useEffect(() => {
    if (canClaim) setShowDaily(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const BlackjackClient = useMemo(
    () =>
      Client({
        game: Blackjack,
        board: BlackjackBoard,
        numPlayers: 1,
        debug: false,
      }),
    []
  );
  const HighLowClient = useMemo(
    () =>
      Client({
        game: HighLow,
        board: HighLowBoard,
        numPlayers: 1,
        debug: false,
      }),
    []
  );

  return (
    <div className="app">
      <header className="topbar">
        <button
          className="brand"
          onClick={() => setScreen("home")}
          aria-label="ホームへ"
        >
          <span className="brand-mark">♠</span>
          <span className="brand-name">
            NEON<b>DECK</b>
          </span>
        </button>
        <div className="topbar-right">
          <button
            className={`daily-btn ${canClaim ? "pulse" : ""}`}
            onClick={() => setShowDaily(true)}
          >
            🎁{canClaim && <span className="daily-dot" />}
          </button>
          <CoinBadge />
        </div>
      </header>

      <main className="main">
        {screen === "home" && (
          <div className="home">
            <section className="hero">
              <h1>
                今日のツキを、
                <br className="sp-only" />
                試しにいこう。
              </h1>
              <p>
                毎日ログインでコインGET。コインを賭けて、増やして、駆け上がれ。
              </p>
              {canClaim && (
                <button
                  className="btn btn-gold hero-claim"
                  onClick={() => setShowDaily(true)}
                >
                  🎁 今日のボーナスを受け取る
                </button>
              )}
            </section>

            <section className="game-grid">
              {GAMES.map((g) => (
                <button
                  key={g.id}
                  className={`game-card ${g.cls}`}
                  onClick={() => setScreen(g.id)}
                >
                  <span className="game-tag">{g.tag}</span>
                  <span className="game-emoji">{g.emoji}</span>
                  <span className="game-title">{g.title}</span>
                  <span className="game-desc">{g.desc}</span>
                  <span className="game-play">PLAY ▶</span>
                </button>
              ))}
            </section>

            <section className="stats-row">
              <div className="stat">
                <span className="stat-num">{totalGames}</span>
                <span className="stat-label">プレイ回数</span>
              </div>
              <div className="stat">
                <span className="stat-num">
                  {bestWin > 0 ? `+${bestWin.toLocaleString()}` : "—"}
                </span>
                <span className="stat-label">最高勝利額</span>
              </div>
              <div className="stat">
                <span className="stat-num">{streak}日</span>
                <span className="stat-label">連続ログイン</span>
              </div>
            </section>
          </div>
        )}

        {screen === "blackjack" && (
          <div className="game-screen">
            <button className="back-btn" onClick={() => setScreen("home")}>
              ← ロビーへ
            </button>
            <BlackjackClient />
          </div>
        )}

        {screen === "highlow" && (
          <div className="game-screen">
            <button className="back-btn" onClick={() => setScreen("home")}>
              ← ロビーへ
            </button>
            <HighLowClient />
          </div>
        )}
      </main>

      {showDaily && <DailyBonusModal onClose={() => setShowDaily(false)} />}

      <footer className="footer">
        <span>
          Powered by{" "}
          <a href="https://boardgame.io" target="_blank" rel="noreferrer">
            boardgame.io
          </a>{" "}
          (OSS) — コインはゲーム内通貨で換金性はありません
        </span>
      </footer>
    </div>
  );
}
