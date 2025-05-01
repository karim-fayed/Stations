
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a test admin user in Supabase if it doesn't exist.
 * This is for development purposes only.
 */
export async function createTestAdmin() {
  try {
    const adminEmail = "karim-it@outlook.sa";
    const adminPassword = "|l0v3N@fes";

    // Check if user exists first by using getUser instead of listUsers with filter
    const { data: existingUser, error: searchError } = await supabase.auth.admin.getUserByEmail(adminEmail);

    if (searchError) {
      console.error("Error checking for existing admin:", searchError);
      return;
    }

    // If the user already exists, don't create it again
    if (existingUser) {
      console.log("Admin user already exists");
      return;
    }

    // Create the admin user
    const { data, error } = await supabase.auth.admin.createUser({
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

    console.log("Admin user created successfully:", data);
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
