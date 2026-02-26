import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import RecipeDetailPage from "./recipe-detail";

function getPublicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const { data: recipe } = await getPublicSupabase()
      .from("recipes")
      .select("title, description, tags")
      .eq("id", id)
      .single();

    if (!recipe) {
      return { title: "Recipe Not Found - Reel Recipes" };
    }

    const title = recipe.title;
    const description =
      recipe.description ||
      `Check out this recipe on Reel Recipes${recipe.tags?.length ? ` — ${recipe.tags.join(", ")}` : ""}`;

    return {
      title: `${title} - Reel Recipes`,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        images: [
          {
            url: `/api/og/${id}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`/api/og/${id}`],
      },
    };
  } catch {
    return {
      title: "Reel Recipes",
      description: "Save recipes from Instagram Reels",
    };
  }
}

export default function Page() {
  return <RecipeDetailPage />;
}
