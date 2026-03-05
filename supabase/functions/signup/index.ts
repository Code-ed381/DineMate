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
    const { personalInfo, restaurantInfo, subscription, files } = await req.json();

    /** Helper function to upload base64 file using admin client */
    async function uploadBase64ToStorage(base64Str: string, bucket: string, originalName: string) {
      // Extract content type and base64 data
      const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) throw new Error('Invalid base64 string');
      
      const contentType = matches[1];
      const base64Data = matches[2];

      // Decode base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const filename = `${Date.now()}_${originalName.replace(/\s+/g, "_")}`;
      const filePath = `uploads/${filename}`;
      
      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, bytes.buffer, { 
          contentType,
          cacheControl: "3600", 
          upsert: true 
        });

      if (error) throw error;
      const { data: { publicUrl } } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
      return publicUrl;
    }

    // 1. Handle File Uploads (bypass RLS)
    if (files.avatar) {
        personalInfo.profileAvatar = await uploadBase64ToStorage(files.avatar, "avatars", "avatar.png");
    }

    if (files.idDocument) {
        personalInfo.idDocumentUrl = await uploadBase64ToStorage(files.idDocument, "documents", "id_document.png");
    }

    if (files.logo) {
        restaurantInfo.logo = await uploadBase64ToStorage(files.logo, "avatars", "logo.png");
    }

    if (files.businessCertificate) {
        restaurantInfo.business_certificate_url = await uploadBase64ToStorage(files.businessCertificate, "documents", "certificate.png");
    }

    // ✅ Create user
    const { data: { user }, error: signUpError } =
      await supabaseAdmin.auth.admin.createUser({
        email: personalInfo.email,
        password: personalInfo.password,
        email_confirm: false,
        user_metadata: {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          phone: personalInfo.phone_number,
          profileAvatar: personalInfo.profileAvatar,
          idDocumentUrl: personalInfo.idDocumentUrl, // Ensure this is stored
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
    let initialReference = subscription.paystack_reference;
    if (subscription.subscription_plan !== "free" && !initialReference) {
      initialReference = `pending_${Date.now()}`;
    }

    const { data: subscriptionData, error: subscriptionError } =
      await supabaseAdmin.from("subscriptions")
        .insert({
          restaurant_id: restaurant.id,
          user_id: user.id,
          subscription_plan: subscription.subscription_plan,
          billing_cycle: subscription.billing_cycle,
          price: subscription.price,
          paystack_reference: initialReference,
          status: subscription.subscription_plan === "free" ? "active" : "pending",
          starts_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (subscriptionError) throw subscriptionError;

    // ✅ Insert default settings based on plan limits
    const limits = subscription.limits || {};
    const defaultSettings = [
      {
        restaurant_id: restaurant.id,
        key: 'general',
        value: {
          show_date_and_time_on_navbar: true,
          allow_notifications: true,
          allow_complaints: !!limits.canUseComplaints,
          show_breadcrumb: true,
          show_light_night_toggle: !!limits.canToggleTheme,
          currency_symbol: "GH₵",
          currency_code: "GHS",
          timezone: "UTC",
          date_format: "DD/MM/YYYY"
        }
      },
      {
        restaurant_id: restaurant.id,
        key: 'table_settings',
        value: {
          show_floor_plan: !!limits.canUseFloorPlan,
          enable_table_transfer: !!limits.canUseTableTransfer,
          show_session_timer: true,
          default_view_mode: limits.canUseFloorPlan ? "floor" : "grid"
        }
      },
      {
        restaurant_id: restaurant.id,
        key: 'report_settings',
        value: {
          enable_sales_reports: !!limits.canUseReports,
          allow_csv_export: !!limits.canUseCsvExport,
          enable_audit_logs: !!limits.canUseAuditLogs,
          enable_xz_reports: !!limits.canUseAdvancedReports
        }
      },
      {
        restaurant_id: restaurant.id,
        key: 'bar_settings',
        value: {
          enable_dine_in: true,
          enable_takeaway: !!limits.canUseBarModule,
          show_dashboard_kpis: !!limits.canUseBarModule
        }
      },
      {
        restaurant_id: restaurant.id,
        key: 'menu_settings',
        value: {
          show_item_images: true,
          allow_split_bill: !!limits.canUseSplitBill,
          enable_tips: true,
          allow_order_notes: true
        }
      }
    ];

    const { error: settingsError } = await supabaseAdmin
      .from("restaurant_settings")
      .insert(defaultSettings);

    if (settingsError) {
      console.error("Failed to insert default settings:", settingsError);
      // We don't throw here to avoid failing the whole signup for settings
    }

    return new Response(
      JSON.stringify({ 
        message: "Signup successful", 
        user: { id: user.id, email: user.email }, 
        restaurant: { id: restaurant.id }, 
        subscriptionData 
      }),
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
