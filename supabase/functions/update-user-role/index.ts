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
    const { userId, role, requesterId } = await req.json();

    // Clean inputs by removing any spaces
    const cleanUserId = userId ? userId.trim() : '';
    const cleanRole = role ? role.trim() : '';
    const cleanRequesterId = requesterId ? requesterId.trim() : '';

    if (!cleanUserId || !cleanRole) {
      throw new Error("User ID and role are required");
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

    // Only owners can change roles
    if (requesterData.role !== 'owner') {
      throw new Error("Only owners can change user roles");
    }

    // Check if the user exists
    const { data: userData, error: userError } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('id', cleanUserId)
      .single();

    if (userError) {
      throw new Error(`Error fetching user: ${userError.message}`);
    }

    if (!userData) {
      throw new Error("User not found");
    }

    // Update the user's role
    const { error: updateError } = await supabaseClient
      .from('admin_users')
      .update({
        role: cleanRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cleanUserId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User role updated successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating user role:", error);

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
