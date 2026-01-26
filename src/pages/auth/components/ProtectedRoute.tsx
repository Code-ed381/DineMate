import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../../lib/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div>Loading...</div>; // or a spinner
  }

  // if no user, send them to sign-in page
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
