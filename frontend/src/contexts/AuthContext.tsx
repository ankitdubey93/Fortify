import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardData, signOutUser } from "../services/apiService";
import AuthContext from "./AuthContextObject";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{
    name: string;
    _id: string;
    username: string;
  } | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true); // New loading state for auth check

  const navigate = useNavigate();

  // This useEffect will attempt to fetch user data on component mount
  // to establish the initial authentication status.
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const data = await getDashboardData(); // This call will send the cookie automatically
        if (data && data.user) {
          // If data comes back, user is logged in
          setUser({
            name: data.user.name,
            _id: data.user._id,
            username: data.user.username, // Access from top-level
          });
          setIsLoggedIn(true);
        } else {
          // If no user data or invalid response, assume not logged in
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        // API call failed (e.g., no cookie, expired, server error)
        console.error("Failed to fetch initial auth status:", error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoadingAuth(false); // Auth check is complete
      }
    };

    checkAuthStatus();
  }, []); // Run only once on mount

  const login = (userData: { name: string; _id: string; username: string }) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await signOutUser();
      setIsLoggedIn(false);
      setUser(null);
      navigate("/auth");
    } catch (error) {
      console.error("Sign out failed from AuthContext.", error);
      setIsLoggedIn(false);
      setUser(null);
      navigate("/auth");
    }
  };

  const value = {
    isLoggedIn,
    user,
    login,
    logout,
    isLoadingAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
