import React, { useState } from "react";

const StarRating = () => {
  const [rating, setRating] = useState(0);

  const handleRating = (index) => {
    setRating(index + 1);
  };

  return (
    <div style={{ display: "flex", cursor: "pointer" }}>
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          onClick={() => handleRating(index)}
          style={{
            fontSize: "2rem",
            color: index < rating ? "gold" : "lightgray",
            margin: "0 5px",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;