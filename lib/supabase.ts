import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface RecipeRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  cook_time: string | null;
  prep_time: string | null;
  servings: number | null;
  source_url: string;
  video_url: string | null;
  created_at: string;
}
