import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/meal-plans?startDate=2026-02-23&endDate=2026-03-01
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "startDate and endDate required" }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from("meal_plans")
      .select(`
        id,
        recipe_id,
        date,
        meal_type,
        position,
        notes,
        recipes (id, title, description, cook_time, servings, tags)
      `)
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("position", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch meal plans" }, { status: 500 });
    }

    return NextResponse.json({ mealPlans: data });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch meal plans" }, { status: 500 });
  }
}

// POST /api/meal-plans — add a recipe to a day/meal
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipe_id, date, meal_type, notes } = body;

    if (!recipe_id || !date || !meal_type) {
      return NextResponse.json({ error: "recipe_id, date, and meal_type required" }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from("meal_plans")
      .upsert(
        { user_id: userId, recipe_id, date, meal_type, notes },
        { onConflict: "user_id,recipe_id,date,meal_type" }
      )
      .select(`
        id,
        recipe_id,
        date,
        meal_type,
        position,
        notes,
        recipes (id, title, description, cook_time, servings, tags)
      `)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to add to meal plan" }, { status: 500 });
    }

    return NextResponse.json({ mealPlan: data });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json({ error: "Failed to save meal plan" }, { status: 500 });
  }
}

// DELETE /api/meal-plans?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const { error } = await getSupabase()
      .from("meal_plans")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to delete meal plan" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete meal plan" }, { status: 500 });
  }
}

// PATCH /api/meal-plans — move a meal plan entry (change date/meal_type)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, date, meal_type } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const updates: Record<string, string> = {};
    if (date) updates.date = date;
    if (meal_type) updates.meal_type = meal_type;

    const { data, error } = await getSupabase()
      .from("meal_plans")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select(`
        id,
        recipe_id,
        date,
        meal_type,
        position,
        notes,
        recipes (id, title, description, cook_time, servings, tags)
      `)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to update meal plan" }, { status: 500 });
    }

    return NextResponse.json({ mealPlan: data });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update meal plan" }, { status: 500 });
  }
}
