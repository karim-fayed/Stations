
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
    
    // Clean inputs by removing any spaces
    const cleanEmail = email ? email.trim().replace(/\s/g, '') : '';
    const cleanPassword = password ? password.trim().replace(/\s/g, '') : '';
    const cleanName = name ? name.trim() : 'Admin';
    
    if (!cleanEmail || !cleanPassword) {
      throw new Error("Email and password are required");
    }

    console.log(`Attempting to create admin user with email: ${cleanEmail}`);

    // Check if user already exists
    const { data: existingUsers, error: searchError } = await supabaseClient.auth.admin.listUsers();
    
    if (searchError) {
      throw new Error(`Error searching for existing users: ${searchError.message}`);
    }
    
    let userData = null;
    const existingUser = existingUsers?.users?.find(u => u.email === cleanEmail);
    
    if (existingUser) {
      console.log("User already exists, updating password");
      // Update password for existing user
      const { data, error: updateError } = await supabaseClient.auth.admin.updateUserById(
        existingUser.id,
        { password: cleanPassword }
      );
      
      if (updateError) {
        throw updateError;
      }
      
      userData = { user: existingUser };
    } else {
      // Create the admin user
      const { data, error: createError } = await supabaseClient.auth.admin.createUser({
        email: cleanEmail,
        password: cleanPassword,
        email_confirm: true // Auto-confirm the email
      });

      if (createError) {
        throw createError;
      }
      
      userData = data;
    }

    // If user was created or updated successfully, add them to the admin_users table
    if (userData?.user) {
      console.log(`Adding/updating user ${userData.user.id} to admin_users table`);
      
      // Check if already exists in admin_users table
      const { data: existingAdmin } = await supabaseClient
        .from('admin_users')
        .select('*')
        .eq('id', userData.user.id)
        .single();
      
      if (!existingAdmin) {
        const { error: insertError } = await supabaseClient
          .from('admin_users')
          .insert({
            id: userData.user.id,
            email: userData.user.email,
            name: cleanName,
            role: "admin",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          throw insertError;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin user created/updated successfully",
        user: userData?.user
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating admin user:", error);
    
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
