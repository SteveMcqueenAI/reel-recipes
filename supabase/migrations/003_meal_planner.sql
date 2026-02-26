-- Meal planner: weekly calendar with recipes assigned to days/meals
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  position INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id, date, meal_type)
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_recipe_id ON meal_plans(recipe_id);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal plans" ON meal_plans FOR SELECT USING (true);
CREATE POLICY "Users can insert own meal plans" ON meal_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own meal plans" ON meal_plans FOR UPDATE USING (true);
CREATE POLICY "Users can delete own meal plans" ON meal_plans FOR DELETE USING (true);
