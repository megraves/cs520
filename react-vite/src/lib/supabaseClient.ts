import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

console.log("SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseKey);