import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabase();

    // Get all user recipes
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("id, title, cook_count, created_at, last_cooked_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total recipes
    const totalRecipes = recipes?.length || 0;

    // Added this week
    const addedThisWeek = recipes?.filter(
      (r) => new Date(r.created_at) >= weekAgo
    ).length || 0;

    // Most cooked (top 5)
    const mostCooked = (recipes || [])
      .filter((r) => r.cook_count && r.cook_count > 0)
      .sort((a, b) => (b.cook_count || 0) - (a.cook_count || 0))
      .slice(0, 5)
      .map((r) => ({ id: r.id, title: r.title, cookCount: r.cook_count }));

    // Cooking streak: consecutive days with a cook event (from today backward)
    const cookedDates = new Set(
      (recipes || [])
        .filter((r) => r.last_cooked_at)
        .map((r) => new Date(r.last_cooked_at!).toISOString().slice(0, 10))
    );

    let streak = 0;
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    // Check today first, if not cooked today check yesterday as start
    if (!cookedDates.has(day.toISOString().slice(0, 10))) {
      day.setDate(day.getDate() - 1);
    }
    while (cookedDates.has(day.toISOString().slice(0, 10))) {
      streak++;
      day.setDate(day.getDate() - 1);
    }

    // Total cooks
    const totalCooks = (recipes || []).reduce(
      (sum, r) => sum + (r.cook_count || 0),
      0
    );

    return NextResponse.json({
      totalRecipes,
      addedThisWeek,
      mostCooked,
      cookingStreak: streak,
      totalCooks,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
