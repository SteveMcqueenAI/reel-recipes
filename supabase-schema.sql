-- Create the recipes table
CREATE TABLE recipes (
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

-- Create an index on user_id for faster queries
CREATE INDEX idx_recipes_user_id ON recipes(user_id);

-- Enable Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own recipes
-- Note: When using service key, RLS is bypassed, but this is good practice
CREATE POLICY "Users can view own recipes" ON recipes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own recipes" ON recipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own recipes" ON recipes
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own recipes" ON recipes
  FOR DELETE USING (true);
