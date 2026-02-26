const STORAGE_KEY = "reel-recipes-recently-viewed";
const MAX_ITEMS = 12;

export interface RecentlyViewedItem {
  id: string;
  title: string;
  description?: string;
  cook_time?: string;
  tags?: string[];
  viewedAt: number;
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">) {
  if (typeof window === "undefined") return;
  try {
    const items = getRecentlyViewed().filter((i) => i.id !== item.id);
    items.unshift({ ...item, viewedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // localStorage full or unavailable
  }
}
