// Define the shape of your AuthContext values
export interface AuthContextType {
  isLoggedIn: boolean;
  user: { name: string; _id: string; hasMasterPassword: boolean } | null;
  login: (userData: {
    name: string;
    _id: string;
    hasMasterPassword: boolean;
  }) => void;
  logout: () => Promise<void>;
  isLoadingAuth: boolean;
}
