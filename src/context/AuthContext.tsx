import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useCurrentUser } from "../api";
import { getAuthCookie, removeAuthCookie } from "../api/axios";
import type { AdminUser } from "../api/types";

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthCookie());
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    setIsAuthenticated(!!getAuthCookie());
  }, [user]);

  const logout = () => {
    removeAuthCookie();
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
