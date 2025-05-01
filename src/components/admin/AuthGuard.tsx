
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminState } from "@/types/station";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [authState, setAuthState] = useState<AdminState | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Clear any console before fetching new data
        console.clear();
        console.log("Checking authentication status...");
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          throw error;
        }

        console.log("Auth session check result:", data);
        
        if (!data.session) {
          console.log("No session found, user is not authenticated");
          setAuthState({
            isAuthenticated: false,
            user: null,
          });
          setLoading(false);
          return;
        }
        
        // Verify the user has an admin profile
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        if (adminError) {
          console.error("Error fetching admin user:", adminError);
        }
        
        console.log("Admin user data:", adminData);
        
        setAuthState({
          isAuthenticated: !!data.session && !!adminData,
          user: data.session?.user || null,
        });
      } catch (error) {
        console.error("Error checking authentication:", error);
        setAuthState({
          isAuthenticated: false,
          user: null,
        });
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session);
        
        if (event === 'SIGNED_IN') {
          // Check if the user has an admin profile when they sign in
          const checkAdminUser = async () => {
            if (!session?.user?.id) return;
            
            const { data: adminData, error: adminError } = await supabase
              .from('admin_users')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (adminError) {
              console.error("Error fetching admin user:", adminError);
            }
            
            setAuthState({
              isAuthenticated: !!session && !!adminData,
              user: session?.user || null,
            });
          };
          
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(checkAdminUser, 0);
        } else {
          setAuthState({
            isAuthenticated: !!session,
            user: session?.user || null,
          });
        }
        
        setLoading(false);
      }
    );

    checkAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-noor-purple"></div>
      </div>
    );
  }

  if (!authState?.isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    // Save the current path to return to after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  console.log("User is authenticated, rendering protected content");
  return <>{children}</>;
};

export default AuthGuard;
