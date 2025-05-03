import { supabase } from "@/integrations/supabase/client";

/**
 * Handler for creating admin accounts
 * This is used as a direct client-side function when the API route fails
 */
export async function createAdminAccountHandler(
  email: string,
  password: string,
  name: string
) {
  try {
    // Clean inputs by removing any spaces
    const cleanEmail = email ? email.trim().replace(/\s/g, '') : '';
    const cleanPassword = password ? password.trim().replace(/\s/g, '') : '';
    const cleanName = name ? name.trim() : 'Admin';

    if (!cleanEmail || !cleanPassword) {
      throw new Error("Email and password are required");
    }

    // Call the Edge Function directly
    const { data, error } = await supabase.functions.invoke('create-admin-account', {
      body: JSON.stringify({
        email: cleanEmail,
        password: cleanPassword,
        name: cleanName,
      }),
    });

    if (error) {
      console.error("Error invoking Edge Function:", error);
      throw error;
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Error in createAdminAccountHandler:", error);
    return { 
      success: false, 
      error: error.message || "Unknown error occurred" 
    };
  }
}
