"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  ChefHat,
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  Check,
  RotateCcw,
  Bell,
  Leaf,
  AlertTriangle,
  Users,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import ThemeToggle from "@/app/components/theme-toggle";
import { useTheme } from "@/app/components/theme-provider";
import { usePreferences } from "@/app/components/preferences-context";

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Keto",
  "Paleo",
  "Gluten-Free",
  "Dairy-Free",
  "Low-Carb",
  "Whole30",
  "Mediterranean",
  "Halal",
  "Kosher",
];

const ALLERGEN_OPTIONS = [
  "Peanuts",
  "Tree Nuts",
  "Milk",
  "Eggs",
  "Wheat",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { preferences, updatePreferences, resetPreferences } = usePreferences();
  const [saved, setSaved] = useState(false);

  const toggleDietary = (item: string) => {
    const current = preferences.dietaryPreferences;
    const next = current.includes(item)
      ? current.filter((d) => d !== item)
      : [...current, item];
    updatePreferences({ dietaryPreferences: next });
  };

  const toggleAllergen = (item: string) => {
    const current = preferences.allergens;
    const next = current.includes(item)
      ? current.filter((a) => a !== item)
      : [...current, item];
    updatePreferences({ allergens: next });
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 max-w-4xl mx-auto">
        <Link href="/recipes" className="flex items-center gap-2">
          <ChefHat className="w-8 h-8 text-orange-500" />
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">Reel Recipes</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <section className="px-6 py-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/recipes"
            className="text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 animate-pulse">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
        </div>

        <div className="space-y-8">
          {/* Appearance */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-orange-500" />
              Appearance
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: Monitor },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setTheme(value);
                    showSaved();
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    theme === value
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${theme === value ? "text-orange-500" : "text-gray-400 dark:text-gray-500"}`} />
                  <span className={`text-sm font-medium ${theme === value ? "text-orange-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-400"}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Cooking Defaults */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              Cooking Defaults
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Servings
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (preferences.defaultServings > 1) {
                        updatePreferences({ defaultServings: preferences.defaultServings - 1 });
                        showSaved();
                      }
                    }}
                    className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 w-12 text-center">
                    {preferences.defaultServings}
                  </span>
                  <button
                    onClick={() => {
                      updatePreferences({ defaultServings: preferences.defaultServings + 1 });
                      showSaved();
                    }}
                    className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">servings</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Measurement System
                </label>
                <div className="flex gap-3">
                  {(["metric", "imperial"] as const).map((system) => (
                    <button
                      key={system}
                      onClick={() => {
                        updatePreferences({ measurementSystem: system });
                        showSaved();
                      }}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        preferences.measurementSystem === system
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      {system === "metric" ? "Metric (g, ml)" : "Imperial (oz, cups)"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipe List View
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      updatePreferences({ compactView: false });
                      showSaved();
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      !preferences.compactView
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" /> Cards
                  </button>
                  <button
                    onClick={() => {
                      updatePreferences({ compactView: true });
                      showSaved();
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      preferences.compactView
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <LayoutList className="w-4 h-4" /> Compact
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Dietary Preferences */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-orange-500" />
              Dietary Preferences
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Selected diets will be highlighted when matching recipes are found.
            </p>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((diet) => {
                const selected = preferences.dietaryPreferences.includes(diet);
                return (
                  <button
                    key={diet}
                    onClick={() => {
                      toggleDietary(diet);
                      showSaved();
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selected
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {selected && <span className="mr-1">✓</span>}
                    {diet}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Allergens */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Allergen Alerts
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Get warnings when a recipe may contain these allergens.
            </p>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((allergen) => {
                const selected = preferences.allergens.includes(allergen);
                return (
                  <button
                    key={allergen}
                    onClick={() => {
                      toggleAllergen(allergen);
                      showSaved();
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selected
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {selected && <span className="mr-1">⚠</span>}
                    {allergen}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Meal Reminders */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Meal Reminders
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Daily meal reminder
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get reminded to plan or cook your meals
                  </p>
                </div>
                <button
                  onClick={() => {
                    updatePreferences({ mealReminders: !preferences.mealReminders });
                    showSaved();
                  }}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    preferences.mealReminders ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      preferences.mealReminders ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
              {preferences.mealReminders && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reminder Time
                  </label>
                  <input
                    type="time"
                    value={preferences.reminderTime}
                    onChange={(e) => {
                      updatePreferences({ reminderTime: e.target.value });
                      showSaved();
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 outline-none"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Reset */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                resetPreferences();
                showSaved();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
