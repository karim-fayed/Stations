
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const { email, password, name } = await req.json();
    
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Create the admin user
    const { data: userData, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm the email
    });

    if (createError) {
      throw createError;
    }

    // If user was created successfully, add them to the admin_users table
    if (userData.user) {
      const { error: insertError } = await supabaseClient
        .from('admin_users')
        .insert({
          id: userData.user.id,
          email: userData.user.email,
          name: name || "Admin",
          role: "admin",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin user created successfully",
        user: userData.user
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack || "No additional details"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
