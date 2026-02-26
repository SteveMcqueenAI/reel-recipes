/**
 * Ingredient parsing and manipulation utilities.
 * Handles scaling amounts and combining duplicate ingredients.
 */

interface ParsedIngredient {
  quantity: number | null;
  unit: string | null;
  name: string;
  original: string;
}

// Common fraction unicode and text patterns
const FRACTION_MAP: Record<string, number> = {
  "½": 0.5,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 0.25,
  "¾": 0.75,
  "⅕": 0.2,
  "⅖": 0.4,
  "⅗": 0.6,
  "⅘": 0.8,
  "⅙": 1 / 6,
  "⅚": 5 / 6,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

const UNITS = [
  "cup",
  "cups",
  "tbsp",
  "tablespoon",
  "tablespoons",
  "tsp",
  "teaspoon",
  "teaspoons",
  "oz",
  "ounce",
  "ounces",
  "lb",
  "lbs",
  "pound",
  "pounds",
  "g",
  "gram",
  "grams",
  "kg",
  "kilogram",
  "kilograms",
  "ml",
  "milliliter",
  "milliliters",
  "l",
  "liter",
  "liters",
  "litre",
  "litres",
  "pinch",
  "pinches",
  "dash",
  "dashes",
  "clove",
  "cloves",
  "slice",
  "slices",
  "piece",
  "pieces",
  "can",
  "cans",
  "bunch",
  "bunches",
  "sprig",
  "sprigs",
  "head",
  "heads",
  "stalk",
  "stalks",
  "stick",
  "sticks",
  "handful",
  "handfuls",
  "package",
  "packages",
  "packet",
  "packets",
];

// Normalize unit to a canonical form for comparison
const UNIT_CANONICAL: Record<string, string> = {
  cup: "cup",
  cups: "cup",
  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  oz: "oz",
  ounce: "oz",
  ounces: "oz",
  lb: "lb",
  lbs: "lb",
  pound: "lb",
  pounds: "lb",
  g: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",
  l: "l",
  liter: "l",
  liters: "l",
  litre: "l",
  litres: "l",
  clove: "clove",
  cloves: "clove",
  slice: "slice",
  slices: "slice",
  piece: "piece",
  pieces: "piece",
  can: "can",
  cans: "can",
  bunch: "bunch",
  bunches: "bunch",
  sprig: "sprig",
  sprigs: "sprig",
  pinch: "pinch",
  pinches: "pinch",
  dash: "dash",
  dashes: "dash",
  head: "head",
  heads: "head",
  stalk: "stalk",
  stalks: "stalk",
  stick: "stick",
  sticks: "stick",
  handful: "handful",
  handfuls: "handful",
  package: "package",
  packages: "package",
  packet: "packet",
  packets: "packet",
};

function parseFraction(s: string): number | null {
  // Unicode fractions
  for (const [frac, val] of Object.entries(FRACTION_MAP)) {
    if (s === frac) return val;
  }

  // "1/2" style
  const slashMatch = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (slashMatch) {
    const denom = parseInt(slashMatch[2]);
    if (denom === 0) return null;
    return parseInt(slashMatch[1]) / denom;
  }

  // Plain number
  const num = parseFloat(s);
  if (!isNaN(num)) return num;

  return null;
}

export function parseIngredient(raw: string): ParsedIngredient {
  const original = raw.trim();
  let text = original;

  // Try to extract leading quantity (e.g., "2 1/2 cups flour", "½ tsp salt", "3 large eggs")
  let quantity: number | null = null;
  let unit: string | null = null;

  // Pattern: optional whole number + optional fraction/unicode, then optional unit, then name
  // Examples: "2 1/2 cups flour", "½ tsp salt", "1 cup sugar", "3 eggs", "salt to taste"
  const qtyRegex =
    /^(\d+\s+\d+\s*\/\s*\d+|\d+\s*\/\s*\d+|\d+\.?\d*\s*[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+\.?\d*)\s*/i;

  const qtyMatch = text.match(qtyRegex);
  if (qtyMatch) {
    const qtyStr = qtyMatch[1].trim();
    // "2 1/2" → whole + fraction
    const mixedMatch = qtyStr.match(/^(\d+)\s+(\d+\s*\/\s*\d+|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/);
    if (mixedMatch) {
      const whole = parseInt(mixedMatch[1]);
      const frac = parseFraction(mixedMatch[2]);
      quantity = frac !== null ? whole + frac : whole;
    } else {
      // "1.5" or "½" or "1/2" or "2½"
      const numUnicodeMatch = qtyStr.match(/^(\d+\.?\d*)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/);
      if (numUnicodeMatch) {
        quantity =
          parseFloat(numUnicodeMatch[1]) +
          (FRACTION_MAP[numUnicodeMatch[2]] || 0);
      } else {
        quantity = parseFraction(qtyStr);
      }
    }
    text = text.slice(qtyMatch[0].length);
  }

  // Try to match a unit at the start of remaining text
  const unitRegex = new RegExp(
    `^(${UNITS.join("|")})\\b\\.?\\s*(?:of\\s+)?`,
    "i"
  );
  const unitMatch = text.match(unitRegex);
  if (unitMatch) {
    unit = unitMatch[1].toLowerCase();
    text = text.slice(unitMatch[0].length);
  }

  const name = text.trim() || original;

  return { quantity, unit, name, original };
}

export function scaleIngredient(raw: string, scaleFactor: number): string {
  const parsed = parseIngredient(raw);

  if (parsed.quantity === null || scaleFactor === 1) {
    return raw;
  }

  const newQty = parsed.quantity * scaleFactor;
  const formatted = formatQuantity(newQty);

  const parts: string[] = [formatted];
  if (parsed.unit) parts.push(parsed.unit);
  parts.push(parsed.name);

  return parts.join(" ");
}

function formatQuantity(n: number): string {
  // Show nice fractions for common values
  const fractions: [number, string][] = [
    [0.125, "⅛"],
    [0.25, "¼"],
    [1 / 3, "⅓"],
    [0.375, "⅜"],
    [0.5, "½"],
    [0.625, "⅝"],
    [2 / 3, "⅔"],
    [0.75, "¾"],
    [0.875, "⅞"],
  ];

  const whole = Math.floor(n);
  const frac = n - whole;

  if (frac < 0.05) {
    return whole.toString();
  }

  // Find closest fraction
  let closest: [number, string] | null = null;
  let minDiff = Infinity;
  for (const [val, sym] of fractions) {
    const diff = Math.abs(frac - val);
    if (diff < minDiff) {
      minDiff = diff;
      closest = [val, sym];
    }
  }

  if (closest && minDiff < 0.05) {
    return whole > 0 ? `${whole} ${closest[1]}` : closest[1];
  }

  // Fall back to decimal, rounded to 1 decimal
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
}

/**
 * Normalize an ingredient name for grouping/deduplication.
 * Strips parenthetical notes, lowercases, trims.
 */
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // remove parenthetical notes
    .replace(/,.*$/, "") // remove everything after comma (e.g., "garlic, minced")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalUnit(unit: string | null): string | null {
  if (!unit) return null;
  return UNIT_CANONICAL[unit.toLowerCase()] || unit.toLowerCase();
}

export interface ShoppingItem {
  name: string;
  displayName: string;
  entries: Array<{
    quantity: number | null;
    unit: string | null;
    recipeName: string;
    original: string;
  }>;
  /** Combined display string, e.g. "2 cups" or "3 + 1/2 cup" */
  combined: string;
}

/**
 * Aggregate ingredients from multiple recipes into a shopping list.
 * Combines duplicates where possible (same name + compatible units).
 */
export function buildShoppingList(
  recipes: Array<{ title: string; ingredients: string[] }>
): ShoppingItem[] {
  const groups = new Map<string, ShoppingItem>();

  for (const recipe of recipes) {
    for (const raw of recipe.ingredients) {
      const parsed = parseIngredient(raw);
      const normName = normalizeIngredientName(parsed.name);
      const key = `${normName}|${canonicalUnit(parsed.unit) || "none"}`;

      if (!groups.has(key)) {
        groups.set(key, {
          name: normName,
          displayName: parsed.name,
          entries: [],
          combined: "",
        });
      }

      groups.get(key)!.entries.push({
        quantity: parsed.quantity,
        unit: parsed.unit,
        recipeName: recipe.title,
        original: raw,
      });
    }
  }

  // Build combined display strings
  const items: ShoppingItem[] = [];
  groups.forEach((item) => {
    const allHaveQty = item.entries.every((e) => e.quantity !== null);

    if (allHaveQty) {
      const total = item.entries.reduce((sum, e) => sum + (e.quantity || 0), 0);
      const unit = item.entries[0].unit;
      const formatted = formatQuantity(total);
      item.combined = unit
        ? `${formatted} ${unit} ${item.displayName}`
        : `${formatted} ${item.displayName}`;
    } else {
      // Can't combine — show originals
      item.combined = item.entries.map((e) => e.original).join("; ");
    }

    items.push(item);
  });

  // Sort alphabetically by name
  items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}

/**
 * Format a shopping list as plain text for export.
 */
export function shoppingListToText(
  items: ShoppingItem[],
  title?: string
): string {
  const lines: string[] = [];
  if (title) {
    lines.push(title);
    lines.push("=".repeat(title.length));
    lines.push("");
  }

  lines.push("Shopping List");
  lines.push("─".repeat(40));
  for (const item of items) {
    lines.push(`☐ ${item.combined}`);
  }

  // Add recipe sources
  const recipeNames = new Set<string>();
  for (const item of items) {
    for (const entry of item.entries) {
      recipeNames.add(entry.recipeName);
    }
  }
  if (recipeNames.size > 0) {
    lines.push("");
    lines.push("Recipes:");
    Array.from(recipeNames).forEach((name) => {
      lines.push(`  • ${name}`);
    });
  }

  return lines.join("\n");
}
