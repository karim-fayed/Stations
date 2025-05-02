
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthState from "@/hooks/useAuthState";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { authState, loading } = useAuthState();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
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
