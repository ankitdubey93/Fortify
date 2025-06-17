import { useContext } from "react";
import AuthContext from "../contexts/AuthContextObject";
import type { AuthContextType } from "../types/auth";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be within an AuthProvider.");
  }

  return context;
};
