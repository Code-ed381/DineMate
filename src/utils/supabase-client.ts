import { createClient, SupabaseClient, SupabaseClientOptions } from "@supabase/supabase-js";

const Client = (
  supabase_url: string, 
  supabase_anon_key: string,
  options?: SupabaseClientOptions<"public">
): SupabaseClient => createClient(
    supabase_url,
    supabase_anon_key,
    options
);

export default Client;
