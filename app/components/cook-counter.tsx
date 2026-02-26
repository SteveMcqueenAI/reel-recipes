"use client";

import { useState } from "react";
import { Flame, Loader2 } from "lucide-react";

interface CookCounterProps {
  recipeId: string;
  cookCount: number;
  lastCookedAt: string | null;
  onUpdate?: (count: number, lastCooked: string) => void;
}

export default function CookCounter({ recipeId, cookCount, lastCookedAt, onUpdate }: CookCounterProps) {
  const [count, setCount] = useState(cookCount);
  const [lastCooked, setLastCooked] = useState(lastCookedAt);
  const [saving, setSaving] = useState(false);

  const handleCook = async () => {
    setSaving(true);
    const newCount = count + 1;
    const now = new Date().toISOString();

    try {
      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cook_count: newCount, last_cooked_at: now }),
      });

      if (res.ok) {
        setCount(newCount);
        setLastCooked(now);
        onUpdate?.(newCount, now);
      }
    } catch (error) {
      console.error("Failed to update cook count:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleCook}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors font-medium text-sm print:hidden"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Flame className="w-4 h-4" />
        )}
        I Made This!
      </button>
      {count > 0 && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Cooked {count} time{count !== 1 ? "s" : ""}
          {lastCooked && <> · Last: {formatDate(lastCooked)}</>}
        </span>
      )}
    </div>
  );
}
