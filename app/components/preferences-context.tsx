"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface UserPreferences {
  // Dietary
  dietaryPreferences: string[];
  allergens: string[];
  // Cooking
  defaultServings: number;
  measurementSystem: "metric" | "imperial";
  // Notifications
  mealReminders: boolean;
  reminderTime: string; // HH:mm
  // Display
  compactView: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  dietaryPreferences: [],
  allergens: [],
  defaultServings: 4,
  measurementSystem: "metric",
  mealReminders: false,
  reminderTime: "18:00",
  compactView: false,
};

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const STORAGE_KEY = "reel-recipes-preferences";

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
      }
    } catch {}
  }, []);

  const updatePreferences = useCallback((partial: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  if (!mounted) return null;

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, resetPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
