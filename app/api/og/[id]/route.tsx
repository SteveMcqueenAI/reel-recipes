import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const { data: recipe } = await supabase
      .from("recipes")
      .select("title, description, cook_time, prep_time, servings, ingredients, tags")
      .eq("id", id)
      .single();

    if (!recipe) {
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              backgroundColor: "#fff7ed",
              fontSize: 48,
              color: "#9a3412",
            }}
          >
            Recipe not found
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const ingredientCount = recipe.ingredients?.length || 0;
    const tags = (recipe.tags || []).slice(0, 4);

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            backgroundColor: "#fff7ed",
            padding: "60px",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#f97316",
              }}
            >
              🍳 Reel Recipes
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#1f2937",
              lineHeight: 1.2,
              marginBottom: "16px",
              maxWidth: "90%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {recipe.title.length > 60 ? recipe.title.slice(0, 57) + "..." : recipe.title}
          </div>

          {/* Description */}
          {recipe.description && (
            <div
              style={{
                fontSize: 24,
                color: "#6b7280",
                marginBottom: "24px",
                lineHeight: 1.4,
                maxWidth: "85%",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {recipe.description.length > 120
                ? recipe.description.slice(0, 117) + "..."
                : recipe.description}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
              {tags.map((tag: string) => (
                <div
                  key={tag}
                  style={{
                    backgroundColor: "#fed7aa",
                    color: "#c2410c",
                    padding: "6px 16px",
                    borderRadius: "9999px",
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Meta row */}
          <div
            style={{
              display: "flex",
              gap: "40px",
              fontSize: 22,
              color: "#6b7280",
            }}
          >
            {recipe.prep_time && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                ⏱️ Prep: {recipe.prep_time}
              </div>
            )}
            {recipe.cook_time && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                🔥 Cook: {recipe.cook_time}
              </div>
            )}
            {recipe.servings > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                👥 {recipe.servings} servings
              </div>
            )}
            {ingredientCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                🥘 {ingredientCount} ingredients
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#fff7ed",
            fontSize: 48,
            color: "#9a3412",
          }}
        >
          🍳 Reel Recipes
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
