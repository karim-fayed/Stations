
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Get request body
    const { email, password, name } = await req.json();
    
    // Remove any spaces in the inputs
    const cleanEmail = email ? email.replace(/\s/g, '') : '';
    const cleanPassword = password ? password.replace(/\s/g, '') : '';
    const cleanName = name ? name.trim() : 'Admin';

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing Supabase environment variables" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log(`Creating admin user with email: ${cleanEmail}`);
    
    // Try to get the user first
    const { data: existingUsers, error: getUserError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    
    let user;
    
    if (getUserError) {
      console.error("Error getting users:", getUserError);
    } else if (existingUsers) {
      user = existingUsers.users.find(u => u.email === cleanEmail);
    }
    
    // If user doesn't exist, create one
    if (!user) {
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: cleanPassword,
        email_confirm: true,
        user_metadata: { name: cleanName, role: "admin" }
      });
      
      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: createError.message 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" }, 
            status: 500 
          }
        );
      }
      
      user = userData.user;
      console.log("User created successfully");
    } else {
      console.log("User already exists");
      
      // Update the existing user's password if needed
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: cleanPassword }
      );
      
      if (updateError) {
        console.error("Error updating user password:", updateError);
      } else {
        console.log("User password updated successfully");
      }
    }
    
    // Now ensure the user exists in the admin_users table
    if (user) {
      const { data: existingAdminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!existingAdminUser) {
        const { error: insertError } = await supabase
          .from('admin_users')
          .upsert({
            id: user.id,
            email: cleanEmail,
            name: cleanName,
            role: "admin",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error("Error inserting admin user:", insertError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: insertError.message,
              note: "User was created but failed to add to admin_users table"
            }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" }, 
              status: 500 
            }
          );
        }
        
        console.log("Admin user added to admin_users table");
      } else {
        console.log("User already exists in admin_users table");
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { 
            id: user.id,
            email: cleanEmail,
            name: cleanName
          } 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 200 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to create or find user" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unexpected error occurred" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
