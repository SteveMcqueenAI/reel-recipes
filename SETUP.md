# Reel Recipes Setup

## Deployed on Vercel ✅

**Production URL:** https://reel-recipes-tau.vercel.app

## Environment Variables (All Set) ✅

- `ANTHROPIC_API_KEY` - Recipe parsing with Claude
- `APIFY_API_TOKEN` - Instagram video extraction
- `GOOGLE_AI_API_KEY` - Video transcription with Gemini
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk auth
- `CLERK_SECRET_KEY` - Clerk auth
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `SUPABASE_ANON_KEY` - Supabase access

## Required: Create Recipes Table in Supabase ⚠️

The app shares the Supabase project with Creator OS. You need to create the `recipes` table.

### Option 1: Via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/rvnwtsfckgpotkomhkjt/sql
2. Paste and run the contents of `supabase-schema.sql`

### Option 2: Via SQL Editor

Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] DEFAULT '{}',
  steps TEXT[] DEFAULT '{}',
  prep_time TEXT,
  cook_time TEXT,
  servings INTEGER,
  source_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own recipes" ON recipes
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert own recipes" ON recipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update own recipes" ON recipes
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Users can delete own recipes" ON recipes
  FOR DELETE USING (true);
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **Auth:** Clerk (shared with Creator OS)
- **AI:** Google Gemini (transcription) + Claude (parsing)
- **Video Extraction:** Apify Instagram Downloader
