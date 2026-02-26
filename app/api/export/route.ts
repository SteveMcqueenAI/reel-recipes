import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabase();
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const exportData = {
      exportedAt: new Date().toISOString(),
      recipeCount: recipes?.length || 0,
      recipes: (recipes || []).map((r: Record<string, unknown>) => ({
        title: r.title,
        description: r.description,
        ingredients: r.ingredients,
        steps: r.steps,
        prep_time: r.prep_time,
        cook_time: r.cook_time,
        servings: r.servings,
        source_url: r.source_url,
        tags: r.tags,
        notes: r.notes,
        rating: r.rating,
        cook_count: r.cook_count,
        is_favorite: r.is_favorite,
        created_at: r.created_at,
      })),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="reel-recipes-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export recipes" }, { status: 500 });
  }
}
