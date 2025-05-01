
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a test admin user in Supabase if it doesn't exist.
 * This is for development purposes only.
 */
export async function createTestAdmin() {
  try {
    const adminEmail = "karim-it@outlook.sa";
    const adminPassword = "|l0v3N@fes";

    // Check if user exists first by trying to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    // If sign in is successful, the user already exists
    if (signInData.user) {
      console.log("Admin user already exists and credentials are valid");
      // Sign out after checking
      await supabase.auth.signOut();
      return;
    }

    console.log("Creating admin user...");

    // Create the admin user
    const { data: userData, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: "Admin",
        role: "admin"
      }
    });

    if (error) {
      console.error("Error creating admin user:", error);
      return;
    }

    console.log("Admin user created successfully:", userData);
  } catch (error) {
    console.error("Error in createTestAdmin:", error);
  }
}

/**
 * This function should be called once during app initialization
 * to ensure an admin user exists
 */
export async function ensureAdminExists() {
  // Only run this in development mode
  if (process.env.NODE_ENV !== "production") {
    await createTestAdmin();
  }
}
