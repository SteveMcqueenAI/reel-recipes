import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

interface ParsedRecipe {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  prep_time: string | null;
  cook_time: string | null;
  servings: number | null;
  tags: string[];
}

/**
 * Extract JSON-LD Recipe structured data from HTML
 */
function extractJsonLdRecipe(html: string): Record<string, unknown> | null {
  const scriptRegex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);

      // Handle @graph arrays
      if (data["@graph"] && Array.isArray(data["@graph"])) {
        for (const item of data["@graph"]) {
          if (item["@type"] === "Recipe" || (Array.isArray(item["@type"]) && item["@type"].includes("Recipe"))) {
            return item;
          }
        }
      }

      // Direct Recipe type
      if (data["@type"] === "Recipe" || (Array.isArray(data["@type"]) && data["@type"].includes("Recipe"))) {
        return data;
      }

      // Array of objects
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item["@type"] === "Recipe" || (Array.isArray(item["@type"]) && item["@type"].includes("Recipe"))) {
            return item;
          }
        }
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  return null;
}

/**
 * Parse ISO 8601 duration (PT30M, PT1H15M, etc.) to human-readable string
 */
function parseDuration(duration: string | undefined | null): string | null {
  if (!duration || typeof duration !== "string") return null;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration; // Return as-is if not ISO format

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes} mins`;
  return null;
}

/**
 * Normalize ingredients from schema.org format
 */
function normalizeIngredients(ingredients: unknown): string[] {
  if (!ingredients) return [];
  if (Array.isArray(ingredients)) {
    return ingredients.map((i) => (typeof i === "string" ? i.trim() : String(i)).replace(/<[^>]*>/g, ""));
  }
  return [];
}

/**
 * Normalize instructions from schema.org format (can be strings, HowToStep, HowToSection)
 */
function normalizeInstructions(instructions: unknown): string[] {
  if (!instructions) return [];

  if (typeof instructions === "string") {
    return instructions.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  }

  if (Array.isArray(instructions)) {
    const steps: string[] = [];
    for (const item of instructions) {
      if (typeof item === "string") {
        steps.push(item.trim().replace(/<[^>]*>/g, ""));
      } else if (item.text) {
        steps.push(String(item.text).trim().replace(/<[^>]*>/g, ""));
      } else if (item["@type"] === "HowToSection" && Array.isArray(item.itemListElement)) {
        for (const subItem of item.itemListElement) {
          if (typeof subItem === "string") {
            steps.push(subItem.trim().replace(/<[^>]*>/g, ""));
          } else if (subItem.text) {
            steps.push(String(subItem.text).trim().replace(/<[^>]*>/g, ""));
          }
        }
      }
    }
    return steps.filter(Boolean);
  }

  return [];
}

/**
 * Convert JSON-LD Recipe to our format
 */
function jsonLdToRecipe(data: Record<string, unknown>): ParsedRecipe {
  const yieldValue = data.recipeYield;
  let servings: number | null = null;
  if (typeof yieldValue === "number") {
    servings = yieldValue;
  } else if (typeof yieldValue === "string") {
    const num = parseInt(yieldValue);
    if (!isNaN(num)) servings = num;
  } else if (Array.isArray(yieldValue) && yieldValue.length > 0) {
    const num = parseInt(String(yieldValue[0]));
    if (!isNaN(num)) servings = num;
  }

  // Extract tags from recipeCategory, recipeCuisine, keywords
  const tags: string[] = [];
  for (const field of ["recipeCategory", "recipeCuisine"]) {
    const val = data[field];
    if (typeof val === "string") tags.push(val);
    else if (Array.isArray(val)) tags.push(...val.map(String));
  }
  if (data.keywords) {
    const kw = data.keywords;
    if (typeof kw === "string") {
      tags.push(...kw.split(",").map((s: string) => s.trim()).filter(Boolean).slice(0, 5));
    } else if (Array.isArray(kw)) {
      tags.push(...kw.map(String).slice(0, 5));
    }
  }

  return {
    title: String(data.name || "Untitled Recipe"),
    description: String(data.description || "").replace(/<[^>]*>/g, "").trim(),
    ingredients: normalizeIngredients(data.recipeIngredient),
    steps: normalizeInstructions(data.recipeInstructions),
    prep_time: parseDuration(data.prepTime as string),
    cook_time: parseDuration(data.cookTime as string) || parseDuration(data.totalTime as string),
    servings,
    tags: Array.from(new Set(tags)).slice(0, 5),
  };
}

/**
 * Strip HTML to plain text for AI fallback
 */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000); // Limit for AI context
}

/**
 * Use AI to extract recipe from raw page text as fallback
 */
async function aiParseRecipe(pageText: string, url: string): Promise<ParsedRecipe> {
  const anthropic = getAnthropic();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Extract the recipe from this webpage content. URL: ${url}

Page content:
"""
${pageText}
"""

Return ONLY valid JSON:
{
  "title": "Name of the dish",
  "description": "Brief description (1-2 sentences)",
  "ingredients": ["ingredient with quantity", ...],
  "steps": ["step 1", "step 2", ...],
  "prep_time": "time or null",
  "cook_time": "time or null",
  "servings": number or null,
  "tags": ["2-5 category tags"]
}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response");

  let recipe;
  try {
    recipe = JSON.parse(content.text);
  } catch {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) recipe = JSON.parse(jsonMatch[0]);
    else throw new Error("Failed to parse AI response");
  }

  return {
    title: recipe.title || "Untitled Recipe",
    description: recipe.description || "",
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    steps: Array.isArray(recipe.steps) ? recipe.steps : [],
    prep_time: recipe.prep_time || null,
    cook_time: recipe.cook_time || null,
    servings: typeof recipe.servings === "number" ? recipe.servings : null,
    tags: Array.isArray(recipe.tags) ? recipe.tags : [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ReelRecipes/1.0)",
        Accept: "text/html",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL (${response.status})` },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Try JSON-LD first (fast, reliable)
    const jsonLd = extractJsonLdRecipe(html);
    let recipe: ParsedRecipe;
    let method: string;

    if (jsonLd) {
      recipe = jsonLdToRecipe(jsonLd);
      method = "structured-data";

      // Validate we got meaningful data
      if (recipe.ingredients.length === 0 && recipe.steps.length === 0) {
        // JSON-LD was empty, fall back to AI
        const pageText = htmlToText(html);
        recipe = await aiParseRecipe(pageText, url);
        method = "ai-fallback";
      }
    } else {
      // No structured data, use AI
      const pageText = htmlToText(html);
      recipe = await aiParseRecipe(pageText, url);
      method = "ai-parsed";
    }

    return NextResponse.json({ recipe, method });
  } catch (error) {
    console.error("Import URL error:", error);
    return NextResponse.json(
      { error: "Failed to import recipe from URL" },
      { status: 500 }
    );
  }
}
