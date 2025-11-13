// lib/supabase.js or utils/supabase-client.js

import { createClient } from "@supabase/supabase-js";

const PROJECT_URI = "https://bvgukcijhcmsfhzywros.supabase.co";
const PROJECT_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Z3VrY2lqaGNtc2Zoenl3cm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNDE1NDksImV4cCI6MjA3MDkxNzU0OX0.EP068h4rdMhq_EgMrLbN50VXN6K_TEAQTfdiLJNNj70";

export const supabase = createClient(PROJECT_URI, PROJECT_ANON, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
