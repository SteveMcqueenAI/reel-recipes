import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/recipes/:id/collections - Get collections a recipe belongs to
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: recipeId } = await params;
    const supabase = getSupabase();

    // Get collection IDs this recipe belongs to
    const { data: links, error } = await supabase
      .from("collection_recipes")
      .select("collection_id")
      .eq("recipe_id", recipeId);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    const collectionIds = (links || []).map(l => l.collection_id);

    if (collectionIds.length === 0) {
      return NextResponse.json({ collections: [] });
    }

    const { data: collections } = await supabase
      .from("collections")
      .select("*")
      .in("id", collectionIds)
      .eq("user_id", userId);

    return NextResponse.json({ collections: collections || [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
