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
  Pencil,
  Check,
  X,
  Printer,
  Plus,
  Minus,
  Tag,
  Bookmark,
} from "lucide-react";
import ShareMenu from "@/app/components/share-menu";
import FavoriteButton from "@/app/components/favorite-button";
import AddToCollectionModal from "@/app/components/add-to-collection-modal";
import StarRating from "@/app/components/star-rating";
import CookCounter from "@/app/components/cook-counter";
import NotesSection from "@/app/components/notes-section";
import ThemeToggle from "@/app/components/theme-toggle";
import { scaleIngredient } from "@/lib/ingredients";

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
  is_favorite?: boolean;
  tags?: string[];
  notes?: string;
  rating?: number | null;
  cook_count?: number;
  last_cooked_at?: string | null;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Recipe | null>(null);

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

  const startEditing = () => {
    setEditForm({ ...recipe! });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditForm(null);
    setEditing(false);
  };

  const saveEdits = async () => {
    if (!editForm) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/recipes/${recipe!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const data = await res.json();
        setRecipe(data.recipe);
        setEditing(false);
        setEditForm(null);
      }
    } catch (error) {
      console.error("Failed to save recipe:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const updateIngredient = (index: number, value: string) => {
    if (!editForm) return;
    const newIngredients = [...editForm.ingredients];
    newIngredients[index] = value;
    setEditForm({ ...editForm, ingredients: newIngredients });
  };

  const addIngredient = () => {
    if (!editForm) return;
    setEditForm({ ...editForm, ingredients: [...editForm.ingredients, ""] });
  };

  const removeIngredient = (index: number) => {
    if (!editForm) return;
    const newIngredients = editForm.ingredients.filter((_, i) => i !== index);
    setEditForm({ ...editForm, ingredients: newIngredients });
  };

  const updateStep = (index: number, value: string) => {
    if (!editForm) return;
    const newSteps = [...editForm.steps];
    newSteps[index] = value;
    setEditForm({ ...editForm, steps: newSteps });
  };

  const addStep = () => {
    if (!editForm) return;
    setEditForm({ ...editForm, steps: [...editForm.steps, ""] });
  };

  const removeStep = (index: number) => {
    if (!editForm) return;
    const newSteps = editForm.steps.filter((_, i) => i !== index);
    setEditForm({ ...editForm, steps: newSteps });
  };

  const [newTag, setNewTag] = useState("");
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [scaledServings, setScaledServings] = useState<number | null>(null);

  const scaleFactor =
    scaledServings && recipe?.servings
      ? scaledServings / recipe.servings
      : 1;

  const adjustServings = (delta: number) => {
    const current = scaledServings ?? recipe?.servings ?? 1;
    const next = Math.max(1, current + delta);
    setScaledServings(next);
  };

  const resetServings = () => setScaledServings(null);

  const addTag = () => {
    if (!editForm || !newTag.trim()) return;
    const tag = newTag.trim();
    if ((editForm.tags || []).includes(tag)) {
      setNewTag("");
      return;
    }
    setEditForm({ ...editForm, tags: [...(editForm.tags || []), tag] });
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, tags: (editForm.tags || []).filter((t) => t !== tag) });
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
      <header className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto print:hidden">
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
      <section className="px-6 py-8 max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 mb-6 print:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to recipes
        </Link>

        {/* Recipe Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 mb-6 print:shadow-none print:p-0 print:bg-white">
          <div className="flex justify-between items-start mb-4">
            {editing ? (
              <input
                type="text"
                value={editForm?.title || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm!, title: e.target.value })
                }
                className="text-3xl font-bold text-gray-900 dark:text-gray-100 w-full border-b-2 border-orange-500 outline-none bg-transparent"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{recipe.title}</h1>
            )}
            <div className="flex items-center gap-1 print:hidden">
              {editing ? (
                <>
                  <button
                    onClick={saveEdits}
                    disabled={saving}
                    className="text-green-500 hover:text-green-600 transition-colors p-2"
                    title="Save changes"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2"
                    title="Cancel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <FavoriteButton 
                    recipeId={recipe.id} 
                    isFavorite={recipe.is_favorite || false} 
                  />
                  <button
                    onClick={() => setShowCollectionModal(true)}
                    className="text-gray-400 hover:text-orange-500 dark:text-gray-500 dark:hover:text-orange-400 transition-colors p-2"
                    title="Save to collection"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <ShareMenu 
                    title={recipe.title} 
                    description={recipe.description}
                    recipeId={recipe.id} 
                  />
                  <button
                    onClick={handlePrint}
                    className="text-gray-400 hover:text-orange-500 dark:text-gray-500 dark:hover:text-orange-400 transition-colors p-2"
                    title="Print recipe"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button
                    onClick={startEditing}
                    className="text-gray-400 hover:text-orange-500 dark:text-gray-500 dark:hover:text-orange-400 transition-colors p-2"
                    title="Edit recipe"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors p-2"
                    title="Delete recipe"
                  >
                    {deleting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {editing ? (
            <textarea
              value={editForm?.description || ""}
              onChange={(e) =>
                setEditForm({ ...editForm!, description: e.target.value })
              }
              className="text-gray-600 dark:text-gray-300 mb-6 w-full p-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg outline-none focus:border-orange-500"
              rows={2}
              placeholder="Recipe description..."
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-300 mb-6">{recipe.description}</p>
          )}

          {/* Tags */}
          {editing ? (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {(editForm?.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-orange-400 hover:text-orange-600 dark:text-orange-500 dark:hover:text-orange-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag..."
                  className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-full outline-none focus:border-orange-500"
                />
                <button
                  onClick={addTag}
                  className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 text-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (recipe?.tags || []).length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {(recipe.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            {editing ? (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Prep:</span>
                  <input
                    type="text"
                    value={editForm?.prep_time || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm!, prep_time: e.target.value })
                    }
                    className="border-b border-gray-300 dark:border-gray-600 outline-none focus:border-orange-500 w-20 bg-transparent dark:text-gray-200"
                    placeholder="15 mins"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Cook:</span>
                  <input
                    type="text"
                    value={editForm?.cook_time || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm!, cook_time: e.target.value })
                    }
                    className="border-b border-gray-300 dark:border-gray-600 outline-none focus:border-orange-500 w-20 bg-transparent dark:text-gray-200"
                    placeholder="30 mins"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <input
                    type="number"
                    value={editForm?.servings || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm!, servings: parseInt(e.target.value) || 0 })
                    }
                    className="border-b border-gray-300 dark:border-gray-600 outline-none focus:border-orange-500 w-12 bg-transparent dark:text-gray-200"
                    placeholder="4"
                  />
                  <span>servings</span>
                </div>
              </>
            ) : (
              <>
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
                    <button
                      onClick={() => adjustServings(-1)}
                      className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-colors print:hidden"
                      aria-label="Decrease servings"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className={scaledServings ? "font-semibold text-orange-500" : ""}>
                      {scaledServings ?? recipe.servings} servings
                    </span>
                    <button
                      onClick={() => adjustServings(1)}
                      className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-colors print:hidden"
                      aria-label="Increase servings"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    {scaledServings && (
                      <button
                        onClick={resetServings}
                        className="text-xs text-gray-400 hover:text-orange-500 dark:text-gray-500 dark:hover:text-orange-400 transition-colors print:hidden"
                      >
                        reset
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
            {recipe.source_url && !editing && (
              <a
                href={recipe.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 print:hidden"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View original</span>
              </a>
            )}
          </div>
        </div>

        {/* Rating, Cook Counter & Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6 print:shadow-none print:bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating:</span>
              <StarRating
                rating={recipe.rating ?? null}
                onRate={async (newRating) => {
                  const rating = newRating === 0 ? null : newRating;
                  try {
                    const res = await fetch(`/api/recipes/${recipe.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ rating }),
                    });
                    if (res.ok) {
                      setRecipe({ ...recipe, rating });
                    }
                  } catch (err) {
                    console.error("Failed to save rating:", err);
                  }
                }}
              />
            </div>
            <div className="sm:border-l sm:border-gray-200 sm:dark:border-gray-700 sm:pl-4">
              <CookCounter
                recipeId={recipe.id}
                cookCount={recipe.cook_count ?? 0}
                lastCookedAt={recipe.last_cooked_at ?? null}
                onUpdate={(count, lastCooked) => {
                  setRecipe({ ...recipe, cook_count: count, last_cooked_at: lastCooked });
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <NotesSection
            recipeId={recipe.id}
            initialNotes={recipe.notes ?? ""}
            onSave={(notes) => setRecipe({ ...recipe, notes })}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6 print:block">
          {/* Ingredients */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 print:shadow-none print:mb-6 print:bg-white">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Ingredients
            </h2>
            {editing ? (
              <div className="space-y-2">
                {editForm?.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg outline-none focus:border-orange-500"
                      placeholder="Ingredient..."
                    />
                    <button
                      onClick={() => removeIngredient(index)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addIngredient}
                  className="flex items-center gap-2 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 text-sm mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Add ingredient
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0 print:bg-gray-800" />
                    <span className={`text-gray-700 dark:text-gray-300 ${scaleFactor !== 1 ? "font-medium" : ""}`}>
                      {scaleFactor !== 1
                        ? scaleIngredient(ingredient, scaleFactor)
                        : ingredient}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Steps */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 print:shadow-none print:bg-white">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Instructions
            </h2>
            {editing ? (
              <div className="space-y-3">
                {editForm?.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                      {index + 1}
                    </span>
                    <textarea
                      value={step}
                      onChange={(e) => updateStep(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg outline-none focus:border-orange-500"
                      rows={2}
                      placeholder="Step instruction..."
                    />
                    <button
                      onClick={() => removeStep(index)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 mt-2"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addStep}
                  className="flex items-center gap-2 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 text-sm mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Add step
                </button>
              </div>
            ) : (
              <ol className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium print:bg-gray-800">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>

      {/* Add to Collection Modal */}
      <AddToCollectionModal
        recipeId={recipe.id}
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
      />
    </main>
  );
}
