import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";

const supabaseAdmin = createClient(
  Deno.env.get("PROJECT_URL") ?? "",
  Deno.env.get("SERVICE_ROLE_KEY") ?? ""
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
