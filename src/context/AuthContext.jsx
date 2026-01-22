/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";
import { safeGetItem, safeSetItem, safeRemoveItem } from "../utils/localStorage";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    // Load user from localStorage on mount
    if (!user) {
      const savedUser = safeGetItem("user");
      if (savedUser) {
        setUser(savedUser);
      }
    }
    
    // Load token from localStorage if not set
    if (!token) {
      const savedToken = localStorage.getItem("token"); // Keep as string for token
      if (savedToken) setToken(savedToken);
    }
  }, []); // Run only on mount

  const saveSession = (userData, jwt, refreshToken) => {
    setUser(userData);
    setToken(jwt);
    // Use safe functions for user data, direct for tokens (strings)
    safeSetItem("user", userData);
    try {
      localStorage.setItem("token", jwt);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  };

  // Helper to check if mock is enabled
  const isMockEnabled = () => {
    return localStorage.getItem("use_mock") === "1" || 
           import.meta.env.VITE_USE_MOCK === "1" ||
           (import.meta.env.DEV && localStorage.getItem("use_mock") !== "0");
  };

  // ===========================
  // AUTH FLOWS (EMAIL/USERNAME)
  // ===========================
  const signup = async ({ username, email, password, fullName, wilaya }) => {
    // Mock signup
    if (isMockEnabled()) {
      // Store mock users in localStorage
      const mockUsers = safeGetItem("mock_users", []);
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => 
        u.email?.toLowerCase() === email?.toLowerCase() ||
        u.username?.toLowerCase() === username?.toLowerCase()
      );
      
      if (existingUser) {
        return { 
          success: false, 
          message: "Cet email ou nom d'utilisateur est déjà utilisé" 
        };
      }
      
      // Create new mock user
      const newUser = {
        _id: `u${Date.now()}`,
        username: username,
        email: email,
        fullName: fullName || username,
        phone: "",
        wilaya: wilaya || "",
        role: "user",
        verified: false,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      // Store password hash (simple mock - in real app, never store plain passwords)
      const mockUserWithPassword = {
        ...newUser,
        password: password // Mock only - for demo purposes
      };
      
      mockUsers.push(mockUserWithPassword);
      const saved = safeSetItem("mock_users", mockUsers);
      
      if (!saved) {
        return {
          success: false,
          message: "Impossible de sauvegarder. Espace de stockage insuffisant."
        };
      }
      
      // Auto-login after signup
      const mockToken = "mock-jwt-token-" + Date.now();
      const mockRefreshToken = "mock-refresh-token-" + Date.now();
      saveSession(newUser, mockToken, mockRefreshToken);
      
      return { success: true, user: newUser };
    }
    
    try {
      const res = await api.post("/auth/signup", {
        username,
        email,
        password,
        fullName,
        wilaya,
      });

      const { user: userData, token: jwt, refreshToken } = res.data;
      saveSession(userData, jwt, refreshToken);

      return { success: true, user: userData };
    } catch (err) {
      console.error("signup error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Signup failed. Try again.";
      return { success: false, message: msg };
    }
  };

  const login = async ({ identifier, password }) => {
    // Mock login for demo
    if (isMockEnabled()) {
      // FAST LOGIN: Pre-defined users for quick access
      const fastUsers = {
        "imad@soukboudouaou.com": {
          password: "admin2025$",
          user: {
            _id: "admin-1",
            email: "imad@soukboudouaou.com",
            username: "imad",
            fullName: "Imad Soukboudouaou",
            phone: "0550 12 34 56",
            wilaya: "Algiers",
            role: "super_admin",
            verified: true,
            isActive: true,
            createdAt: "2025-10-10T09:00:00.000Z"
          }
        },
        "admin@test.com": {
          password: "admin123",
          user: {
            _id: "admin-2",
            email: "admin@test.com",
            username: "admin",
            fullName: "Admin User",
            phone: "0550 00 00 01",
            wilaya: "Algiers",
            role: "ADMIN",
            verified: true,
            isActive: true,
            createdAt: "2025-10-10T09:00:00.000Z"
          }
        },
        "user1@test.com": {
          password: "user123",
          user: {
            _id: "user-1",
            email: "user1@test.com",
            username: "user1",
            fullName: "User One",
            phone: "0550 00 00 02",
            wilaya: "Oran",
            role: "user",
            verified: true,
            isActive: true,
            createdAt: "2025-10-10T09:00:00.000Z"
          }
        },
        "user2@test.com": {
          password: "user123",
          user: {
            _id: "user-2",
            email: "user2@test.com",
            username: "user2",
            fullName: "User Two",
            phone: "0550 00 00 03",
            wilaya: "Constantine",
            role: "user",
            verified: true,
            isActive: true,
            createdAt: "2025-10-10T09:00:00.000Z"
          }
        }
      };
      
      const emailLower = identifier?.toLowerCase();
      const fastUser = fastUsers[emailLower];
      
      // Check fast login users first
      if (fastUser && password === fastUser.password) {
        try {
          if (fastUser.user.role === "super_admin") {
            localStorage.setItem("mock_admin_mode", "1");
          }
        } catch (error) {
          console.error("Failed to set admin mode:", error);
        }
        
        const mockToken = "mock-jwt-token-" + Date.now();
        const mockRefreshToken = "mock-refresh-token-" + Date.now();
        saveSession(fastUser.user, mockToken, mockRefreshToken);
        return { success: true, user: fastUser.user };
      }
      
      // Check default mock credentials (backward compatibility)
      const mockEmail = "imad@soukboudouaou.com";
      const mockPassword = "admin2025$";
      const isEmailMatch = identifier?.toLowerCase() === mockEmail.toLowerCase();
      const isPasswordMatch = password === mockPassword;
      
      if (isEmailMatch && isPasswordMatch) {
        // Automatically enable admin mode for default credentials
        try {
          localStorage.setItem("mock_admin_mode", "1");
        } catch (error) {
          console.error("Failed to set admin mode:", error);
        }
        
        // Always set as super_admin for default credentials
        const mockUser = {
          _id: "u1",
          fullName: "Imad Soukboudouaou",
          phone: "0550 12 34 56",
          email: "imad@soukboudouaou.com",
          username: "imad",
          wilaya: "Algiers",
          role: "super_admin",
          verified: true,
          isActive: true,
          createdAt: "2025-10-10T09:00:00.000Z"
        };
        
        const mockToken = "mock-jwt-token-" + Date.now();
        const mockRefreshToken = "mock-refresh-token-" + Date.now();
        
        saveSession(mockUser, mockToken, mockRefreshToken);
        return { success: true, user: mockUser };
      }
      
      // Check mock users from localStorage (for signup users)
      const mockUsers = safeGetItem("mock_users", []);
      const foundUser = mockUsers.find(u => 
        (u.email?.toLowerCase() === identifier?.toLowerCase() ||
         u.username?.toLowerCase() === identifier?.toLowerCase()) &&
        u.password === password
      );
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        const mockToken = "mock-jwt-token-" + Date.now();
        const mockRefreshToken = "mock-refresh-token-" + Date.now();
        saveSession(userWithoutPassword, mockToken, mockRefreshToken);
        return { success: true, user: userWithoutPassword };
      }
      
      return { 
        success: false, 
        message: "Email/username ou mot de passe incorrect" 
      };
    }
    
    try {
      const res = await api.post("/auth/login", { identifier, password });
      const { user: userData, token: jwt, refreshToken } = res.data;

      saveSession(userData, jwt, refreshToken);
      return { success: true, user: userData };
    } catch (err) {
      // Only log non-400 errors (400 means invalid credentials, which is expected)
      if (err?.response?.status !== 400) {
        console.error("login error:", err);
      }
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Check your credentials.";
      return { success: false, message: msg };
    }
  };

  const requestEmailVerification = async (email) => {
    try {
      const res = await api.post("/auth/verify-email/request", { email });
      return {
        success: res.data?.success !== false,
        message: res.data?.message || "Email sent.",
      };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to send verification email.";
      return { success: false, message: msg };
    }
  };

  const confirmEmailVerification = async ({ email, token }) => {
    try {
      const res = await api.post("/auth/verify-email/confirm", { email, token });
      return {
        success: res.data?.success !== false,
        message: res.data?.message || "Email verified.",
      };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Verification failed.";
      return { success: false, message: msg };
    }
  };

  const forgotPassword = async (email) => {
    // Mock forgot password
    if (isMockEnabled()) {
      const mockUsers = safeGetItem("mock_users", []);
      const foundUser = mockUsers.find(u => 
        u.email?.toLowerCase() === email?.toLowerCase()
      );
      
      // Generate mock OTP and store it (for both default and signup users)
      const mockOtp = "123456"; // Simple mock OTP for demo
      const otpSaved = safeSetItem(`mock_otp_${email}`, mockOtp);
      try {
        localStorage.setItem(`mock_otp_time_${email}`, Date.now().toString());
      } catch (error) {
        console.error("Failed to save OTP time:", error);
      }
      
      if (!otpSaved) {
        return {
          success: false,
          message: "Impossible de sauvegarder. Espace de stockage insuffisant."
        };
      }
      
      // Also check default mock user
      if (!foundUser && email?.toLowerCase() === "imad@soukboudouaou.com") {
        return {
          success: true,
          message: "Code OTP envoyé (mock: 123456)",
        };
      }
      
      if (foundUser) {
        return {
          success: true,
          message: "Code OTP envoyé (mock: 123456)",
        };
      }
      
      // Don't reveal if email exists or not (security)
      return {
        success: true,
        message: "Si un compte existe, un code OTP a été envoyé (mock: 123456)",
      };
    }
    
    try {
      const res = await api.post("/auth/forgot-password", { email });
      return {
        success: res.data?.success !== false,
        message: res.data?.message || "If an account exists, OTP was sent.",
      };
    } catch (err) {
      console.error("forgotPassword error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to send OTP. Try again.";
      return { success: false, message: msg };
    }
  };

  const verifyOtp = async (email, otp) => {
    // Mock verify OTP
    if (isMockEnabled()) {
      const storedOtp = safeGetItem(`mock_otp_${email}`);
      let otpTime;
      try {
        otpTime = localStorage.getItem(`mock_otp_time_${email}`);
      } catch (error) {
        console.error("Failed to get OTP time:", error);
      }
      
      // Check if OTP exists and is not expired (10 minutes)
      if (storedOtp && otpTime) {
        const timeDiff = Date.now() - parseInt(otpTime);
        const tenMinutes = 10 * 60 * 1000;
        
        if (timeDiff > tenMinutes) {
          return {
            success: false,
            message: "Code OTP expiré. Veuillez en demander un nouveau.",
          };
        }
        
        if (storedOtp === otp || otp === "123456") {
          // Store verification token
          safeSetItem(`mock_otp_verified_${email}`, true);
          return {
            success: true,
            message: "Code OTP vérifié avec succès.",
          };
        }
      }
      
      return {
        success: false,
        message: "Code OTP invalide. Utilisez 123456 pour le mode mock.",
      };
    }
    
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      return {
        success: res.data?.success !== false,
        message: res.data?.message || "OTP verified.",
      };
    } catch (err) {
      console.error("verifyOtp error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "OTP verification failed.";
      return { success: false, message: msg };
    }
  };

  const resetPassword = async ({ email, otp, password }) => {
    // Mock reset password
    if (isMockEnabled()) {
      const isVerified = safeGetItem(`mock_otp_verified_${email}`) === true;
      const storedOtp = safeGetItem(`mock_otp_${email}`);
      
      if (!isVerified && storedOtp !== otp && otp !== "123456") {
        return {
          success: false,
          message: "Code OTP invalide ou non vérifié.",
        };
      }
      
      // Update password in mock users
      const mockUsers = safeGetItem("mock_users", []);
      let userFound = false;
      
      // Check default mock user
      if (email?.toLowerCase() === "imad@soukboudouaou.com") {
        // For default user, just show success (we don't store its password)
        userFound = true;
      } else {
        // Update password for signup users
        const userIndex = mockUsers.findIndex(u => 
          u.email?.toLowerCase() === email?.toLowerCase()
        );
        
        if (userIndex !== -1) {
          mockUsers[userIndex].password = password;
          const saved = safeSetItem("mock_users", mockUsers);
          if (saved) {
            userFound = true;
          } else {
            return {
              success: false,
              message: "Impossible de sauvegarder. Espace de stockage insuffisant.",
            };
          }
        }
      }
      
      if (userFound) {
        // Clean up OTP data
        safeRemoveItem(`mock_otp_${email}`);
        safeRemoveItem(`mock_otp_verified_${email}`);
        try {
          localStorage.removeItem(`mock_otp_time_${email}`);
        } catch (error) {
          console.error("Failed to remove OTP time:", error);
        }
        
        return {
          success: true,
          message: "Mot de passe réinitialisé avec succès.",
        };
      }
      
      return {
        success: false,
        message: "Utilisateur non trouvé.",
      };
    }
    
    try {
      const res = await api.post("/auth/reset-password", {
        email,
        otp,
        password,
      });
      return {
        success: res.data?.success !== false,
        message: res.data?.message || "Password updated.",
      };
    } catch (err) {
      console.error("resetPassword error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Reset failed. Try again.";
      return { success: false, message: msg };
    }
  };

  const updateUser = (newData) => {
    setUser(newData);
    safeSetItem("user", newData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      void err;
    }
    setUser(null);
    setToken("");
    safeRemoveItem("user");
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    } catch (error) {
      console.error("Failed to remove tokens:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        requestEmailVerification,
        confirmEmailVerification,
        forgotPassword,
        verifyOtp,
        resetPassword,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
