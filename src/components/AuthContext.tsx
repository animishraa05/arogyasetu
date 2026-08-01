// src/components/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

// adapt fields to match your backend response
export interface User {
  user_id: number;
  name: string;
  role: "admin" | "asha_worker" | "ngo" | "clinic";
  email: string;
  village_id?: number;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  setAuthUser: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInitializing: boolean; // true while reading localStorage on load
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Load user from localStorage on first mount
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        const userData: User = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.warn("Failed to parse stored user:", err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Called after login/register to update context + persist
  const setAuthUser = (userData: User) => {
    if (!userData) return;
    setUser(userData);
    setIsAuthenticated(true);
    try {
      localStorage.setItem("currentUser", JSON.stringify(userData));
    } catch (err) {
      console.warn("Failed to persist currentUser:", err);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("access_token"); // Changed from "accessToken"
    localStorage.removeItem("refresh_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setAuthUser,
        logout,
        isAuthenticated,
        isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
