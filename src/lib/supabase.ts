// lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

export const PROJECT_URI = import.meta.env.VITE_SUPABASE_URL;
export const PROJECT_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!PROJECT_URI || !PROJECT_ANON) {
  console.error("Missing Supabase environment variables. Please check your .env file.");
}

export const supabase = createClient(PROJECT_URI || "", PROJECT_ANON || "", {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
