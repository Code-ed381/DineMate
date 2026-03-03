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

    // Verify Paystack payment for paid plans before proceeding
    if (subscription.subscription_plan !== "free") {
      const reference = subscription.paystack_reference;
      if (!reference) {
        throw new Error("Missing Paystack reference for paid plan");
      }

      const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!paystackSecretKey) {
        throw new Error("Paystack secret key not configured");
      }

      const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      });

      const paystackResult = await paystackRes.json();

      if (!paystackResult.status || paystackResult.data.status !== "success") {
        throw new Error("Payment verification failed. Cannot complete signup.");
      }
    }

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
        .insert({
          restaurant_id: restaurant.id,
          subscription_plan: subscription.subscription_plan,
          billing_cycle: subscription.billing_cycle,
          status: "active",
          starts_at: new Date().toISOString(),
        })
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
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
