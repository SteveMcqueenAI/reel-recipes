import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/collections/:id/recipes - Add a recipe to a collection
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: collectionId } = await params;
    const { recipe_id } = await req.json();

    if (!recipe_id) {
      return NextResponse.json({ error: "recipe_id is required" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Verify user owns both the collection and the recipe
    const [{ data: collection }, { data: recipe }] = await Promise.all([
      supabase.from("collections").select("id").eq("id", collectionId).eq("user_id", userId).single(),
      supabase.from("recipes").select("id").eq("id", recipe_id).eq("user_id", userId).single(),
    ]);

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("collection_recipes")
      .upsert({ collection_id: collectionId, recipe_id }, { onConflict: "collection_id,recipe_id" });

    if (error) {
      console.error("Add to collection error:", error);
      return NextResponse.json({ error: "Failed to add recipe" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to add recipe" }, { status: 500 });
  }
}

// DELETE /api/collections/:id/recipes - Remove a recipe from a collection
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: collectionId } = await params;
    const { recipe_id } = await req.json();

    // Verify user owns the collection
    const { data: collection } = await getSupabase()
      .from("collections")
      .select("id")
      .eq("id", collectionId)
      .eq("user_id", userId)
      .single();

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    const { error } = await getSupabase()
      .from("collection_recipes")
      .delete()
      .eq("collection_id", collectionId)
      .eq("recipe_id", recipe_id);

    if (error) {
      return NextResponse.json({ error: "Failed to remove recipe" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove recipe" }, { status: 500 });
  }
}
