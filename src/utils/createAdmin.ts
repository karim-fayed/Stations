
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a test admin user in Supabase if it doesn't exist.
 * This is for development purposes only.
 */
export async function createTestAdmin() {
  try {
    // Make sure there's no whitespace in email and password
    const adminEmail = "karim-it@outlook.sa";
    const adminPassword = "|l0v3N@fes";

    // Test credentials
    const testEmail = "admin@example.com";
    const testPassword = "Admin123!";

    console.log("Attempting to create or verify admin users");

    // Create the first admin user
    try {
      const { data: userData, error } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            name: "Admin",
            role: "admin"
          },
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          console.log("Admin user already exists:", adminEmail);
        } else {
          console.error("Error creating admin user:", error);
        }
      } else {
        console.log("Admin user created successfully:", userData);
      }
    } catch (error) {
      console.error("Error in admin user creation:", error);
    }

    // Create the test user - используя проверенные тестовые данные
    try {
      const { data: testUserData, error: testUserError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: "Test Admin",
            role: "admin"
          },
        }
      });

      if (testUserError) {
        if (testUserError.message.includes("User already registered")) {
          console.log("Test user already exists:", testEmail);
        } else {
          console.error("Error creating test user:", testUserError);
        }
      } else {
        console.log("Test user created successfully:", testUserData);
      }
    } catch (error) {
      console.error("Error in test user creation:", error);
    }
    
    // Sign out after creating/checking users
    await supabase.auth.signOut();
    
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
