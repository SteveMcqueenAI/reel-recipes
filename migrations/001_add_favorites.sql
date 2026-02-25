-- Add favorites column to recipes table
-- Run this migration in your Supabase SQL Editor

ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Create index for faster favorites queries
CREATE INDEX IF NOT EXISTS idx_recipes_is_favorite ON recipes(is_favorite);
