import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/collections/:id - Get collection with its recipes
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabase();

    // Fetch collection
    const { data: collection, error } = await supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Fetch recipe IDs in this collection
    const { data: links, error: linkError } = await supabase
      .from("collection_recipes")
      .select("recipe_id, added_at")
      .eq("collection_id", id)
      .order("added_at", { ascending: false });

    if (linkError) {
      console.error("Link error:", linkError);
      return NextResponse.json({ collection, recipes: [] });
    }

    const recipeIds = (links || []).map(l => l.recipe_id);

    if (recipeIds.length === 0) {
      return NextResponse.json({ collection, recipes: [] });
    }

    // Fetch actual recipes
    const { data: recipes, error: recipeError } = await supabase
      .from("recipes")
      .select("*")
      .in("id", recipeIds);

    if (recipeError) {
      console.error("Recipe error:", recipeError);
      return NextResponse.json({ collection, recipes: [] });
    }

    // Sort by added_at order
    const orderMap = new Map(recipeIds.map((id, i) => [id, i]));
    const sorted = (recipes || []).sort(
      (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
    );

    return NextResponse.json({ collection, recipes: sorted });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}

// PATCH /api/collections/:id - Update collection
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const updates: Record<string, string> = {};

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.description !== undefined) updates.description = body.description?.trim() || null;
    if (body.emoji !== undefined) updates.emoji = body.emoji;

    const { data, error } = await getSupabase()
      .from("collections")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
    }

    return NextResponse.json({ collection: data });
  } catch {
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

// DELETE /api/collections/:id - Delete collection
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { error } = await getSupabase()
      .from("collections")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
