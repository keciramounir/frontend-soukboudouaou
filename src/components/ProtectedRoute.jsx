// src/components/ProtectedRoute.jsx
import React, { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canAccessAdminPanel, isSuperAdmin, hasPermission, ROLES } from "../utils/permissions";

const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
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
  }, []);
  
  const storedToken = localStorage.getItem("token");
  const currentUser = user || storedUser;
  const currentToken = token || storedToken;
  
  // Check authentication - allow if user exists or token exists
  const isAuth = !!currentUser || !!currentToken;

  // For admin routes, check if user has admin role
  const isAdminRoute = location.pathname.startsWith("/admin");
  const userRole = currentUser?.role || null;
  
  // Normalize role (handle case variations)
  const normalizedRole = userRole ? String(userRole).toLowerCase() : null;
  const isSuper = isSuperAdmin(normalizedRole);

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

  // Check required role
  if (requiredRole) {
    const requiredRoleLower = String(requiredRole).toLowerCase();
    if (normalizedRole !== requiredRoleLower) {
      return <Navigate to="/" replace />;
    }
  }

  // Check required permission (if permission system is used)
  if (requiredPermission && normalizedRole) {
    if (!hasPermission(normalizedRole, requiredPermission)) {
      return <Navigate to="/" replace />;
    }
  }

  // For admin routes, ensure user can access admin panel
  if (isAdminRoute && !canAccessAdminPanel(normalizedRole)) {
    // In mock mode, if it's the default user, automatically enable admin mode
    if (isMockEnabled && currentUser?.email === "imad@soukboudouaou.com") {
      try {
        localStorage.setItem("mock_admin_mode", "1");
        // Update user role in context and localStorage
        const updatedUser = { ...currentUser, role: ROLES.SUPER_ADMIN };
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

  // For super admin only routes, check specifically
  const isSuperAdminRoute = location.pathname.includes("/admin/listings") ||
                            location.pathname.includes("/admin/users") ||
                            location.pathname.includes("/admin/activity") ||
                            location.pathname.includes("/admin/moving-header") ||
                            location.pathname.includes("/admin/categories") ||
                            location.pathname.includes("/admin/filtration") ||
                            location.pathname.includes("/admin/demo") ||
                            location.pathname.includes("/admin/hero-slides") ||
                            location.pathname.includes("/admin/call-centers");
  
  if (isSuperAdminRoute && !isSuper) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
