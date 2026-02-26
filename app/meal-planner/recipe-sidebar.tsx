"use client";

import { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Search, X, Loader2, GripVertical, Clock, Tag } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  description: string;
  cook_time: string;
  servings: number;
  tags?: string[];
}

interface RecipeSidebarProps {
  onClose: () => void;
}

function SidebarRecipeCard({ recipe }: { recipe: Recipe }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-${recipe.id}`,
    data: { type: "sidebar-recipe", recipe },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
      {...listeners}
      {...attributes}
    >
      <GripVertical className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
          {recipe.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {recipe.cook_time && (
            <div className="flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] text-gray-500">{recipe.cook_time}</span>
            </div>
          )}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex items-center gap-0.5">
              <Tag className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] text-gray-500">{recipe.tags[0]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RecipeSidebar({ onClose }: RecipeSidebarProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
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
    fetchRecipes();
  }, []);

  const filtered = searchQuery.trim()
    ? recipes.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : recipes;

  return (
    <aside className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-[calc(100vh-57px)] sticky top-[57px] flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">My Recipes</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <p className="text-[10px] text-gray-500 mt-1.5">Drag recipes onto the calendar</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            {searchQuery ? "No recipes found" : "No recipes yet. Save some first!"}
          </p>
        ) : (
          filtered.map((recipe) => <SidebarRecipeCard key={recipe.id} recipe={recipe} />)
        )}
      </div>
    </aside>
  );
}
