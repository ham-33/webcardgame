# MARV CARD GAME — サービス概要 / アーキテクチャ

## コンセプト

**Minecraftをプレイしていない時間も、MARVを楽しもう。**

MARV CARD GAMEは、Minecraftへのログインを必要とせず、ブラウザだけで数分の空き時間から遊べるMARVのオリジナルカードゲームコンテンツです。

- **アカウント登録不要** — URLを開くだけで即プレイ
- **独立通貨「ジェム」** — Minecraft内経済とは完全に分離。プレイ時間の長さで有利不利が生まれない
- **収集と戦略** — カードを集め、デッキを組み、対戦する

## システム構成

```
ブラウザ (SPA / 静的サイト)
├── UI層        React 18 + TypeScript
├── ゲーム層     boardgame.io (OSS / MIT)
│                └── 各ゲームは純粋なステートマシンとして定義
├── 経済層       zustand + persist
│                ├── marv-wallet     (ジェム・ボーナス・戦績)
│                └── marv-collection (カード所持・デッキ)
└── 永続化       localStorage(サーバー送信なし)
```

### 設計上のポイント

1. **ゲームロジックとUIの完全分離**
   `src/games/*.ts` は boardgame.io の `Game` 定義であり、React に依存しない純粋なステートマシンです。ムーブ(`moves`)以外で状態は変化せず、不正な操作は `INVALID_MOVE` で拒否されます。

2. **経済(ジェム)とゲームの分離**
   ゲーム定義はジェム残高を直接触りません。ベット時にUI層が `wallet.spend()` で残高を減らし、結果フェーズ(`phase === "result"`)に入ったときに `roundId` をキーとして**1ラウンド1回だけ** `wallet.earn(payout)` で払い戻します。これにより二重払いを防止しています。

3. **乱数の一元管理**
   シャッフルや抽選は boardgame.io の `random` API(シード付き)を使用します。パック開封のみUI層(`Math.random`)で行います。

4. **サーバーレス**
   全データはブラウザの localStorage に保存され、サーバーには何も送信されません。静的ホスティング(GitHub Pages / Vercel / Netlify 等)にそのままデプロイできます。

### 将来の拡張

- `boardgame.io/server` + SocketIO トランスポートを追加するだけで、既存のゲーム定義のまま**対人マルチプレイヤー**に拡張可能
- MARVアカウント連携やサーバー側ウォレットを導入する場合は、`src/store/wallet.ts` のインターフェースを維持したままバックエンドAPI呼び出しに差し替え可能

## 画面構成

| ルート | 画面 |
|---|---|
| `#/` | トップ(ランディング + ゲームロビー) |
| `#/battle` `#/blackjack` `#/highlow` `#/poker` `#/memory` | 各ゲーム |
| `#/collection` | カードコレクション / パック開封 / デッキ編成 |
| `#/terms` | 利用規約 |
| `#/privacy` | プライバシーポリシー |

## ディレクトリ構成

```
src/
├── games/          # boardgame.io ゲーム定義(純粋ロジック)
│   ├── blackjack.ts / highlow.ts / poker.ts / memory.ts / battle.ts
├── store/
│   ├── wallet.ts       # ジェム・デイリーボーナス・戦績
│   └── collection.ts   # カード所持・デッキ
├── lib/
│   ├── deck.ts         # トランプユーティリティ
│   └── cards.ts        # MARVオリジナルカードカタログ・パック抽選・相性計算
├── components/     # React UI(各ゲームボード、コレクション、モーダル等)
└── App.tsx         # ハッシュルーティング / ランディング
docs/               # 本ドキュメント
```
