
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
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          throw error;
        }

        console.log("Auth session check result:", data);
        
        setAuthState({
          isAuthenticated: !!data.session,
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
        setAuthState({
          isAuthenticated: !!session,
          user: session?.user || null,
        });
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
