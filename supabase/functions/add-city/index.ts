// وظيفة Supabase Edge Function لإضافة مدينة جديدة
// هذه الوظيفة تستخدم مفتاح الخدمة (service role key) الذي يتجاوز سياسات أمان الصفوف

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

interface CityData {
  name_ar: string;
  name_en: string;
  latitude: number;
  longitude: number;
  zoom?: number;
}

serve(async (req) => {
  // التعامل مع طلبات CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // إنشاء عميل Supabase باستخدام مفتاح الخدمة
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // التحقق من طريقة الطلب
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // استخراج بيانات المدينة من الطلب
    const cityData: CityData = await req.json();

    // التحقق من وجود البيانات المطلوبة
    if (!cityData.name_ar || !cityData.name_en || cityData.latitude === undefined || cityData.longitude === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // التحقق من صلاحيات المستخدم
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // التحقق من أن المستخدم مشرف أو مالك
    const { data: adminData, error: adminError } = await supabaseClient
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminError || !adminData || (adminData.role !== 'admin' && adminData.role !== 'owner')) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Only admins can add cities" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // إضافة المدينة إلى قاعدة البيانات
    const { data, error } = await supabaseClient
      .from('cities')
      .insert({
        name_ar: cityData.name_ar,
        name_en: cityData.name_en,
        latitude: cityData.latitude,
        longitude: cityData.longitude,
        zoom: cityData.zoom || 10,
      })
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to add city", details: error }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // إرجاع البيانات المضافة
    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    // التعامل مع الأخطاء غير المتوقعة
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
