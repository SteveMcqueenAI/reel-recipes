"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";

interface FavoriteButtonProps {
  recipeId: string;
  isFavorite: boolean;
  onToggle?: (newState: boolean) => void;
  size?: "sm" | "md";
}

export default function FavoriteButton({ 
  recipeId, 
  isFavorite: initialFavorite, 
  onToggle,
  size = "md" 
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: !isFavorite }),
      });

      if (res.ok) {
        const newState = !isFavorite;
        setIsFavorite(newState);
        onToggle?.(newState);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const padding = size === "sm" ? "p-1.5" : "p-2";

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`${padding} rounded-full transition-all ${
        isFavorite 
          ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20" 
          : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
      }`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isLoading ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : (
        <Heart 
          className={iconSize} 
          fill={isFavorite ? "currentColor" : "none"}
        />
      )}
    </button>
  );
}
