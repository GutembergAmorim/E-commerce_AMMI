import React from "react";

/**
 * StarRating - displays filled/half/empty stars
 * @param {number} rating - 0 to 5 (supports decimals)
 * @param {number} size - star size in px (default 14)
 * @param {number} count - number of reviews (shown after stars if provided)
 * @param {boolean} interactive - if true, allows clicking to set rating
 * @param {function} onRate - callback when interactive star is clicked
 */
const StarRating = ({ rating = 0, size = 14, count, interactive = false, onRate, hoverRating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    const filled = (hoverRating || rating) >= i;
    const halfFilled = !filled && (hoverRating || rating) >= i - 0.5;

    stars.push(
      <i
        key={i}
        className={`fa-star ${filled ? "fas" : halfFilled ? "fas fa-star-half-stroke" : "far"}`}
        style={{
          color: filled || halfFilled ? "#f59e0b" : "#ddd",
          fontSize: size,
          cursor: interactive ? "pointer" : "default",
          transition: "color 0.15s, transform 0.15s",
          transform: interactive && (hoverRating === i) ? "scale(1.2)" : "scale(1)",
        }}
        onClick={() => interactive && onRate && onRate(i)}
      />
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      {stars}
      {count !== undefined && (
        <span style={{ fontSize: size * 0.78, color: "#999", marginLeft: 4, fontWeight: 500 }}>
          ({count})
        </span>
      )}
    </span>
  );
};

export default StarRating;
