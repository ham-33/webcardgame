import { isRed, type PlayingCard } from "../lib/deck";

export function CardView({
  card,
  faceDown = false,
  delay = 0,
  size = "md",
}: {
  card?: PlayingCard | null;
  faceDown?: boolean;
  delay?: number;
  size?: "md" | "lg";
}) {
  const red = card ? isRed(card) : false;
  return (
    <div
      className={`pcard ${size === "lg" ? "pcard-lg" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`pcard-inner ${faceDown ? "is-down" : ""}`}>
        <div className={`pcard-face pcard-front ${red ? "red" : "black"}`}>
          {card && (
            <>
              <span className="pcard-corner tl">
                <b>{card.rank}</b>
                <i>{card.suit}</i>
              </span>
              <span className="pcard-center">{card.suit}</span>
              <span className="pcard-corner br">
                <b>{card.rank}</b>
                <i>{card.suit}</i>
              </span>
            </>
          )}
        </div>
        <div className="pcard-face pcard-back">
          <div className="pcard-back-pattern" />
        </div>
      </div>
    </div>
  );
}
