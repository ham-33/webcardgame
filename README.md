# ◆ MARV CARD GAME

**Minecraftをプレイしていない時間も、MARVを楽しもう。**

MARV CARD GAMEは、Minecraftへのログインを必要とせず、ブラウザだけで数分の空き時間から遊べるMARVのオリジナルカードゲームコンテンツです。カードを集めてデッキを作り、独立通貨「ジェム 💎」を獲得。モバイル・PC両対応。

![stack](https://img.shields.io/badge/stack-React%20%2B%20TypeScript%20%2B%20Vite-blue)
![engine](https://img.shields.io/badge/engine-boardgame.io-green)

## 🎮 収録ゲーム(5種)

| ゲーム | 内容 |
|---|---|
| ⚔️ **MARV BATTLE** | 集めたカード5枚のデッキでCPUと対戦。属性相性×1.3の読み合い(オリジナル) |
| 🃏 **ブラックジャック** | ヒット / スタンド / ダブルダウン、BJは2.5倍払い戻し |
| 🔥 **ハイ&ロー** | 連勝で倍率が最大×36。降り時が勝負のキャッシュアウト制 |
| 🎴 **ビデオポーカー** | ジャックス・オア・ベター。ロイヤルフラッシュ×250 |
| 🧠 **メモリーマッチ** | 6ペアの神経衰弱。ミスが少ないほど高配当(最大×3) |

## 📚 カードコレクション

- MARVオリジナルカード全**30種**(N/R/SR/UR、5属性)
- ジェムでパック開封(300ジェム/3枚)→ デッキ編成 → バトルへ
- 詳細: [docs/collection.md](docs/collection.md)

## 💎 独立通貨「ジェム」

- 初回2,000ジェム + **デイリーボーナス**(500 → 連続ログインで最大1,400/日)
- Minecraft内経済とは完全に分離。換金性なし
- 詳細: [docs/economy.md](docs/economy.md)

## 📄 ドキュメント

| ドキュメント | 内容 |
|---|---|
| [docs/overview.md](docs/overview.md) | サービス概要・アーキテクチャ・どのように動くか |
| [docs/games.md](docs/games.md) | 全ゲームのルール・配当仕様 |
| [docs/economy.md](docs/economy.md) | ジェム経済・デイリーボーナス・パック提供割合 |
| [docs/collection.md](docs/collection.md) | カードリスト・属性相性・カード追加手順 |
| アプリ内 `#/terms` | 利用規約 |
| アプリ内 `#/privacy` | プライバシーポリシー |

## 🚀 起動方法

```bash
npm install
npm run dev      # 開発サーバー (http://localhost:5173)
npm run build    # 本番ビルド → dist/
```

静的サイトなので GitHub Pages / Vercel / Netlify / Cloudflare Pages にそのままデプロイできます。アカウント・サーバー・DBは不要で、全データはブラウザの localStorage に保存されます。

## 🧩 使用しているOSSキット

中核は **[boardgame.io](https://boardgame.io)**(MIT License)です。ゲームの状態管理(`G`)、ムーブ(`moves`)、不正ムーブ検出(`INVALID_MOVE`)、シード付き乱数(`random.Shuffle`)を提供し、`boardgame.io/server` を足すだけで対人マルチプレイヤーに拡張できます。

### その他の有名なWebカードゲーム系OSS(参考)

| プロジェクト | 特徴 | ライセンス |
|---|---|---|
| [boardgame.io](https://github.com/boardgameio/boardgame.io) | 本作で採用。ターン制ゲームの状態管理フレームワーク | MIT |
| [deck-of-cards](https://github.com/pakastin/deck-of-cards) | 美しいトランプ演出に特化したライブラリ | MIT |
| [cards.js](https://github.com/einaregilsson/cards.js) | シンプルなカードゲームUIライブラリ | MIT |
| [boardzilla](https://github.com/boardzilla/boardzilla-core) | ボードゲーム全般のエンジン | AGPL |
| [rune](https://github.com/rune/rune) | モバイルWebマルチプレイヤーゲームSDK | Apache-2.0 |

## ⚖️ 免責

本サービスは MARV が独自に提供するものであり、Mojang Studios / Microsoft とは関係ありません。「Minecraft」は Mojang Studios / Microsoft の商標です。ジェムおよびカードはゲーム内データであり、金銭的価値・換金性はありません。
