"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { ChefHat, Sparkles, Loader2, Globe, FolderOpen, Calendar, ShoppingCart, Scale, Star } from "lucide-react";
import ThemeToggle from "@/app/components/theme-toggle";
import RecentlyViewed from "@/app/components/recently-viewed";
import CookingStats from "@/app/components/cooking-stats";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const isVideoUrl = (u: string) => {
    return u.includes("instagram.com") || u.includes("tiktok.com");
  };

  const isRecipeUrl = (u: string) => {
    return !isVideoUrl(u) && u.startsWith("http");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");

    try {
      if (isVideoUrl(url)) {
        // Video flow: extract → transcribe → parse → save
        setStatus("Extracting video...");
        const extractRes = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!extractRes.ok) {
          const err = await extractRes.json();
          throw new Error(err.error || "Failed to extract video");
        }

        const { videoUrl: extractedVideoUrl } = await extractRes.json();
        setStatus("Transcribing audio with Whisper...");

        const transcribeRes = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl: extractedVideoUrl }),
        });

        if (!transcribeRes.ok) {
          const err = await transcribeRes.json();
          throw new Error(err.error || "Failed to transcribe audio");
        }

        const { transcript } = await transcribeRes.json();
        setStatus("Parsing recipe with AI...");

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

        const saveRes = await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipe, sourceUrl: url, videoUrl: extractedVideoUrl }),
        });

        if (!saveRes.ok) {
          const err = await saveRes.json();
          throw new Error(err.error || "Failed to save recipe");
        }

        const { id } = await saveRes.json();
        router.push(`/recipes/${id}`);
      } else if (isRecipeUrl(url)) {
        // Recipe URL flow: import → save
        setStatus("Importing recipe from website...");

        const importRes = await fetch("/api/import-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!importRes.ok) {
          const err = await importRes.json();
          throw new Error(err.error || "Failed to import recipe");
        }

        const { recipe } = await importRes.json();
        setStatus("Saving to your recipe book...");

        const saveRes = await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipe, sourceUrl: url }),
        });

        if (!saveRes.ok) {
          const err = await saveRes.json();
          throw new Error(err.error || "Failed to save recipe");
        }

        const { id } = await saveRes.json();
        router.push(`/recipes/${id}`);
      } else {
        throw new Error("Please enter a valid URL");
      }
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
          Paste any recipe URL or food video link and we&apos;ll extract the recipe using AI.
          Import from AllRecipes, BBC Good Food, Instagram, TikTok, and thousands more.
        </p>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste any recipe URL (AllRecipes, BBC Good Food, Instagram, TikTok...)"
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

      {/* Recently Viewed */}
      {isSignedIn && <RecentlyViewed />}

      {/* Cooking Stats */}
      {isSignedIn && <CookingStats />}

      {/* How It Works */}
      <section className="px-6 py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Paste a Link</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Drop any recipe URL — food blogs, AllRecipes, Instagram reels, TikTok videos, or any recipe site.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">AI Extracts It</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI reads the page or transcribes the video, then pulls out ingredients, steps, cook times, and tags.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Cook & Organize</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Scale servings, plan meals, generate shopping lists, rate recipes, and build your personal cookbook.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">
            Everything You Need to Cook
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Import From Anywhere
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Recipe sites, food blogs, Instagram reels, TikTok videos — paste the URL and we handle the rest.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Scale className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Scale Recipes
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Adjust servings up or down. Ingredients recalculate automatically — no mental math needed.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Meal Planner
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Drag and drop recipes into a weekly calendar. Plan breakfast, lunch, dinner, and snacks.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Shopping List
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Select recipes and generate a consolidated ingredient list. Smart grouping, check items off as you shop.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Collections
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Organize recipes into custom folders. Weeknight dinners, holiday baking, meal prep — your way.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Rate & Track
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Rate recipes, count how many times you&apos;ve cooked them, and add personal notes for next time.
              </p>
            </div>
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
