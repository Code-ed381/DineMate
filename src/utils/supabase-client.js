import { createClient } from "@supabase/supabase-js";

const Client = (supabase_url, supabase_anon_key) => createClient(
    supabase_url,
    supabase_anon_key
);

export default Client;