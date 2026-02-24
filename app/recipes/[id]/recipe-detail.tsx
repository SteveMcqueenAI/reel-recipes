"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  ChefHat,
  Clock,
  Users,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  cook_time: string;
  prep_time: string;
  servings: number;
  source_url: string;
  video_url: string;
  created_at: string;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchRecipe = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/recipes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRecipe(data.recipe);
      } else {
        router.push("/recipes");
      }
    } catch (error) {
      console.error("Failed to fetch recipe:", error);
      router.push("/recipes");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (params.id) {
      fetchRecipe(params.id as string);
    }
  }, [params.id, fetchRecipe]);

  const handleDelete = async () => {
    if (!recipe || !confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/recipes");
      }
    } catch (error) {
      console.error("Failed to delete recipe:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </main>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <ChefHat className="w-8 h-8 text-orange-500" />
          <span className="text-xl font-bold text-gray-800">Reel Recipes</span>
        </Link>
        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Content */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to recipes
        </Link>

        {/* Recipe Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-gray-400 hover:text-red-500 transition-colors p-2"
              title="Delete recipe"
            >
              {deleting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
          </div>

          <p className="text-gray-600 mb-6">{recipe.description}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            {recipe.prep_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Prep: {recipe.prep_time}</span>
              </div>
            )}
            {recipe.cook_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Cook: {recipe.cook_time}</span>
              </div>
            )}
            {recipe.servings > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{recipe.servings} servings</span>
              </div>
            )}
            {recipe.source_url && (
              <a
                href={recipe.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View original</span>
              </a>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Ingredients */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ingredients
            </h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Instructions
            </h2>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
