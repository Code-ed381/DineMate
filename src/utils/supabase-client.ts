import { createClient, SupabaseClient } from "@supabase/supabase-js";

const Client = (supabase_url: string, supabase_anon_key: string): SupabaseClient => createClient(
    supabase_url,
    supabase_anon_key
);

export default Client;
