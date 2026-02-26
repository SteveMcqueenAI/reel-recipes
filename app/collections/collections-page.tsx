"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  ChefHat,
  FolderPlus,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import ThemeToggle from "@/app/components/theme-toggle";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  recipe_count: number;
  created_at: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📁");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/collections");
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections || []);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), emoji: newEmoji }),
      });
      if (res.ok) {
        const { collection } = await res.json();
        setCollections([collection, ...collections]);
        setNewName("");
        setNewEmoji("📁");
      }
    } catch (error) {
      console.error("Create error:", error);
    } finally {
      setCreating(false);
    }
  };

  const updateCollection = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        setCollections(cols =>
          cols.map(c => (c.id === id ? { ...c, name: editName.trim() } : c))
        );
        setEditingId(null);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const deleteCollection = async (id: string) => {
    if (!confirm("Delete this collection? Recipes won't be deleted.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCollections(cols => cols.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const emojiOptions = ["📁", "🍳", "🥗", "🍰", "🍝", "🔥", "⭐", "🎉", "💪", "🌮", "🍕", "🥘"];

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <ChefHat className="w-8 h-8 text-orange-500" />
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">Reel Recipes</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <section className="px-6 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Collections</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Organize your recipes into groups</p>
          </div>
          <Link
            href="/recipes"
            className="text-orange-500 hover:text-orange-600 font-medium text-sm"
          >
            ← Back to Recipes
          </Link>
        </div>

        {/* Create new */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Create New Collection
          </h2>
          <div className="flex gap-2">
            <div className="relative group">
              <button className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {newEmoji}
              </button>
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                {emojiOptions.map((e) => (
                  <button
                    key={e}
                    onClick={() => setNewEmoji(e)}
                    className="w-8 h-8 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-lg"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createCollection()}
              placeholder='e.g., "Weeknight Dinners"'
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 outline-none"
            />
            <button
              onClick={createCollection}
              disabled={!newName.trim() || creating}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span className="hidden sm:inline">Create</span>
            </button>
          </div>
        </div>

        {/* Collections grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <FolderPlus className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              No collections yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Create your first collection to organize recipes
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((col) => (
              <div
                key={col.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group relative"
              >
                {editingId === col.id ? (
                  <div className="p-5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && updateCollection(col.id)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:border-orange-500 outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => updateCollection(col.id)}
                        className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href={`/collections/${col.id}`}>
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{col.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {col.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {col.recipe_count} recipe{col.recipe_count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Actions */}
                {editingId !== col.id && (
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingId(col.id);
                        setEditName(col.name);
                      }}
                      className="p-1.5 rounded-lg bg-white/80 dark:bg-gray-700/80 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 backdrop-blur-sm"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        deleteCollection(col.id);
                      }}
                      disabled={deletingId === col.id}
                      className="p-1.5 rounded-lg bg-white/80 dark:bg-gray-700/80 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 backdrop-blur-sm"
                    >
                      {deletingId === col.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
