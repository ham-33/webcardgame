// MARV CARD GAME — オリジナルカードカタログ / パック / バトル計算
export type Element = "flame" | "leaf" | "aqua" | "light" | "dark";
export type Rarity = "N" | "R" | "SR" | "UR";

export interface MarvCard {
  id: string;
  name: string;
  element: Element;
  rarity: Rarity;
  power: number;
  emoji: string;
  flavor: string;
}

export const ELEMENT_INFO: Record<
  Element,
  { label: string; emoji: string; color: string }
> = {
  flame: { label: "炎", emoji: "🔥", color: "#f87171" },
  leaf: { label: "森", emoji: "🌿", color: "#4ade80" },
  aqua: { label: "水", emoji: "💧", color: "#60a5fa" },
  light: { label: "光", emoji: "☀️", color: "#fbbf24" },
  dark: { label: "闇", emoji: "🌙", color: "#a78bfa" },
};

// 属性相性: 炎>森, 森>水, 水>炎, 光⇔闇は互いに有利
export function hasAdvantage(a: Element, b: Element): boolean {
  return (
    (a === "flame" && b === "leaf") ||
    (a === "leaf" && b === "aqua") ||
    (a === "aqua" && b === "flame") ||
    (a === "light" && b === "dark") ||
    (a === "dark" && b === "light")
  );
}

export const ADVANTAGE_BONUS = 130; // 有利属性は パワー×1.3 (x100整数)

export function effectivePower(card: MarvCard, vs: MarvCard): number {
  const base = card.power * 100;
  return Math.floor(
    hasAdvantage(card.element, vs.element) ? (base * ADVANTAGE_BONUS) / 100 : base
  ) / 100;
}

export const RARITY_INFO: Record<
  Rarity,
  { label: string; color: string; weight: number }
> = {
  N: { label: "ノーマル", color: "#94a3b8", weight: 60 },
  R: { label: "レア", color: "#38bdf8", weight: 25 },
  SR: { label: "スーパーレア", color: "#c084fc", weight: 12 },
  UR: { label: "ウルトラレア", color: "#fbbf24", weight: 3 },
};

export const PACK_PRICE = 300;
export const PACK_SIZE = 3;

const C = (
  id: string,
  name: string,
  element: Element,
  rarity: Rarity,
  power: number,
  emoji: string,
  flavor: string
): MarvCard => ({ id, name, element, rarity, power, emoji, flavor });

export const CATALOG: MarvCard[] = [
  // ノーマル (12)
  C("n01", "たいまつ守り", "flame", "N", 20, "🕯️", "夜道を照らす小さな相棒。"),
  C("n02", "火の粉ネズミ", "flame", "N", 24, "🐭", "尻尾の先がいつも燻っている。"),
  C("n03", "わかば剣士", "leaf", "N", 21, "🌱", "生まれたての剣は少し柔らかい。"),
  C("n04", "きのこ番兵", "leaf", "N", 25, "🍄", "湿った洞窟の入り口を守る。"),
  C("n05", "しずくスライム", "aqua", "N", 22, "💧", "跳ねるたびに水たまりが増える。"),
  C("n06", "小川のカニ", "aqua", "N", 26, "🦀", "ハサミの威力は見た目以上。"),
  C("n07", "ほたる石の精", "light", "N", 23, "✨", "鉱脈の奥でひっそり光る。"),
  C("n08", "あさひのヒヨコ", "light", "N", 27, "🐤", "夜明けとともに鳴き始める。"),
  C("n09", "こうもり斥候", "dark", "N", 22, "🦇", "音のない羽ばたきで闇を渡る。"),
  C("n10", "影のネコ", "dark", "N", 26, "🐈‍⬛", "足音を置き忘れてきたらしい。"),
  C("n11", "石ころゴーレム", "leaf", "N", 28, "🪨", "苔むした体は森の一部。"),
  C("n12", "砂浜のヒトデ", "aqua", "N", 20, "⭐", "満ち潮とともに現れる。"),
  // レア (8)
  C("r01", "溶岩鍛冶ブレイズ", "flame", "R", 38, "🔨", "打つたびに火花が武器になる。"),
  C("r02", "火山トカゲ", "flame", "R", 42, "🦎", "背中の岩盤は常に赤熱している。"),
  C("r03", "大樹の射手", "leaf", "R", 40, "🏹", "枝の上から外さない一矢。"),
  C("r04", "ツタの魔術師", "leaf", "R", 43, "🪄", "地面から答えが生えてくる。"),
  C("r05", "深海のハンター", "aqua", "R", 41, "🔱", "光の届かない場所が狩場。"),
  C("r06", "氷河のペンギン隊長", "aqua", "R", 39, "🐧", "氷上の行進は誰にも止められない。"),
  C("r07", "灯台の番人", "light", "R", 42, "🗼", "その光は嵐の夜こそ強くなる。"),
  C("r08", "宵闇の盗賊", "dark", "R", 44, "🗡️", "盗むのは宝物、残すのは謎だけ。"),
  // スーパーレア (6)
  C("sr01", "紅蓮のドラゴン", "flame", "SR", 60, "🐲", "翼の一振りで地平が燃える。"),
  C("sr02", "世界樹の巫女", "leaf", "SR", 58, "🌳", "根は大地の記憶に届いている。"),
  C("sr03", "海淵のリヴァイア", "aqua", "SR", 62, "🐋", "深海の王、浮上は嵐の予兆。"),
  C("sr04", "暁の聖騎士", "light", "SR", 61, "🛡️", "その剣は夜を割って朝を呼ぶ。"),
  C("sr05", "常夜の魔王", "dark", "SR", 63, "👿", "星さえ彼の前では目を伏せる。"),
  C("sr06", "雷鳴の巨人", "light", "SR", 59, "⚡", "一歩ごとに空が震える。"),
  // ウルトラレア (4)
  C("ur01", "創炎神マグナ", "flame", "UR", 85, "☄️", "世界を鋳直す原初の炎。"),
  C("ur02", "翠海竜エルデン", "leaf", "UR", 84, "🐉", "森と海、ふたつの息吹を宿す。"),
  C("ur03", "極光の女神ルミナ", "light", "UR", 88, "🌈", "彼女が瞬くとき、闇は色を失う。"),
  C("ur04", "終焉竜ヴォイド", "dark", "UR", 90, "🕳️", "すべての物語が眠る場所。"),
];

export const CARD_BY_ID: Record<string, MarvCard> = Object.fromEntries(
  CATALOG.map((c) => [c.id, c])
);

export const STARTER_CARDS = ["n01", "n03", "n05", "n07", "n09"];

// 乱数関数(0..1)を受け取ってレアリティを抽選
export function rollRarity(rand: () => number): Rarity {
  const total = Object.values(RARITY_INFO).reduce((s, r) => s + r.weight, 0);
  let roll = rand() * total;
  for (const [rarity, info] of Object.entries(RARITY_INFO)) {
    roll -= info.weight;
    if (roll < 0) return rarity as Rarity;
  }
  return "N";
}

export function openPack(rand: () => number): MarvCard[] {
  const result: MarvCard[] = [];
  for (let i = 0; i < PACK_SIZE; i++) {
    const rarity = rollRarity(rand);
    const pool = CATALOG.filter((c) => c.rarity === rarity);
    result.push(pool[Math.floor(rand() * pool.length)]);
  }
  return result;
}
