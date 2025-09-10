// functions/signup/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";

// Create an admin client (service role key is only available on server-side)
const supabaseAdmin = createClient(
  Deno.env.get("PROJECT_URL") ?? "",
  Deno.env.get("SERVICE_ROLE_KEY") ?? ""
);
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // 👈 allow all for now (simpler while debugging)
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { personalInfo, restaurantInfo, subscription } = await req.json();

    // ✅ Create user
    const { data: { user }, error: signUpError } =
      await supabaseAdmin.auth.admin.createUser({
        email: personalInfo.email,
        password: personalInfo.password,
        email_confirm: false,
        phone: personalInfo.phone_number,
        user_metadata: {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          profileAvatar: personalInfo.profileAvatar,
        },
      });

    if (signUpError) throw signUpError;

    // ✅ Insert restaurant
    const { data: restaurant, error: restaurantError } =
      await supabaseAdmin.from("restaurants")
        .insert({ ...restaurantInfo, owner_id: user.id })
        .select()
        .single();

    if (restaurantError) throw restaurantError;

    // ✅ Insert restaurant_members
    const { data: restaurantMembers, error: restaurantMembersError } =
      await supabaseAdmin.from("restaurant_members")
        .insert({ user_id: user.id, restaurant_id: restaurant.id, role: "owner", status: "active" })
        .select()
        .single();

    if (restaurantMembersError) throw restaurantMembersError;

    // ✅ Insert subscription
    const { data: subscriptionData, error: subscriptionError } =
      await supabaseAdmin.from("subscriptions")
        .insert({ ...subscription, user_id: user.id })
        .select()
        .single();

    if (subscriptionError) throw subscriptionError;

    return new Response(
      JSON.stringify({ message: "Signup successful", user, restaurant, subscriptionData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
