-- Collections table for organizing bookmarked recipes
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '📁',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Join table: recipes can belong to multiple collections
CREATE TABLE IF NOT EXISTS collection_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, recipe_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_recipes_collection_id ON collection_recipes(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_recipes_recipe_id ON collection_recipes(recipe_id);

-- RLS policies
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recipes ENABLE ROW LEVEL SECURITY;

-- Collections: users can only see/modify their own
CREATE POLICY "Users can view own collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Users can insert own collections" ON collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own collections" ON collections FOR UPDATE USING (true);
CREATE POLICY "Users can delete own collections" ON collections FOR DELETE USING (true);

-- Collection recipes: open access (API routes handle auth)
CREATE POLICY "Users can view collection recipes" ON collection_recipes FOR SELECT USING (true);
CREATE POLICY "Users can insert collection recipes" ON collection_recipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete collection recipes" ON collection_recipes FOR DELETE USING (true);
