"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { ChefHat, Sparkles, BookOpen, Clock, Loader2 } from "lucide-react";
import ThemeToggle from "@/app/components/theme-toggle";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setStatus("Extracting video from Instagram...");

    try {
      // Step 1: Extract video
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!extractRes.ok) {
        const err = await extractRes.json();
        throw new Error(err.error || "Failed to extract video");
      }

      const { videoUrl } = await extractRes.json();
      setStatus("Transcribing audio with Whisper...");

      // Step 2: Transcribe video
      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });

      if (!transcribeRes.ok) {
        const err = await transcribeRes.json();
        throw new Error(err.error || "Failed to transcribe audio");
      }

      const { transcript } = await transcribeRes.json();
      setStatus("Parsing recipe with AI...");

      // Step 3: Parse recipe
      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, sourceUrl: url }),
      });

      if (!parseRes.ok) {
        const err = await parseRes.json();
        throw new Error(err.error || "Failed to parse recipe");
      }

      const { recipe } = await parseRes.json();
      setStatus("Saving to your recipe book...");

      // Step 4: Save recipe
      const saveRes = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe, sourceUrl: url, videoUrl }),
      });

      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(err.error || "Failed to save recipe");
      }

      const { id } = await saveRes.json();
      router.push(`/recipes/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <ChefHat className="w-8 h-8 text-orange-500" />
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">Reel Recipes</span>
        </div>
        <div className="flex items-center gap-2">
          {isLoaded && isSignedIn ? (
            <>
              <button
                onClick={() => router.push("/recipes")}
                className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors px-2"
              >
                My Recipes
              </button>
              <ThemeToggle />
              <UserButton afterSignOutUrl="/" />
            </>
          ) : isLoaded ? (
            <>
              <ThemeToggle />
              <SignInButton mode="modal">
                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </>
          ) : (
            <ThemeToggle />
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Turn Food Videos into{" "}
          <span className="gradient-text">Recipes</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Paste any Instagram or TikTok food video URL and we&apos;ll extract the recipe using AI.
          Build your personal cookbook from viral cooking videos.
        </p>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Instagram or TikTok URL..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 outline-none text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !url.trim() || (!isLoaded || !isSignedIn)}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Extract Recipe
                </>
              )}
            </button>
          </div>
          
          {!isSignedIn && isLoaded && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Sign in to start saving recipes
            </p>
          )}
          
          {status && loading && (
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-3 animate-pulse">
              {status}
            </p>
          )}
          
          {error && (
            <p className="text-sm text-red-500 mt-3">
              {error}
            </p>
          )}
        </form>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              AI-Powered Extraction
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our AI transcribes the video and extracts ingredients, steps, and cooking times automatically.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Personal Recipe Book
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              All your saved recipes in one place. Browse, search, and cook from your collection anytime.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Cook Time & Servings
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Know how long it takes and how many it serves before you start cooking.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Built with 🍳 using Next.js, Whisper, and Claude</p>
      </footer>
    </main>
  );
}
