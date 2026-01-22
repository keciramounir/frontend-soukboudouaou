// src/components/ProtectedRoute.jsx
import React, { useEffect, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, user } = useAuth();
  const location = useLocation();
  
  // Get user from localStorage if not in context
  const storedUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [user]);
  
  const storedToken = localStorage.getItem("token");
  const currentUser = user || storedUser;
  const currentToken = token || storedToken;
  
  // Check authentication - allow if user exists or token exists
  const isAuth = !!currentUser || !!currentToken;

  // For admin routes, check if user has admin role
  const isAdminRoute = location.pathname.startsWith("/admin");
  const userRole = currentUser?.role || null;
  const isAdmin = userRole === "ADMIN" || userRole === "super_admin";

  // In mock mode, allow access if user exists (even without token)
  // Mock is enabled by default in dev mode unless explicitly disabled
  const isMockEnabled = localStorage.getItem("use_mock") === "1" || 
                        import.meta.env.VITE_USE_MOCK === "1" ||
                        (import.meta.env.DEV && localStorage.getItem("use_mock") !== "0");
  
  // In mock mode, if user exists in localStorage, allow access
  // Otherwise, require both user and token
  const canAccess = isMockEnabled ? !!currentUser : isAuth;

  if (!canAccess) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // For admin routes, ensure user is admin
  if (isAdminRoute && !isAdmin) {
    // In mock mode, if it's the default user, automatically enable admin mode
    if (isMockEnabled && currentUser?.email === "imad@soukboudouaou.com") {
      try {
        localStorage.setItem("mock_admin_mode", "1");
        // Update user role in context and localStorage
        const updatedUser = { ...currentUser, role: "super_admin" };
        try {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (error) {
          console.error("Failed to update user:", error);
        }
        // Reload to apply changes
        window.location.reload();
        return null; // Prevent rendering during reload
      } catch (error) {
        console.error("Failed to enable admin mode:", error);
      }
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
