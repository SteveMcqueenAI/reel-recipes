"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  tags?: string[];
}

export default function PrintRecipePage() {
  const params = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/recipes/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setRecipe(d.recipe);
        // Auto-print after render
        setTimeout(() => window.print(), 500);
      })
      .catch(console.error);
  }, [params.id]);

  if (!recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading recipe...</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
        @page {
          margin: 1.5cm;
        }
      `}</style>

      <div className="max-w-3xl mx-auto p-8 font-serif text-gray-900 bg-white min-h-screen">
        {/* Back button - hidden in print */}
        <div className="no-print mb-6 flex items-center gap-4">
          <a
            href={`/recipes/${recipe.id}`}
            className="text-orange-500 hover:text-orange-600 text-sm font-sans"
          >
            ← Back to recipe
          </a>
          <button
            onClick={() => window.print()}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-sans hover:bg-orange-600"
          >
            🖨️ Print
          </button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
        {recipe.description && (
          <p className="text-gray-600 italic mb-4">{recipe.description}</p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6 pb-4 border-b border-gray-200">
          {recipe.prep_time && (
            <span><strong>Prep:</strong> {recipe.prep_time}</span>
          )}
          {recipe.cook_time && (
            <span><strong>Cook:</strong> {recipe.cook_time}</span>
          )}
          {recipe.servings && (
            <span><strong>Servings:</strong> {recipe.servings}</span>
          )}
        </div>

        {/* Two-column layout for print */}
        <div className="grid grid-cols-[1fr_2fr] gap-8">
          {/* Ingredients */}
          <div>
            <h2 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-700">
              Ingredients
            </h2>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div>
            <h2 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-700">
              Instructions
            </h2>
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="font-bold text-gray-400 flex-shrink-0 w-6 text-right">
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400">
            Tags: {recipe.tags.join(", ")}
          </div>
        )}

        {/* Source */}
        {recipe.source_url && (
          <div className="mt-2 text-xs text-gray-400">
            Source: {recipe.source_url}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
          Printed from Reel Recipes
        </div>
      </div>
    </>
  );
}
