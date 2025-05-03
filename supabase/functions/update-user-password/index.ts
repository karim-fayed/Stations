import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const { userId, password, requesterId } = await req.json();

    // Clean inputs by removing any spaces
    const cleanUserId = userId ? userId.trim() : '';
    const cleanPassword = password ? password.trim() : '';
    const cleanRequesterId = requesterId ? requesterId.trim() : '';

    if (!cleanUserId || !cleanPassword) {
      throw new Error("User ID and password are required");
    }

    if (!cleanRequesterId) {
      throw new Error("Requester ID is required");
    }

    // Check if the requester is an owner
    const { data: requesterData, error: requesterError } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('id', cleanRequesterId)
      .single();

    if (requesterError) {
      throw new Error(`Error fetching requester: ${requesterError.message}`);
    }

    if (!requesterData) {
      throw new Error("Requester not found");
    }

    // Only owners can change passwords for other users
    // Users can change their own passwords
    if (requesterData.role !== 'owner' && cleanRequesterId !== cleanUserId) {
      throw new Error("Only owners can change passwords for other users");
    }

    // Update the user's password
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      cleanUserId,
      { password: cleanPassword }
    );

    if (updateError) {
      throw updateError;
    }

    // Update the admin_users table to track that password was changed
    const { error: updateUserError } = await supabaseClient
      .from('admin_users')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', cleanUserId);

    if (updateUserError) {
      console.error("Error updating user record:", updateUserError);
      // We don't throw here as the password was already updated
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Password updated successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating password:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
