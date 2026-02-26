# Reel Recipes 🍳

Turn food videos and recipe URLs into your personal recipe book. Paste a link from Instagram, TikTok, AllRecipes, BBC Good Food, or any recipe site — get a beautifully formatted recipe you can cook from.

**Live:** https://reel-recipes-tau.vercel.app

## Features

### Core
- 📹 **Video extraction** — Instagram reels & TikTok videos
- 🌐 **URL import** — AllRecipes, BBC Good Food, and thousands of recipe sites
- 🎤 **AI transcription** — Audio → text via Google Gemini
- 🤖 **AI parsing** — Claude extracts structured recipes from any content
- 📚 **Personal recipe book** — Authenticated, cloud-synced collection

### Organization
- 📂 **Collections** — Group recipes into custom folders with emoji icons
- 🏷️ **Auto-tags** — AI-generated category tags (Pasta, Dessert, Quick Meals…)
- 🔖 **Tag filtering** — Browse by category with tag pills
- 🔍 **Search** — Full-text search across titles, descriptions, and tags
- ↕️ **Sorting** — Newest, oldest, highest rated, most cooked, A→Z
- ❤️ **Favorites** — Bookmark your best recipes

### Cooking
- ⚖️ **Recipe scaling** — Adjust servings, ingredients recalculate automatically
- 📅 **Meal planner** — Drag & drop recipes into a weekly calendar (breakfast/lunch/dinner/snack)
- 🛒 **Shopping list** — Select recipes, generate a consolidated ingredient list with smart grouping
- 🔥 **Cook counter** — Track how many times you've made each recipe
- ⭐ **Ratings** — Rate your recipes 1–5 stars
- 📝 **Notes** — Add personal cooking notes to any recipe

### Polish
- ✏️ **Edit recipes** — Fix or customize anything after import
- 🖨️ **Print view** — Clean print-friendly layout
- 🔗 **Sharing** — Share to X, Facebook, WhatsApp, Telegram, or native share on mobile
- 🖼️ **OG images** — Dynamic social preview cards with recipe emoji
- 📱 **PWA** — Install as an app on mobile, works offline
- 🌙 **Dark mode** — Light/Dark/System theme with toggle
- 🎨 **Emoji cards** — Recipe cards with contextual food emoji
- 📤 **Data export** — Download all recipes as JSON

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Clerk |
| AI | Google Gemini (transcription) + Claude (recipe parsing) |
| Video | Apify (Instagram + TikTok scrapers) |
| Hosting | Vercel |

## Prerequisites

- Node.js 18+
- Accounts: Supabase, Clerk, Anthropic, Apify

## Setup

1. **Clone and install:**
```bash
cd ~/projects/reel-recipes
npm install
```

2. **Database:**
   - Create a project at [supabase.com](https://supabase.com)
   - Run `supabase-schema.sql` in the SQL editor
   - Run migrations in `migrations/` in order

3. **Auth:**
   - Create an app at [clerk.com](https://clerk.com)

4. **Environment:**
```bash
# Create .env.local with:
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
APIFY_API_TOKEN=apify_api_...
```

5. **Run:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── page.tsx                          # Landing page + URL input
├── home-page.tsx                     # Landing page component
├── layout.tsx                        # Root layout (Clerk, theme, PWA)
├── recipes/
│   ├── page.tsx                      # Recipe book grid
│   ├── recipes-page.tsx              # Grid with search/sort/filter
│   └── [id]/
│       ├── page.tsx                  # Recipe detail (SSR + OG meta)
│       └── recipe-detail.tsx         # Detail view with scaling/edit/notes
├── collections/
│   ├── page.tsx                      # Collections list
│   ├── collections-page.tsx          # CRUD collections
│   └── [id]/
│       ├── page.tsx                  # Collection detail
│       └── collection-detail.tsx     # Recipes in collection
├── meal-planner/
│   ├── page.tsx                      # Weekly meal planner
│   ├── meal-planner-page.tsx         # Drag & drop calendar
│   ├── draggable-recipe-card.tsx     # DnD recipe card
│   ├── droppable-slot.tsx            # DnD meal slot
│   └── recipe-sidebar.tsx            # Recipe picker sidebar
├── shopping-list/
│   ├── page.tsx                      # Shopping list generator
│   └── shopping-list-page.tsx        # Select recipes → ingredient list
├── components/
│   ├── add-to-collection-modal.tsx   # Add recipe to collection
│   ├── cook-counter.tsx              # Cook count tracker
│   ├── favorite-button.tsx           # Heart toggle
│   ├── notes-section.tsx             # Personal notes editor
│   ├── share-menu.tsx                # Social sharing dropdown
│   ├── star-rating.tsx               # 1-5 star rating
│   ├── sw-register.tsx               # Service worker registration
│   ├── theme-provider.tsx            # Dark mode context
│   └── theme-toggle.tsx              # Light/Dark/System switcher
├── sign-in/                          # Clerk sign-in
├── sign-up/                          # Clerk sign-up
└── api/
    ├── extract/                      # Video extraction (Apify)
    ├── transcribe/                   # Audio transcription (Gemini)
    ├── parse/                        # Recipe parsing (Claude)
    ├── save/                         # Save recipe to DB
    ├── import-url/                   # Import from recipe URL
    ├── export/                       # Export all recipes as JSON
    ├── og/[id]/                      # Dynamic OG image generation
    ├── recipes/                      # CRUD recipes
    ├── collections/                  # CRUD collections
    └── meal-plans/                   # Meal planner data
lib/
├── supabase.ts                       # Supabase client
├── ingredients.ts                    # Ingredient parsing, scaling, shopping list
└── tag-emoji.ts                      # Tag → emoji mapping
```

## License

MIT
