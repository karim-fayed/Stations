
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminState } from "@/types/station";
import { Session } from "@supabase/supabase-js";
import logger from "@/utils/logger";

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AdminState | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.debug("Auth state changed:", event);

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
                  logger.error("Error fetching admin user:", adminError);
                  setAuthState({ isAuthenticated: false, user: null });
                  setUserRole(null);
                } else {
                  logger.debug("Admin user found");
                  setAuthState({
                    isAuthenticated: true,
                    user: session.user,
                  });
                  setUserRole(adminData.role || 'admin');
                }
              } catch (error) {
                logger.error("Error checking admin status:", error);
                setAuthState({ isAuthenticated: false, user: null });
              }
              setLoading(false);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          logger.debug("User signed out");
          setAuthState({ isAuthenticated: false, user: null });
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const checkAuth = async () => {
      try {
        logger.debug("Checking authentication status...");

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          logger.error("Auth error:", error);
          setAuthState({ isAuthenticated: false, user: null });
          setLoading(false);
          return;
        }

        logger.debug("Auth session result received");

        if (!data.session) {
          logger.debug("No session found, user is not authenticated");
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
          logger.error("Error fetching admin user:", adminError);
          setAuthState({ isAuthenticated: false, user: null });
          setUserRole(null);
        } else {
          logger.debug("Admin user data retrieved");
          setAuthState({
            isAuthenticated: true,
            user: data.session.user,
          });
          setUserRole(adminData.role || 'admin');
        }
      } catch (error) {
        logger.error("Error checking authentication:", error);
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

  return { authState, loading, userRole };
};

export default useAuthState;
