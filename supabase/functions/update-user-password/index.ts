
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  console.log("Handling request to update-user-password function");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("Request body parsed successfully");
    } catch (e) {
      console.error("Error parsing request body:", e);
      throw new Error("Invalid request body");
    }
    
    const { userId, password, requesterId } = body;

    // Clean inputs by removing any spaces
    const cleanUserId = userId ? userId.trim() : '';
    const cleanPassword = password ? password.trim() : '';
    const cleanRequesterId = requesterId ? requesterId.trim() : '';

    console.log("Processing request for userId:", cleanUserId);
    console.log("Request made by requesterId:", cleanRequesterId);

    if (!cleanUserId || !cleanPassword) {
      throw new Error("User ID and password are required");
    }

    if (!cleanRequesterId) {
      throw new Error("Requester ID is required");
    }

    // Check if the requester is an owner or the same user
    const { data: requesterData, error: requesterError } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('id', cleanRequesterId)
      .single();

    if (requesterError) {
      console.error("Error fetching requester:", requesterError);
      throw new Error(`Error fetching requester: ${requesterError.message}`);
    }

    if (!requesterData) {
      console.error("Requester not found");
      throw new Error("Requester not found");
    }

    console.log("Requester role:", requesterData.role);

    // Only owners can change passwords for other users
    // Users can change their own passwords
    if (requesterData.role !== 'owner' && cleanRequesterId !== cleanUserId) {
      console.error("Permission denied: only owners can change passwords for other users");
      throw new Error("Only owners can change passwords for other users");
    }

    // Update the user's password
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      cleanUserId,
      { password: cleanPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      throw updateError;
    }

    console.log("Password updated successfully");

    // Update the admin_users table to track that password was changed
    try {
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
    } catch (e) {
      console.error("Error updating admin_users table:", e);
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
