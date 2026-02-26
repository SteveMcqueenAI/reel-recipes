-- Add personal notes, rating, and cook count to recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS rating SMALLINT DEFAULT NULL CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cook_count INTEGER DEFAULT 0;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS last_cooked_at TIMESTAMPTZ DEFAULT NULL;
