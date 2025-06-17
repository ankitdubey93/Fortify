// Define the shape of your AuthContext values
export interface AuthContextType {
  isLoggedIn: boolean;
  user: { name: string; _id: string; username: string } | null;
  login: (userData: { name: string; _id: string; username: string }) => void;
  logout: () => Promise<void>;
  isLoadingAuth: boolean;
}
