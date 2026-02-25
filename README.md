# Reel Recipes 🍳

Turn Instagram and TikTok food videos into your personal recipe book. Paste a link, get a formatted recipe.

**Live:** https://reel-recipes-tau.vercel.app

## Features

- 📹 Extract video from Instagram reels AND TikTok
- 🎤 Transcribe audio with Google Gemini
- 🤖 Parse recipes with Claude AI
- 📚 Personal recipe book with auth
- 🔍 Search your recipes
- ✏️ Edit recipes after saving
- 🖨️ Print-friendly recipe view
- 📱 Mobile-friendly design

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **Auth:** Clerk
- **AI:** Google Gemini (transcription) + Claude (parsing)
- **Video Extraction:** Apify (Instagram + TikTok scrapers)

## Prerequisites

- Node.js 18+
- yt-dlp (for video extraction)
- ffmpeg (for audio extraction)

Install system dependencies:
```bash
# macOS
brew install yt-dlp ffmpeg

# Ubuntu/Debian
sudo apt install yt-dlp ffmpeg
```

## Setup

1. Clone and install:
```bash
cd ~/projects/reel-recipes
npm install
```

2. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL in `supabase-schema.sql` in the SQL editor
   - Copy your project URL and service key

3. Set up Clerk:
   - Create a new app at [clerk.com](https://clerk.com)
   - Copy your publishable and secret keys

4. Configure environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your keys
```

Required environment variables:
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Sign in with Clerk
2. Paste an Instagram reel URL
3. Wait for extraction + transcription + parsing
4. View your saved recipe
5. Browse your recipe book

## Project Structure

```
app/
├── page.tsx                    # Landing + URL input
├── recipes/
│   ├── page.tsx               # Recipe book grid
│   └── [id]/page.tsx          # Recipe detail
├── api/
│   ├── extract/route.ts       # Video extraction (yt-dlp)
│   ├── transcribe/route.ts    # Whisper transcription
│   ├── parse/route.ts         # Claude recipe parsing
│   ├── save/route.ts          # Save to Supabase
│   └── recipes/
│       ├── route.ts           # List recipes
│       └── [id]/route.ts      # Get/delete recipe
├── sign-in/                   # Clerk sign-in
└── sign-up/                   # Clerk sign-up
```

## License

MIT
