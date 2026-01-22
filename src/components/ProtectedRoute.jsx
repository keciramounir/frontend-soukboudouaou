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
    // In mock mode, check if admin mode is enabled
    if (isMockEnabled) {
      const adminMode = localStorage.getItem("mock_admin_mode") === "1";
      if (!adminMode && currentUser?.email === "imad@soukboudouaou.com") {
        // Suggest enabling admin mode
        return (
          <div className="max-w-4xl mx-auto p-8">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-2">Admin Mode Required</h2>
              <p className="mb-4">To access the admin panel, enable admin mode:</p>
              <button
                onClick={() => {
                  localStorage.setItem("mock_admin_mode", "1");
                  window.location.reload();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Enable Admin Mode
              </button>
            </div>
          </div>
        );
      }
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
