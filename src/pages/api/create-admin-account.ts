
import { supabase } from "@/integrations/supabase/client";

export async function POST(req: Request) {
  try {
    // Extract data from request body
    const { email, password, name } = await req.json();

    // Clean inputs by removing any spaces
    const cleanEmail = email ? email.trim().replace(/\s/g, '') : '';
    const cleanPassword = password ? password.trim().replace(/\s/g, '') : '';
    const cleanName = name ? name.trim() : 'Admin';

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('create-admin-account', {
      body: JSON.stringify({
        email: cleanEmail,
        password: cleanPassword,
        name: cleanName,
      }),
    });

    if (error) {
      console.error("Error invoking Edge Function:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || "Failed to invoke Edge Function" 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in create-admin-account API route:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export const runtime = 'edge';
