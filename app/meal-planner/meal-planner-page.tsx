"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Loader2,
  Coffee,
  Sun,
  Moon,
  Cookie,
} from "lucide-react";
import ThemeToggle from "@/app/components/theme-toggle";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";

import { DroppableSlot } from "./droppable-slot";
import { DraggableRecipeCard } from "./draggable-recipe-card";
import { RecipeSidebar } from "./recipe-sidebar";

interface Recipe {
  id: string;
  title: string;
  description: string;
  cook_time: string;
  servings: number;
  tags?: string[];
}

interface MealPlan {
  id: string;
  recipe_id: string;
  date: string;
  meal_type: string;
  position: number;
  notes: string | null;
  recipes: Recipe;
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
type MealType = (typeof MEAL_TYPES)[number];

const MEAL_ICONS: Record<MealType, typeof Coffee> = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700",
  lunch: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
  dinner: "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700",
  snack: "bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700",
};

function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDayLabel(d: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function MealPlannerPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [, setDraggedMealPlan] = useState<MealPlan | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const startDate = formatDate(weekDates[0]);
  const endDate = formatDate(weekDates[6]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const fetchMealPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meal-plans?startDate=${startDate}&endDate=${endDate}`);
      if (res.ok) {
        const data = await res.json();
        setMealPlans(data.mealPlans || []);
      }
    } catch (error) {
      console.error("Failed to fetch meal plans:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchMealPlans();
  }, [fetchMealPlans]);

  const getMealsForSlot = (date: string, mealType: string) => {
    return mealPlans.filter((mp) => mp.date === date && mp.meal_type === mealType);
  };

  const addToMealPlan = async (recipeId: string, date: string, mealType: string) => {
    try {
      const res = await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id: recipeId, date, meal_type: mealType }),
      });
      if (res.ok) {
        fetchMealPlans();
      }
    } catch (error) {
      console.error("Failed to add to meal plan:", error);
    }
  };

  const removeFromMealPlan = async (id: string) => {
    try {
      const res = await fetch(`/api/meal-plans?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMealPlans((prev) => prev.filter((mp) => mp.id !== id));
      }
    } catch (error) {
      console.error("Failed to remove from meal plan:", error);
    }
  };

  const moveMealPlan = async (id: string, date: string, mealType: string) => {
    try {
      const res = await fetch("/api/meal-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, date, meal_type: mealType }),
      });
      if (res.ok) {
        fetchMealPlans();
      }
    } catch (error) {
      console.error("Failed to move meal plan:", error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;

    if (data?.type === "sidebar-recipe") {
      setActiveRecipe(data.recipe);
    } else if (data?.type === "meal-plan") {
      setDraggedMealPlan(data.mealPlan);
      setActiveRecipe(data.mealPlan.recipes);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRecipe(null);
    setDraggedMealPlan(null);

    if (!over) return;

    const overData = over.data.current;
    if (!overData?.date || !overData?.mealType) return;

    const activeData = active.data.current;

    if (activeData?.type === "sidebar-recipe") {
      addToMealPlan(activeData.recipe.id, overData.date, overData.mealType);
    } else if (activeData?.type === "meal-plan") {
      const mp = activeData.mealPlan as MealPlan;
      if (mp.date !== overData.date || mp.meal_type !== overData.mealType) {
        moveMealPlan(mp.id, overData.date, overData.mealType);
      }
    }
  };

  const weekLabel = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${months[start.getMonth()]} ${start.getFullYear()}`;
    }
    return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
  }, [weekDates]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-orange-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-orange-200 dark:border-gray-700">
          <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:opacity-80">
                <ChefHat className="w-6 h-6" />
                <span className="font-bold text-lg hidden sm:inline">Reel Recipes</span>
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <h1 className="font-semibold text-gray-800 dark:text-gray-200">Meal Planner</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/recipes"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
              >
                My Recipes
              </Link>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Recipe
              </button>
              <ThemeToggle />
              <UserButton />
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Main Calendar */}
          <main className="flex-1 max-w-[1600px] mx-auto px-4 py-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{weekLabel}</h2>
                {weekOffset !== 0 && (
                  <button
                    onClick={() => setWeekOffset(0)}
                    className="text-xs text-orange-500 hover:text-orange-600 mt-0.5"
                  >
                    Back to this week
                  </button>
                )}
              </div>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-3">
                {/* Day Headers */}
                {weekDates.map((date) => (
                  <div
                    key={formatDate(date)}
                    className={`text-center py-2 px-1 rounded-lg font-medium text-sm ${
                      isToday(date)
                        ? "bg-orange-500 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {formatDayLabel(date)}
                  </div>
                ))}

                {/* Meal Type Rows */}
                {MEAL_TYPES.map((mealType) => (
                  weekDates.map((date) => {
                    const dateStr = formatDate(date);
                    const meals = getMealsForSlot(dateStr, mealType);
                    const MealIcon = MEAL_ICONS[mealType];

                    return (
                      <DroppableSlot
                        key={`${dateStr}-${mealType}`}
                        id={`${dateStr}-${mealType}`}
                        date={dateStr}
                        mealType={mealType}
                        className={`min-h-[100px] rounded-lg border-2 border-dashed p-2 transition-colors ${MEAL_COLORS[mealType]}`}
                      >
                        <div className="flex items-center gap-1 mb-1.5 opacity-60">
                          <MealIcon className="w-3 h-3" />
                          <span className="text-[10px] font-medium uppercase tracking-wide">
                            {mealType}
                          </span>
                        </div>
                        {meals.map((mp) => (
                          <DraggableRecipeCard
                            key={mp.id}
                            mealPlan={mp}
                            onRemove={() => removeFromMealPlan(mp.id)}
                          />
                        ))}
                        {meals.length === 0 && (
                          <div className="flex items-center justify-center h-[60px] opacity-30">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                      </DroppableSlot>
                    );
                  })
                ))}
              </div>
            )}
          </main>

          {/* Recipe Sidebar */}
          {sidebarOpen && (
            <RecipeSidebar onClose={() => setSidebarOpen(false)} />
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeRecipe && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-orange-300 p-2 w-[160px] opacity-90">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
              {activeRecipe.title}
            </p>
            {activeRecipe.cook_time && (
              <p className="text-[10px] text-gray-500 mt-0.5">{activeRecipe.cook_time}</p>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
