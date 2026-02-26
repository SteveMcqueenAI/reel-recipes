"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  ChefHat,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  Trash2,
} from "lucide-react";
import FavoriteButton from "@/app/components/favorite-button";
import ThemeToggle from "@/app/components/theme-toggle";

interface Recipe {
  id: string;
  title: string;
  description: string;
  cook_time: string;
  servings: number;
  is_favorite?: boolean;
  tags?: string[];
}

interface Collection {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) fetchCollection(params.id as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchCollection = async (id: string) => {
    try {
      const res = await fetch(`/api/collections/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCollection(data.collection);
        setRecipes(data.recipes || []);
      } else {
        router.push("/collections");
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
      router.push("/collections");
    } finally {
      setLoading(false);
    }
  };

  const removeRecipe = async (recipeId: string) => {
    if (!collection) return;
    setRemovingId(recipeId);
    try {
      const res = await fetch(`/api/collections/${collection.id}/recipes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id: recipeId }),
      });
      if (res.ok) {
        setRecipes(recipes.filter(r => r.id !== recipeId));
      }
    } catch (error) {
      console.error("Remove error:", error);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!collection) return null;

  return (
    <main className="min-h-screen">
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

      <section className="px-6 py-8 max-w-6xl mx-auto">
        <Link
          href="/collections"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Collections
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl">{collection.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {collection.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <ChefHat className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              No recipes in this collection
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Add recipes from their detail page using the bookmark button
            </p>
            <Link
              href="/recipes"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Browse your recipes →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group relative"
              >
                <Link href={`/recipes/${recipe.id}`}>
                  <div className="h-40 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
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
                {/* Top-right actions */}
                <div className="absolute top-3 right-3 flex gap-1">
                  <FavoriteButton
                    recipeId={recipe.id}
                    isFavorite={recipe.is_favorite || false}
                    size="sm"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeRecipe(recipe.id);
                    }}
                    disabled={removingId === recipe.id}
                    className="p-1.5 rounded-full bg-white/80 dark:bg-gray-700/80 text-gray-400 hover:text-red-500 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from collection"
                  >
                    {removingId === recipe.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
