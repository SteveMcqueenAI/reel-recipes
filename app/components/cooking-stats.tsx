"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Flame, BookOpen, PlusCircle, Trophy } from "lucide-react";

interface Analytics {
  totalRecipes: number;
  addedThisWeek: number;
  mostCooked: { id: string; title: string; cookCount: number }[];
  cookingStreak: number;
  totalCooks: number;
}

export default function CookingStats() {
  const [stats, setStats] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats || stats.totalRecipes === 0) return null;

  return (
    <section className="px-6 py-12 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Your Cooking Stats
        </h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <BookOpen className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalRecipes}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Recipes</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <PlusCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.addedThisWeek}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Added This Week</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalCooks}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Cooks</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <Flame className={`w-6 h-6 mx-auto mb-1 ${stats.cookingStreak > 0 ? "text-red-500" : "text-gray-400"}`} />
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.cookingStreak}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Day Streak {stats.cookingStreak > 0 ? "🔥" : ""}
          </div>
        </div>
      </div>

      {/* Most cooked */}
      {stats.mostCooked.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Most Cooked Recipes
          </h3>
          <div className="space-y-2">
            {stats.mostCooked.map((r, i) => (
              <Link
                key={r.id}
                href={`/recipes/${r.id}`}
                className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-2 py-1.5 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                  <span className="text-gray-400 w-4 text-right">{i + 1}.</span>
                  <span className="line-clamp-1">{r.title}</span>
                </span>
                <span className="text-xs text-orange-500 font-medium whitespace-nowrap ml-2">
                  {r.cookCount}× cooked
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
