import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    // Verify token & user
    const supabaseAuthClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized: Invalid token");
    }

    const body = await req.json();
    const { action, restaurantId, targetUserId, email, metadata, userId } = body;

    // ── Self-activation: employees activating their own membership ──
    // This runs BEFORE the owner/admin check since the caller is the employee
    if (action === "activate-member") {
      if (!userId) throw new Error("userId is required for activate-member.");

      // SECURITY: Only allow users to activate their OWN membership
      if (userId !== user.id) {
        throw new Error("Unauthorized: You can only activate your own membership.");
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from("restaurant_members")
        .update({ status: "active" })
        .eq("user_id", userId)
        .eq("status", "pending")
        .select();

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, data: updated }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!action || !restaurantId) {
        throw new Error("Missing required parameters: action or restaurantId");
    }

    // SECURITY: Verify the caller is an owner/admin of the restaurant
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from("restaurant_members")
      .select("role")
      .eq("restaurant_id", restaurantId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Unauthorized: You do not have permission to perform admin actions for this restaurant.");
    }

    let resultData = null;

    if (action === "invite-user") {
        if (!email) throw new Error("Email is required for inviting a user.");
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: metadata || {}
        });
        if (error) throw error;
        resultData = data;
    } 
    else if (action === "update-user") {
        if (!targetUserId) throw new Error("targetUserId is required for updating a user.");
        
        // SECURITY: Verify the target user being edited actually belongs to this restaurant
        const { data: targetMembership, error: targetError } = await supabaseAdmin
            .from("restaurant_members")
            .select("id")
            .eq("restaurant_id", restaurantId)
            .eq("user_id", targetUserId)
            .single();
            
        if (targetError || !targetMembership) {
            throw new Error("Target user is not a member of this restaurant.");
        }

        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
            user_metadata: metadata
        });
        if (error) throw error;
        resultData = data;
    }
    else {
        throw new Error("Invalid action.");
    }

    return new Response(
      JSON.stringify({ success: true, data: resultData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (err) {
    console.error("Admin Action Error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
