"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  ChefHat,
  ShoppingCart,
  Check,
  Copy,
  Download,
  ArrowLeft,
  Loader2,
  Square,
  CheckSquare,
  X,
} from "lucide-react";
import ThemeToggle from "@/app/components/theme-toggle";
import {
  buildShoppingList,
  shoppingListToText,
} from "@/lib/ingredients";

interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  servings: number;
}

export default function ShoppingListPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

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

  const toggleRecipe = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    // Reset checked items when selection changes
    setCheckedItems(new Set());
  };

  const selectAll = () => {
    setSelectedIds(new Set(recipes.map((r) => r.id)));
    setCheckedItems(new Set());
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setCheckedItems(new Set());
  };

  const selectedRecipes = useMemo(
    () => recipes.filter((r) => selectedIds.has(r.id)),
    [recipes, selectedIds]
  );

  const shoppingList = useMemo(
    () => buildShoppingList(selectedRecipes),
    [selectedRecipes]
  );

  const toggleChecked = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleCopy = async () => {
    const text = shoppingListToText(shoppingList);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: create textarea
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const text = shoppingListToText(shoppingList, "Reel Recipes");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shopping-list-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uncheckedCount = shoppingList.length - checkedItems.size;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <ChefHat className="w-8 h-8 text-orange-500" />
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Reel Recipes
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <section className="px-6 py-8 max-w-6xl mx-auto">
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to recipes
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Shopping List
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recipe Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Select Recipes
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs text-orange-500 hover:text-orange-600 dark:text-orange-400"
                  >
                    All
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    None
                  </button>
                </div>
              </div>

              {recipes.length === 0 ? (
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  No recipes yet. Add some first!
                </p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => toggleRecipe(recipe.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3 ${
                        selectedIds.has(recipe.id)
                          ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                          : "bg-gray-50 dark:bg-gray-700/50 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {selectedIds.has(recipe.id) ? (
                        <CheckSquare className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {recipe.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {recipe.ingredients.length} ingredients
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedIds.size > 0 && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {selectedIds.size} recipe{selectedIds.size !== 1 ? "s" : ""}{" "}
                  selected
                </p>
              )}
            </div>
          </div>

          {/* Shopping List */}
          <div className="lg:col-span-2">
            {selectedIds.size === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Select recipes to generate a shopping list
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Pick recipes from the left and we&apos;ll combine all
                  ingredients, merging duplicates automatically.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {shoppingList.length} item
                      {shoppingList.length !== 1 ? "s" : ""}
                    </h2>
                    {checkedItems.size > 0 && (
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        {uncheckedCount} remaining
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    {checkedItems.size > 0 && (
                      <button
                        onClick={() => setCheckedItems(new Set())}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Uncheck all
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <ul className="space-y-1">
                  {shoppingList.map((item, index) => {
                    const isChecked = checkedItems.has(index);
                    return (
                      <li key={index}>
                        <button
                          onClick={() => toggleChecked(index)}
                          className={`w-full text-left px-4 py-3 rounded-lg flex items-start gap-3 transition-colors ${
                            isChecked
                              ? "bg-gray-50 dark:bg-gray-700/30"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <p
                              className={`text-sm ${
                                isChecked
                                  ? "line-through text-gray-400 dark:text-gray-500"
                                  : "text-gray-800 dark:text-gray-200"
                              }`}
                            >
                              {item.combined}
                            </p>
                            {item.entries.length > 1 && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                from{" "}
                                {item.entries
                                  .map((e) => e.recipeName)
                                  .filter(
                                    (v, i, a) => a.indexOf(v) === i
                                  )
                                  .join(", ")}
                              </p>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
