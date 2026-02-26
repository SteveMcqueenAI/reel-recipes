"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number | null;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}

export default function StarRating({ rating, onRate, readonly = false, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const gap = size === "sm" ? "gap-0.5" : "gap-1";

  return (
    <div className={`flex items-center ${gap}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = hovered !== null ? star <= hovered : star <= (rating || 0);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onRate?.(star === rating ? 0 : star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`${starSize} transition-colors ${
                filled
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
