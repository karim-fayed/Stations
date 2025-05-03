
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminState } from "@/types/station";
import { Session } from "@supabase/supabase-js";

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AdminState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session);
        
        if (event === 'SIGNED_IN') {
          // Check if user is admin
          if (session?.user?.id) {
            // Use setTimeout to avoid Supabase deadlock
            setTimeout(async () => {
              try {
                const { data: adminData, error: adminError } = await supabase
                  .from('admin_users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                  
                if (adminError) {
                  console.error("Error fetching admin user:", adminError);
                  setAuthState({ isAuthenticated: false, user: null });
                } else {
                  console.log("Admin user found:", adminData);
                  setAuthState({
                    isAuthenticated: true,
                    user: session.user,
                  });
                }
              } catch (error) {
                console.error("Error checking admin status:", error);
                setAuthState({ isAuthenticated: false, user: null });
              }
              setLoading(false);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          setAuthState({ isAuthenticated: false, user: null });
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          setAuthState({ isAuthenticated: false, user: null });
          setLoading(false);
          return;
        }

        console.log("Auth session result:", data);
        
        if (!data.session) {
          console.log("No session found, user is not authenticated");
          setAuthState({ isAuthenticated: false, user: null });
          setLoading(false);
          return;
        }
        
        // Verify the user has admin privileges
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        if (adminError) {
          console.error("Error fetching admin user:", adminError);
          setAuthState({ isAuthenticated: false, user: null });
        } else {
          console.log("Admin user data:", adminData);
          setAuthState({
            isAuthenticated: true,
            user: data.session.user,
          });
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setAuthState({ isAuthenticated: false, user: null });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { authState, loading };
};

export default useAuthState;
