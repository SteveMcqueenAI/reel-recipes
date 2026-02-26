/**
 * Maps recipe category tags to emoji for visual variety on recipe cards.
 */
const TAG_EMOJI_MAP: Record<string, string> = {
  // Meal types
  breakfast: "🥞",
  brunch: "🧇",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍿",
  dessert: "🍰",
  appetizer: "🥟",
  "side dish": "🥦",

  // Cuisines
  italian: "🇮🇹",
  mexican: "🌮",
  japanese: "🍱",
  chinese: "🥡",
  indian: "🍛",
  thai: "🍜",
  korean: "🇰🇷",
  french: "🇫🇷",
  mediterranean: "🫒",
  american: "🍔",
  greek: "🫓",
  "middle eastern": "🧆",

  // Food types
  pasta: "🍝",
  pizza: "🍕",
  soup: "🍲",
  salad: "🥗",
  sandwich: "🥪",
  burger: "🍔",
  steak: "🥩",
  chicken: "🍗",
  seafood: "🦐",
  fish: "🐟",
  sushi: "🍣",
  rice: "🍚",
  noodles: "🍜",
  bread: "🍞",
  cake: "🎂",
  cookies: "🍪",
  smoothie: "🥤",
  cocktail: "🍹",
  drink: "🥤",
  bbq: "🔥",
  grill: "🔥",
  curry: "🍛",
  stew: "🍲",
  tacos: "🌮",
  wrap: "🌯",

  // Dietary
  vegan: "🌱",
  vegetarian: "🥬",
  "gluten-free": "🌾",
  healthy: "💚",
  "low-carb": "🥑",
  keto: "🥑",
  "high-protein": "💪",

  // Attributes
  "quick meals": "⚡",
  "quick & easy": "⚡",
  easy: "✨",
  "comfort food": "🫶",
  "meal prep": "📦",
  "one-pot": "🫕",
  spicy: "🌶️",
  sweet: "🍬",
  baking: "🧁",
};

/**
 * Returns an emoji for the first matching tag, or a default cooking emoji.
 */
export function getRecipeEmoji(tags: string[]): string {
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    if (TAG_EMOJI_MAP[lower]) return TAG_EMOJI_MAP[lower];
    // Partial match
    for (const [key, emoji] of Object.entries(TAG_EMOJI_MAP)) {
      if (lower.includes(key) || key.includes(lower)) return emoji;
    }
  }
  return "🍳";
}
