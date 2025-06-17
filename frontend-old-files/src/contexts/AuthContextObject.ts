import { createContext } from "react";
import type { AuthContextType } from "../types/auth";

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
