import Client from "../utils/supabase-client";

const PROJECT_URI = "https://bvgukcijhcmsfhzywros.supabase.co";
const PROJECT_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Z3VrY2lqaGNtc2Zoenl3cm9zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0MTU0OSwiZXhwIjoyMDcwOTE3NTQ5fQ.vSHXuAHIGogOnmCzhoICsqpc_eaDpKdIxiv0uA9Nvz8";

export const supabaseAdmin = Client(PROJECT_URI, PROJECT_ANON);