"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ChefHat, Clock, Users, Plus, Loader2, Search, X, ArrowUpDown, Heart, Tag, FolderOpen } from "lucide-react";
import FavoriteButton from "@/app/components/favorite-button";
import ThemeToggle from "@/app/components/theme-toggle";

interface Recipe {
  id: string;
  title: string;
  description: string;
  cook_time: string;
  servings: number;
  source_url: string;
  created_at: string;
  is_favorite?: boolean;
  tags?: string[];
}

export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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

  // Collect all unique tags across recipes
  const allTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    recipes.forEach((recipe) => {
      (recipe.tags || []).forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [recipes]);

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    let result = recipes;
    
    // Filter by favorites
    if (showFavoritesOnly) {
      result = result.filter((recipe) => recipe.is_favorite);
    }

    // Filter by tag
    if (selectedTag) {
      result = result.filter((recipe) =>
        (recipe.tags || []).includes(selectedTag)
      );
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(query) ||
          recipe.description?.toLowerCase().includes(query) ||
          (recipe.tags || []).some((tag) => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort by date
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [recipes, searchQuery, sortOrder, showFavoritesOnly, selectedTag]);

  const handleFavoriteToggle = (recipeId: string, newState: boolean) => {
    setRecipes(recipes.map(r => 
      r.id === recipeId ? { ...r, is_favorite: newState } : r
    ));
  };

  const favoritesCount = useMemo(() => 
    recipes.filter(r => r.is_favorite).length
  , [recipes]);

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

      {/* Content */}
      <section className="px-6 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Recipe Book</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/collections"
              className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FolderOpen className="w-5 h-5" />
              Collections
            </Link>
            <button
              onClick={() => router.push("/")}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Recipe
            </button>
          </div>
        </div>

        {/* Search Bar, Filter, and Sort */}
        {recipes.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 outline-none text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Favorites Filter */}
              {favoritesCount > 0 && (
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                    showFavoritesOnly
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-200 dark:hover:border-red-800"
                  }`}
                >
                  <Heart className="w-4 h-4" fill={showFavoritesOnly ? "currentColor" : "none"} />
                  <span className="hidden sm:inline">{favoritesCount}</span>
                </button>
              )}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                  className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 outline-none text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 cursor-pointer"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tag Filter Pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedTag === tag
                    ? "bg-orange-500 text-white"
                    : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40"
                }`}
              >
                <Tag className="w-3 h-3" />
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <ChefHat className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              No recipes yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Paste an Instagram or TikTok URL to extract your first recipe
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Your First Recipe
            </button>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            {showFavoritesOnly ? (
              <>
                <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  No favorites yet
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Heart some recipes to see them here
                </p>
                <button
                  onClick={() => setShowFavoritesOnly(false)}
                  className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
                >
                  Show all recipes
                </button>
              </>
            ) : (
              <>
                <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  No recipes found
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Try a different search term
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
                >
                  Clear search
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group relative"
              >
                <Link href={`/recipes/${recipe.id}`}>
                  <div className="h-40 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center relative">
                    <ChefHat className="w-16 h-16 text-white/80 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 pr-8">
                      {recipe.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                    {(recipe.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(recipe.tags || []).slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                          >
                            {tag}
                          </span>
                        ))}
                        {(recipe.tags || []).length > 3 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            +{(recipe.tags || []).length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      {recipe.cook_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.cook_time}</span>
                        </div>
                      )}
                      {recipe.servings > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{recipe.servings} servings</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="absolute top-3 right-3">
                  <FavoriteButton
                    recipeId={recipe.id}
                    isFavorite={recipe.is_favorite || false}
                    onToggle={(newState) => handleFavoriteToggle(recipe.id, newState)}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
