-- Add tags column to recipes table
-- Run this migration in your Supabase SQL Editor

ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create GIN index for fast tag queries
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING GIN(tags);
