"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Eye } from "lucide-react";
import { getRecentlyViewed, RecentlyViewedItem } from "@/lib/recently-viewed";

export default function RecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  if (items.length === 0) return null;

  const timeAgo = (ts: number) => {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <section className="px-6 py-12 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Eye className="w-5 h-5 text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Recently Viewed
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/recipes/${item.id}`}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
              {item.title}
            </h3>
            {item.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                {item.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
              {item.cook_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.cook_time}
                </span>
              )}
              <span>{timeAgo(item.viewedAt)}</span>
            </div>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
