import { useEffect, useMemo, useState } from "react";
import { Client } from "boardgame.io/react";
import { Blackjack } from "./games/blackjack";
import { HighLow } from "./games/highlow";
import { VideoPoker } from "./games/poker";
import { MemoryMatch } from "./games/memory";
import { MarvBattle } from "./games/battle";
import { BlackjackBoard } from "./components/BlackjackBoard";
import { HighLowBoard } from "./components/HighLowBoard";
import { PokerBoard } from "./components/PokerBoard";
import { MemoryBoard } from "./components/MemoryBoard";
import { BattleBoard } from "./components/BattleBoard";
import { CollectionScreen } from "./components/CollectionScreen";
import { DailyBonusModal } from "./components/DailyBonus";
import { GemBadge } from "./components/CoinBadge";
import { TermsPage, PrivacyPage } from "./components/LegalPages";
import { useWallet } from "./store/wallet";

type Route =
  | "home"
  | "blackjack"
  | "highlow"
  | "poker"
  | "memory"
  | "battle"
  | "collection"
  | "terms"
  | "privacy";

const ROUTES: Route[] = [
  "home",
  "blackjack",
  "highlow",
  "poker",
  "memory",
  "battle",
  "collection",
  "terms",
  "privacy",
];

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, "");
  return (ROUTES as string[]).includes(h) ? (h as Route) : "home";
}

const GAMES: {
  id: Route;
  title: string;
  desc: string;
  emoji: string;
  tag: string;
  cls: string;
}[] = [
  {
    id: "battle",
    title: "MARV BATTLE",
    desc: "集めたカード5枚のデッキでCPUと対戦。属性相性を読み合う、MARVオリジナルのカードバトル。",
    emoji: "⚔️",
    tag: "ORIGINAL",
    cls: "g-battle",
  },
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
  {
    id: "poker",
    title: "VIDEO POKER",
    desc: "5枚から残すカードを選んで一発勝負。ロイヤルフラッシュは250倍の大当たり。",
    emoji: "🎴",
    tag: "JACKPOT",
    cls: "g-poker",
  },
  {
    id: "memory",
    title: "MEMORY MATCH",
    desc: "6ペアの神経衰弱。ミスが少ないほど高配当。記憶力でジェムを稼げ。",
    emoji: "🧠",
    tag: "BRAIN",
    cls: "g-mem",
  },
];

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  const [showDaily, setShowDaily] = useState(false);
  const canClaim = useWallet((s) => s.canClaimToday());
  const { totalGames, bestWin, streak } = useWallet();

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (r: Route) => {
    window.location.hash = r === "home" ? "/" : `/${r}`;
  };

  // 初回ロード時、当日分が未受取なら自動でボーナスモーダルを開く
  useEffect(() => {
    if (canClaim) setShowDaily(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clients = useMemo(
    () => ({
      blackjack: Client({ game: Blackjack, board: BlackjackBoard, numPlayers: 1, debug: false }),
      highlow: Client({ game: HighLow, board: HighLowBoard, numPlayers: 1, debug: false }),
      poker: Client({ game: VideoPoker, board: PokerBoard, numPlayers: 1, debug: false }),
      memory: Client({ game: MemoryMatch, board: MemoryBoard, numPlayers: 1, debug: false }),
      battle: Client({ game: MarvBattle, board: BattleBoard, numPlayers: 1, debug: false }),
    }),
    []
  );

  const GameClient =
    route in clients ? clients[route as keyof typeof clients] : null;

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => go("home")} aria-label="ホームへ">
          <span className="brand-mark">◆</span>
          <span className="brand-name">
            MARV <b>CARD GAME</b>
          </span>
        </button>
        <div className="topbar-right">
          <button className="nav-link" onClick={() => go("collection")}>
            📚<span className="nav-label">コレクション</span>
          </button>
          <button
            className={`daily-btn ${canClaim ? "pulse" : ""}`}
            onClick={() => setShowDaily(true)}
          >
            🎁{canClaim && <span className="daily-dot" />}
          </button>
          <GemBadge />
        </div>
      </header>

      <main className="main">
        {route === "home" && (
          <div className="home">
            <section className="hero">
              <p className="hero-eyebrow">MARV CARD GAME</p>
              <h1>
                Minecraftをプレイしていない
                <br className="pc-only" />
                時間も、MARVを楽しもう。
              </h1>
              <p className="hero-lead">
                MARV CARD GAMEは、短い時間でも気軽に遊べる、MARVのオリジナルカードゲームコンテンツ。
                <br className="pc-only" />
                カードを集めて、デッキを作って、対戦して。Minecraftを開かなくても、MARVの楽しさは続いていく。
              </p>
              {canClaim && (
                <button className="btn btn-gold hero-claim" onClick={() => setShowDaily(true)}>
                  🎁 今日のボーナスを受け取る
                </button>
              )}
            </section>

            <section className="game-grid">
              {GAMES.map((g) => (
                <button key={g.id} className={`game-card ${g.cls}`} onClick={() => go(g.id)}>
                  <span className="game-tag">{g.tag}</span>
                  <span className="game-emoji">{g.emoji}</span>
                  <span className="game-title">{g.title}</span>
                  <span className="game-desc">{g.desc}</span>
                  <span className="game-play">PLAY ▶</span>
                </button>
              ))}
              <button className="game-card g-collection" onClick={() => go("collection")}>
                <span className="game-tag">COLLECTION</span>
                <span className="game-emoji">📚</span>
                <span className="game-title">カードを集める</span>
                <span className="game-desc">
                  ジェムでパックを開封して全30種のMARVオリジナルカードをコレクション。デッキを組んでバトルへ。
                </span>
                <span className="game-play">OPEN ▶</span>
              </button>
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

            <section className="features">
              <div className="feature">
                <span className="feature-icon">⏱️</span>
                <h3>Minecraftを開かなくても遊べる</h3>
                <p>
                  「今日はMinecraftをするほどの時間はない。」そんなときでも大丈夫。MARV CARD
                  GAMEはMinecraftへのログインを必要とせず、移動中や休憩時間など、数分の空き時間から楽しめるように設計されています。
                </p>
              </div>
              <div className="feature">
                <span className="feature-icon">🃏</span>
                <h3>カードを集めて、自分だけのデッキを作ろう</h3>
                <p>
                  さまざまな特徴を持ったカードを集め、自分だけのデッキを構築。レアカードのコレクションはもちろん、属性の組み合わせを考えたり、自分なりの戦略を作ったり。「集める楽しさ」と「考える楽しさ」をMARVで体験できます。
                </p>
              </div>
              <div className="feature">
                <span className="feature-icon">💎</span>
                <h3>独立した通貨「ジェム」</h3>
                <p>
                  ジェムはMinecraftのゲーム内通貨とは別の、独立した通貨。Minecraft内の経済とは切り離されているため、Minecraftをたくさんプレイしている人だけが有利になる仕組みではありません。カードゲームを遊んでジェムを集めよう。
                </p>
              </div>
              <div className="feature">
                <span className="feature-icon">🌍</span>
                <h3>Minecraftだけじゃない、MARVへ。</h3>
                <p>
                  MARVは、Minecraftサーバーだけで完結するサービスを目指していません。じっくり遊びたい日も、数分だけ楽しみたい日も。それぞれの生活やプレイスタイルに合わせて、好きな方法でMARVに参加できます。
                </p>
              </div>
            </section>
          </div>
        )}

        {GameClient && (
          <div className="game-screen">
            <button className="back-btn" onClick={() => go("home")}>
              ← ロビーへ
            </button>
            <GameClient />
          </div>
        )}

        {route === "collection" && (
          <div className="game-screen">
            <button className="back-btn" onClick={() => go("home")}>
              ← ロビーへ
            </button>
            <CollectionScreen />
          </div>
        )}

        {route === "terms" && (
          <div className="game-screen">
            <button className="back-btn" onClick={() => go("home")}>
              ← トップへ
            </button>
            <TermsPage />
          </div>
        )}

        {route === "privacy" && (
          <div className="game-screen">
            <button className="back-btn" onClick={() => go("home")}>
              ← トップへ
            </button>
            <PrivacyPage />
          </div>
        )}
      </main>

      {showDaily && <DailyBonusModal onClose={() => setShowDaily(false)} />}

      <footer className="footer">
        <nav className="footer-nav">
          <a href="#/terms">利用規約</a>
          <a href="#/privacy">プライバシーポリシー</a>
        </nav>
        <span>
          ジェムはゲーム内通貨で換金性はありません / Powered by{" "}
          <a href="https://boardgame.io" target="_blank" rel="noreferrer">
            boardgame.io
          </a>{" "}
          (OSS)
          <br />
          本サービスは Mojang Studios / Microsoft とは関係ありません。「Minecraft」は
          Mojang Studios / Microsoft の商標です。
        </span>
      </footer>
    </div>
  );
}
