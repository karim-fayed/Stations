import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // جلب المستخدمين من جدول admin_users
    const { data: adminUsers, error: adminError } = await supabaseClient
      .from('admin_users')
      .select('*');
    if (adminError) throw adminError;

    // جلب جميع المستخدمين من auth
    const { data: authList, error: authError } = await supabaseClient.auth.admin.listUsers();
    if (authError) throw authError;

    // دمج بيانات last_sign_in_at من auth مع admin_users
    const usersWithAuth = (adminUsers || []).map((user) => {
      const authUser = authList?.users?.find((u) => u.id === user.id);
      return {
        ...user,
        last_sign_in_at: authUser?.last_sign_in_at || null,
        email: authUser?.email || user.email,
      };
    });

    return new Response(
      JSON.stringify({ success: true, users: usersWithAuth }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}); 