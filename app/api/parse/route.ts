import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    const prompt = `You are a recipe extraction expert. Given a transcript from a cooking video, extract the recipe information into a structured format.

Transcript:
"""
${transcript}
"""

Extract the following information and return it as valid JSON:
{
  "title": "Name of the dish",
  "description": "Brief description of the dish (1-2 sentences)",
  "ingredients": ["list", "of", "ingredients", "with", "quantities"],
  "steps": ["step 1", "step 2", "step 3"],
  "prep_time": "preparation time (e.g., '15 mins') or null",
  "cook_time": "cooking time (e.g., '30 mins') or null",
  "servings": number or null
}

Guidelines:
- Be specific with ingredient quantities when mentioned
- Break down steps into clear, actionable instructions
- If prep_time or cook_time aren't explicitly mentioned, estimate based on the steps
- If servings aren't mentioned, estimate based on ingredient quantities
- If the transcript doesn't contain a recipe, create a best-guess title and description, and return empty arrays for ingredients and steps

Return ONLY the JSON object, no markdown formatting or explanation.`;

    const response = await getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Parse the JSON response
    let recipe;
    try {
      recipe = JSON.parse(content.text);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recipe = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse recipe JSON");
      }
    }

    // Validate and set defaults
    recipe = {
      title: recipe.title || "Untitled Recipe",
      description: recipe.description || "",
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      steps: Array.isArray(recipe.steps) ? recipe.steps : [],
      prep_time: recipe.prep_time || null,
      cook_time: recipe.cook_time || null,
      servings: typeof recipe.servings === "number" ? recipe.servings : null,
    };

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse recipe from transcript" },
      { status: 500 }
    );
  }
}
