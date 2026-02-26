import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/collections - List user's collections with recipe counts
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabase();

    // Fetch collections
    const { data: collections, error } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
    }

    // Fetch recipe counts per collection
    const { data: counts, error: countError } = await supabase
      .from("collection_recipes")
      .select("collection_id")
      .in("collection_id", (collections || []).map(c => c.id));

    if (countError) {
      console.error("Count error:", countError);
    }

    const countMap = new Map<string, number>();
    (counts || []).forEach(cr => {
      countMap.set(cr.collection_id, (countMap.get(cr.collection_id) || 0) + 1);
    });

    const enriched = (collections || []).map(c => ({
      ...c,
      recipe_count: countMap.get(c.id) || 0,
    }));

    return NextResponse.json({ collections: enriched });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

// POST /api/collections - Create a new collection
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, emoji } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from("collections")
      .insert({
        user_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
        emoji: emoji || "📁",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
    }

    return NextResponse.json({ collection: { ...data, recipe_count: 0 } });
  } catch (error) {
    console.error("Create error:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
