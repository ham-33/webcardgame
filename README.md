# ♠ NEON DECK — Webカードゲームアーケード

**boardgame.io**(OSSカードゲーム/ボードゲームフレームワーク)を使った、コイン経済つきのWebカードゲームキットです。モバイル・PC両対応のダークネオンUI。

![stack](https://img.shields.io/badge/stack-React%20%2B%20TypeScript%20%2B%20Vite-blue)
![engine](https://img.shields.io/badge/engine-boardgame.io-green)

## 🎮 収録ゲーム

| ゲーム | 内容 |
|---|---|
| 🃏 **ブラックジャック** | 王道21。ヒット / スタンド / ダブルダウン、BJは2.5倍払い戻し |
| 🔥 **ハイ&ロー** | 次のカードの高低を予想。連勝で倍率が最大 ×36 まで上昇、降り時が勝負のキャッシュアウト制 |

## 🪙 コイン経済(デイリーボーナス)

- 初回 **2,000コイン** 付与
- **毎日ログインでボーナス**: 1日目 500 → 連続ログインで毎日 +150、7日目以降は最大 **1,400コイン/日**
- 連続ログインが途切れるとストリークは1日目にリセット
- 残高・ストリーク・戦績は `localStorage` に永続化(サーバー不要)
- コインはゲーム内通貨であり換金性はありません

## 🚀 起動方法

```bash
npm install
npm run dev      # 開発サーバー (http://localhost:5173)
npm run build    # 本番ビルド → dist/
```

静的サイトなので GitHub Pages / Vercel / Netlify / Cloudflare Pages にそのままデプロイできます。

## 🧩 使用しているOSSキット

本プロジェクトの中核は **[boardgame.io](https://boardgame.io)**(MIT License)です。

- ゲームの状態管理(`G`)、ムーブ(`moves`)、不正ムーブ検出(`INVALID_MOVE`)、シード付き乱数(`random.Shuffle`)をフレームワークとして提供
- 今回はローカルクライアントで動かしていますが、`boardgame.io/server` を足すだけで**マルチプレイヤー(WebSocket)対応**に拡張可能

### その他の有名なWebカードゲーム系OSS(参考)

| プロジェクト | 特徴 | ライセンス |
|---|---|---|
| [boardgame.io](https://github.com/boardgameio/boardgame.io) | 本作で採用。ターン制ゲームの状態管理フレームワーク | MIT |
| [deck-of-cards](https://github.com/pakastin/deck-of-cards) | 美しいトランプ演出に特化したライブラリ | MIT |
| [cards.js](https://github.com/einaregilsson/cards.js) | シンプルなカードゲームUIライブラリ | MIT |
| [Tabletop Simulator系: playingcards.io 代替の boardzilla](https://github.com/boardzilla/boardzilla-core) | ボードゲーム全般のエンジン | AGPL |
| [rune](https://github.com/rune/rune) | モバイルWebマルチプレイヤーゲームSDK | Apache-2.0 |

## 🏗️ アーキテクチャ

```
src/
├── games/            # boardgame.io のゲーム定義(純粋ロジック)
│   ├── blackjack.ts  #   ブラックジャックのステートマシン
│   └── highlow.ts    #   ハイ&ロー(連勝倍率)のステートマシン
├── store/
│   └── wallet.ts     # コイン残高・デイリーボーナス(zustand + persist)
├── components/       # UI(React)
│   ├── BlackjackBoard.tsx
│   ├── HighLowBoard.tsx
│   ├── DailyBonus.tsx
│   ├── BetPanel.tsx / CardView.tsx / CoinBadge.tsx
├── lib/deck.ts       # デッキ生成・役計算ユーティリティ
└── App.tsx           # ロビー / 画面遷移
```

ゲームロジック(`games/`)とコイン経済(`store/`)を完全分離しているため、新しいゲーム(ポーカー、バカラ、大富豪など)は「ゲーム定義 + Boardコンポーネント」を追加するだけで増やせます。

## 🔮 拡張アイデア

- `boardgame.io/server` + `SocketIO` トランスポートで対人マルチプレイ
- サーバー側ウォレット(現状はクライアント保存のためカジュアル用途向け)
- 実績 / リーダーボード / ガチャ演出
