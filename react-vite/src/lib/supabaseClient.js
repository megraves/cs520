import { createClient } from "@supabase/supabase-js";


const
    supabaseUrl = import.meta.env.local.VITE_SUPABASE_URL,
    supabaseKey = import.meta.env.local.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);


