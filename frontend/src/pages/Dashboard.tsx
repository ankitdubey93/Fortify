import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardData, signOutUser } from "../services/apiService";
import DashboardNavbar from "../components/DashboardNavbar";

interface User {
  _id: string;
  name: string;
  username: string;
  data: [];
  encryptionSalt: string;
}

export const Dashboard: React.FunctionComponent = () => {
  console.count("Dashboard component rendered");
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.count("useEffect fetchData called");
        const data = await getDashboardData();
        console.log(data);
        setUser({ ...data.loggedInUser, data: data.entries });
      } catch (error) {
        console.error("Dashboard error:", error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate("/auth");
    } catch (error) {
      console.error("Sign out failed.", error);
    }
  };

  if (loading) return <div>Loading .....</div>;

  return (
    <div>
      {user && <DashboardNavbar name={user.name} onSignOut={handleSignOut} />}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4"></div>
      </div>
    </div>
  );
};

export default Dashboard;
