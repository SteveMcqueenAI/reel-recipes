"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  ChefHat,
  Clock,
  Users,
  Search,
  X,
  Plus,
  Loader2,
  ArrowLeft,
  Sparkles,
  Star,
} from "lucide-react";
import ThemeToggle from "@/app/components/theme-toggle";
import { getRecipeEmoji } from "@/lib/tag-emoji";

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  cook_time: string;
  servings: number;
  tags?: string[];
  rating?: number | null;
  cook_count?: number;
}

export default function SearchByIngredientPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [matchMode, setMatchMode] = useState<"any" | "all">("any");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch("/api/recipes");
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    const trimmed = inputValue.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setInputValue("");
    }
  };

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter((i) => i !== ing));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  // Match recipes against selected ingredients
  const matchedRecipes = useMemo(() => {
    if (ingredients.length === 0) return [];

    return recipes
      .map((recipe) => {
        const recipeIngredients = (recipe.ingredients || []).map((i) => i.toLowerCase());
        let matchCount = 0;
        ingredients.forEach((searchIng) => {
          if (recipeIngredients.some((ri) => ri.includes(searchIng))) {
            matchCount++;
          }
        });
        return { recipe, matchCount, matchPercent: Math.round((matchCount / ingredients.length) * 100) };
      })
      .filter((r) => {
        if (matchMode === "all") return r.matchCount === ingredients.length;
        return r.matchCount > 0;
      })
      .sort((a, b) => b.matchCount - a.matchCount || b.matchPercent - a.matchPercent);
  }, [recipes, ingredients, matchMode]);

  // Suggest common ingredients from user's recipes
  const suggestedIngredients = useMemo(() => {
    const counts = new Map<string, number>();
    // Extract key words from all ingredients
    const commonWords = new Set([
      "cup", "cups", "tbsp", "tsp", "tablespoon", "teaspoon", "oz", "ounce", "ounces",
      "pound", "pounds", "lb", "lbs", "kg", "g", "ml", "large", "small", "medium",
      "fresh", "dried", "chopped", "diced", "minced", "sliced", "to", "taste", "of",
      "and", "or", "a", "the", "for", "with", "into", "about", "can", "optional",
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "½", "¼", "¾", "⅓", "⅔",
    ]);

    recipes.forEach((recipe) => {
      (recipe.ingredients || []).forEach((ing) => {
        // Extract meaningful words
        const words = ing.toLowerCase()
          .replace(/[^a-z\s]/g, "")
          .split(/\s+/)
          .filter((w) => w.length > 2 && !commonWords.has(w));
        // Use the last 1-2 meaningful words as the "ingredient name"
        const name = words.slice(-2).join(" ");
        if (name) {
          counts.set(name, (counts.get(name) || 0) + 1);
        }
      });
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name]) => name)
      .filter((name) => !ingredients.includes(name));
  }, [recipes, ingredients]);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <ChefHat className="w-8 h-8 text-orange-500" />
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">Reel Recipes</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <section className="px-6 py-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <Link
            href="/recipes"
            className="text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            What Can I Make?
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-8 ml-9">
          Enter ingredients you have and find matching recipes
        </p>

        {/* Ingredient Input */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type an ingredient (e.g. chicken, rice, garlic...)"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 outline-none text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800"
              />
            </div>
            <button
              onClick={addIngredient}
              disabled={!inputValue.trim()}
              className="bg-orange-500 text-white px-4 py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Selected Ingredients */}
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {ingredients.map((ing) => (
                <span
                  key={ing}
                  className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium"
                >
                  {ing}
                  <button
                    onClick={() => removeIngredient(ing)}
                    className="hover:text-orange-900 dark:hover:text-orange-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              <button
                onClick={() => setIngredients([])}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1.5"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Match Mode Toggle */}
          {ingredients.length > 1 && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Match:</span>
              <button
                onClick={() => setMatchMode("any")}
                className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                  matchMode === "any"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                Any ingredient
              </button>
              <button
                onClick={() => setMatchMode("all")}
                className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                  matchMode === "all"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                All ingredients
              </button>
            </div>
          )}

          {/* Suggestions */}
          {ingredients.length === 0 && suggestedIngredients.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                Common in your recipes:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedIngredients.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setIngredients([...ingredients, sug])}
                    className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : ingredients.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Add some ingredients
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Tell us what you have and we&apos;ll find recipes you can make
            </p>
          </div>
        ) : matchedRecipes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              No matching recipes
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Try different ingredients or switch to &quot;Any ingredient&quot; mode
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {matchedRecipes.length} recipe{matchedRecipes.length !== 1 ? "s" : ""} found
            </p>
            <div className="space-y-3">
              {matchedRecipes.map(({ recipe, matchCount, matchPercent }) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="flex items-start gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {getRecipeEmoji(recipe.tags || [])}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-orange-500 transition-colors truncate">
                        {recipe.title}
                      </h3>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                        matchPercent === 100
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : matchPercent >= 50
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}>
                        {matchCount}/{ingredients.length} match
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                      {recipe.rating && recipe.rating > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {recipe.rating}
                        </span>
                      )}
                      {recipe.cook_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {recipe.cook_time}
                        </span>
                      )}
                      {recipe.servings > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {recipe.servings}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
