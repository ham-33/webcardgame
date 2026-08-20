import {
  ELEMENT_INFO,
  RARITY_INFO,
  type MarvCard,
} from "../lib/cards";

// MARV オリジナルカードの表示
export function MarvCardView({
  card,
  count,
  selected = false,
  dimmed = false,
  onClick,
  compact = false,
}: {
  card: MarvCard;
  count?: number;
  selected?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
  compact?: boolean;
}) {
  const el = ELEMENT_INFO[card.element];
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      className={`mcard rarity-${card.rarity} ${selected ? "selected" : ""} ${dimmed ? "dimmed" : ""} ${compact ? "compact" : ""}`}
      onClick={onClick}
      style={{ ["--el-color" as string]: el.color }}
    >
      <span className="mcard-head">
        <span className="mcard-el" title={el.label}>
          {el.emoji}
        </span>
        <span
          className="mcard-rarity"
          style={{ color: RARITY_INFO[card.rarity].color }}
        >
          {card.rarity}
        </span>
      </span>
      <span className="mcard-art">{card.emoji}</span>
      <span className="mcard-name">{card.name}</span>
      <span className="mcard-power">⚔ {card.power}</span>
      {!compact && <span className="mcard-flavor">{card.flavor}</span>}
      {count !== undefined && count > 1 && (
        <span className="mcard-count">×{count}</span>
      )}
      {selected && <span className="mcard-check">✓</span>}
    </Tag>
  );
}
