import React from "react";
import { useAuthStore } from "../lib/store/auth-store";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { checkAuthStatus } = useAuthStore();

  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  return <>{children}</>;
};

export default AuthProvider;
