import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiException } from "@/lib/api";

export type UserRole = "client" | "attendant" | "manager";

export interface User {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  role: UserRole;
  is_admin?: boolean;
}

type AuthContextValue = {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setRole: (role: UserRole | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há token JWT válido e carregar dados do usuário
    const checkAuthStatus = async () => {
      try {
        if (api.isAuthenticated()) {
          // Tentar obter dados do usuário atual
          const response = await api.getCurrentUser();
          setUserState(response.usuario);
          setRoleState(response.usuario.role);
        }
      } catch (error) {
        // Token inválido ou expirado, fazer logout
        if (error instanceof ApiException && (error.status === 401 || error.status === 403)) {
          api.logout();
          setUserState(null);
          setRoleState(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const setRole = (newRole: UserRole | null) => {
    setRoleState(newRole);
    // Role agora é derivado do usuário, não armazenado separadamente
  };

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      setRoleState(newUser.role);
    } else {
      setRoleState(null);
    }
  };

  const logout = () => {
    api.logout(); // Remove token JWT
    setUserState(null);
    setRoleState(null);
    // Dados do usuário não precisam ser removidos manualmente, pois o token é suficiente
  };

  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      if (api.isAuthenticated()) {
        // Tentar obter dados do usuário atual
        const response = await api.getCurrentUser();
        setUserState(response.usuario);
        setRoleState(response.usuario.role);
      }
    } catch (error) {
      // Token inválido ou expirado, fazer logout
      if (error instanceof ApiException && (error.status === 401 || error.status === 403)) {
        api.logout();
        setUserState(null);
        setRoleState(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    role,
    isAuthenticated: !!user,
    isLoading,
    setRole,
    setUser,
    logout,
    refreshAuth
  }), [user, role, isLoading]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


