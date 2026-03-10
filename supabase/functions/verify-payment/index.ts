import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { reference, planId, billingCycle, restaurantId, userId } = await req.json();

    if (!reference || !planId || !billingCycle || !restaurantId || !userId) {
      throw new Error("Missing required parameters");
    }

    // 🛡️ SECURITY: Verify the user token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const supabaseAuthClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("PROJECT_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized: Invalid token");
    }

    if (user.id !== userId) {
      throw new Error("Unauthorized: User ID mismatch");
    }

    // 🛡️ SECURITY: Verify the user is an owner/admin of the restaurant
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from("restaurant_members")
      .select("role")
      .eq("restaurant_id", restaurantId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Unauthorized: You do not have permission to upgrade this restaurant");
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    });

    const result = await response.json();

    if (!result.status || result.data.status !== "success") {
      throw new Error("Payment verification failed");
    }

    // You could also verify if the amount paid matches the plan here
    // const amountPaid = result.data.amount / 100;

    // Assuming payment is verified, update or insert the subscription
    const { data: existingSub, error: fetchError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let updateData = {
      user_id: userId,
      restaurant_id: restaurantId,
      subscription_plan: planId,
      billing_cycle: billingCycle,
      price: result.data.amount / 100, // Paystack amount is in kobo/cents
      paystack_reference: reference,
      status: "active",
      starts_at: new Date().toISOString(),
    };

    let dbResponse;
    if (existingSub) {
      dbResponse = await supabaseAdmin
        .from("subscriptions")
        .update(updateData)
        .eq("restaurant_id", restaurantId)
        .select()
        .single();
    } else {
      dbResponse = await supabaseAdmin
        .from("subscriptions")
        .insert(updateData)
        .select()
        .single();
    }

    if (dbResponse.error) throw dbResponse.error;

    // 🆕 Log the subscription payment in the ledger
    const { error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        payment_type: "subscription",
        restaurant_id: restaurantId,
        cashier_id: userId, // The owner/admin who paid
        amount: updateData.price,
        method: result.data.channel === "card" ? "card" : "momo",
        status: "completed",
        reference: reference,
        subscription_id: dbResponse.data.id // Now correctly linking the subscription
      });

    if (paymentError) {
      console.error("Failed to log subscription payment:", paymentError);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Payment verified successfully", subscription: dbResponse.data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Verification error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
