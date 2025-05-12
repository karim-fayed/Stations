// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// @ts-ignore
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // قراءة بيانات المستخدم من body الطلب
    const body = await req.json();
    const { email, password, role, name } = body;
    if (!email || !password || !role) {
      throw new Error("يجب توفير البريد الإلكتروني وكلمة المرور والدور");
    }

    // التحقق من عدم وجود المستخدم مسبقًا
    const { data: existingUsers, error: searchError } = await supabaseClient.auth.admin.listUsers();
    if (searchError) {
      throw new Error(`Error searching for existing users: ${searchError.message}`);
    }
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    if (existingUser) {
      // إضافة للسجل الإداري إذا لم يكن موجودًا
      const { data: adminData } = await supabaseClient
        .from('admin_users')
        .select('*')
        .eq('id', existingUser.id)
        .single();
      if (!adminData) {
        const { error: insertError } = await supabaseClient
          .from('admin_users')
          .insert({
            id: existingUser.id,
            email: existingUser.email,
            name: name || "Admin User",
            role,
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
          message: "User already exists and is now in admin_users table",
          user: existingUser
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // إنشاء المستخدم الجديد
    const { data: userData, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (createError) {
      throw createError;
    }
    if (userData.user) {
      const { error: insertError } = await supabaseClient
        .from('admin_users')
        .insert({
          id: userData.user.id,
          email: userData.user.email,
          name: name || "Admin User",
          role,
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
