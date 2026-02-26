"use client";

import { useState, useEffect } from "react";
import { X, Plus, Loader2, FolderPlus, Check } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  emoji: string;
  recipe_count: number;
}

interface AddToCollectionModalProps {
  recipeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToCollectionModal({
  recipeId,
  isOpen,
  onClose,
}: AddToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [memberOf, setMemberOf] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📁");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, recipeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [colRes, memRes] = await Promise.all([
        fetch("/api/collections"),
        fetch(`/api/recipes/${recipeId}/collections`),
      ]);

      if (colRes.ok) {
        const { collections: cols } = await colRes.json();
        setCollections(cols || []);
      }
      if (memRes.ok) {
        const { collections: mems } = await memRes.json();
        setMemberOf(new Set((mems || []).map((c: Collection) => c.id)));
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCollection = async (collectionId: string) => {
    setToggling(collectionId);
    const isMember = memberOf.has(collectionId);

    try {
      const res = await fetch(`/api/collections/${collectionId}/recipes`, {
        method: isMember ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id: recipeId }),
      });

      if (res.ok) {
        const next = new Set(memberOf);
        if (isMember) {
          next.delete(collectionId);
          setCollections(cols =>
            cols.map(c =>
              c.id === collectionId ? { ...c, recipe_count: Math.max(0, c.recipe_count - 1) } : c
            )
          );
        } else {
          next.add(collectionId);
          setCollections(cols =>
            cols.map(c =>
              c.id === collectionId ? { ...c, recipe_count: c.recipe_count + 1 } : c
            )
          );
        }
        setMemberOf(next);
      }
    } catch (error) {
      console.error("Toggle error:", error);
    } finally {
      setToggling(null);
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
        // Auto-add recipe to the new collection
        await toggleCollection(collection.id);
      }
    } catch (error) {
      console.error("Create error:", error);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  const emojiOptions = ["📁", "🍳", "🥗", "🍰", "🍝", "🔥", "⭐", "🎉", "💪", "🌮", "🍕", "🥘"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Save to Collection
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {/* Create new collection */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex gap-2">
              {/* Emoji picker */}
              <div className="relative group">
                <button className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-lg hover:bg-gray-50 dark:hover:bg-gray-700">
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
                placeholder="New collection name..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              />
              <button
                onClick={createCollection}
                disabled={!newName.trim() || creating}
                className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Collection list */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8 px-6">
              <FolderPlus className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No collections yet. Create one above!
              </p>
            </div>
          ) : (
            <div className="py-2">
              {collections.map((collection) => {
                const isMember = memberOf.has(collection.id);
                const isLoading = toggling === collection.id;

                return (
                  <button
                    key={collection.id}
                    onClick={() => toggleCollection(collection.id)}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="text-xl">{collection.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {collection.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {collection.recipe_count} recipe{collection.recipe_count !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                        isMember
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isMember ? (
                        <Check className="w-3 h-3" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
