
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a test admin user in Supabase if it doesn't exist.
 * This is for development purposes only.
 */
export async function createTestAdmin() {
  try {
    // تأكد من عدم وجود مسافات في البريد الإلكتروني وكلمة المرور
    const adminEmail = "karim-it@outlook.sa".trim();
    const adminPassword = "|l0v3N@fes".trim();

    // حاول إنشاء مستخدم جديد للتجربة
    const testEmail = "admin@example.com".trim();
    const testPassword = "Admin123!".trim();

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
    } else {
      console.log("Creating admin user...");

      // Create the admin user
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
        console.error("Error creating admin user:", error);
      } else {
        console.log("Admin user created successfully:", userData);
      }
    }

    // Now create the test user
    const { data: testSignInData, error: testSignInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    // If sign in is successful, the test user already exists
    if (testSignInData.user) {
      console.log("Test user already exists and credentials are valid");
      // Sign out after checking
      await supabase.auth.signOut();
    } else {
      console.log("Creating test user...");

      // Create the test user
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
        console.error("Error creating test user:", testUserError);
      } else {
        console.log("Test user created successfully:", testUserData);
      }
    }
    
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
