"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Trash2, Clock } from "lucide-react";
import Link from "next/link";

interface MealPlan {
  id: string;
  recipe_id: string;
  date: string;
  meal_type: string;
  recipes: {
    id: string;
    title: string;
    description: string;
    cook_time: string;
    servings: number;
    tags?: string[];
  };
}

interface DraggableRecipeCardProps {
  mealPlan: MealPlan;
  onRemove: () => void;
}

export function DraggableRecipeCard({ mealPlan, onRemove }: DraggableRecipeCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `meal-${mealPlan.id}`,
    data: { type: "meal-plan", mealPlan },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-gray-700 rounded-md p-1.5 mb-1 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-1">
        <button
          {...listeners}
          {...attributes}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
        >
          <GripVertical className="w-3 h-3" />
        </button>
        <div className="flex-1 min-w-0">
          <Link
            href={`/recipes/${mealPlan.recipe_id}`}
            className="text-[11px] font-medium text-gray-800 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 line-clamp-2 leading-tight"
          >
            {mealPlan.recipes.title}
          </Link>
          {mealPlan.recipes.cook_time && (
            <div className="flex items-center gap-0.5 mt-0.5">
              <Clock className="w-2.5 h-2.5 text-gray-400" />
              <span className="text-[9px] text-gray-500 dark:text-gray-400">
                {mealPlan.recipes.cook_time}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
