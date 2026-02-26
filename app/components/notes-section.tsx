"use client";

import { useState, useRef, useEffect } from "react";
import { StickyNote, Check, Loader2, Pencil } from "lucide-react";

interface NotesSectionProps {
  recipeId: string;
  initialNotes: string;
  onSave?: (notes: string) => void;
}

export default function NotesSection({ recipeId, initialNotes, onSave }: NotesSectionProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [editing]);

  const saveNotes = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (res.ok) {
        onSave?.(notes);
        setEditing(false);
      }
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!editing && !notes) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors print:hidden"
      >
        <StickyNote className="w-4 h-4" />
        Add cooking notes...
      </button>
    );
  }

  if (!editing) {
    return (
      <div className="group">
        <div className="flex items-center gap-2 mb-1">
          <StickyNote className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</span>
          <button
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 print:hidden"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap pl-6">
          {notes}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <StickyNote className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</span>
      </div>
      <div className="pl-6">
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your cooking notes, substitutions, tips..."
          className="w-full p-3 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg outline-none focus:border-orange-500 resize-y min-h-[80px]"
          rows={3}
        />
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={saveNotes}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save
          </button>
          <button
            onClick={() => {
              setNotes(initialNotes);
              setEditing(false);
            }}
            className="px-3 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
