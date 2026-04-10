import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const token = localStorage.getItem("touneshelp_token");
    const storedUser = localStorage.getItem("touneshelp_user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("touneshelp_token");
        localStorage.removeItem("touneshelp_user");
      }
    }

    setIsLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem("touneshelp_token", token);
    localStorage.setItem("touneshelp_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("touneshelp_token");
    localStorage.removeItem("touneshelp_user");
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
