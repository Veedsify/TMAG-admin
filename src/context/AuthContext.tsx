import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { useCurrentUser } from "../api";
import { getAuthCookie, removeAuthCookie } from "../api/axios";
import { useAdminAuthStore } from "../stores/adminAuthStore";

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const hasCookie = !!getAuthCookie();
  const { data: user, isLoading } = useCurrentUser();
  const login = useAdminAuthStore((s) => s.login);

  useEffect(() => {
    if (user) {
      login({
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
        avatar: user.avatar,
      });
    }
  }, [user, login]);

  const logout = () => {
    removeAuthCookie();
    useAdminAuthStore.getState().logout();
    window.location.href = "/admin";
  };

  // Authenticated = cookie exists AND user data loaded from API
  const isAuthenticated = hasCookie && !!user;

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
