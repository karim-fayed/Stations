
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthState from "@/hooks/useAuthState";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface AuthGuardProps {
  children: ReactNode;
  requireOwner?: boolean;
}

const AuthGuard = ({ children, requireOwner = false }: AuthGuardProps) => {
  const { authState, loading, userRole } = useAuthState();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!authState?.isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    // Save the current path to return to after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // التحقق من صلاحيات المالك إذا كانت مطلوبة
  if (requireOwner && userRole !== 'owner') {
    console.log("User is not an owner, redirecting to dashboard");
    return <Navigate to="/admin/dashboard" replace />;
  }

  console.log("User is authenticated, rendering protected content");
  return <>{children}</>;
};

export default AuthGuard;
