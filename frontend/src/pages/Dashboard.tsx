import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardData } from "../services/apiService";

interface User {
  _id: string;
  name: string;
  username: string;
  data: [];
  encryptionSalt: string;
  hasMasterPassword: boolean;
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
        setUser({
          ...data.loggedInUser,
          data: data.entries,
          hasMasterPassword: data.hasMasterPassword,
        });
      } catch (error) {
        console.error("Dashboard error:", error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCredentialVaultCheck = () => {
    if (user?.hasMasterPassword) {
      console.log("Master password is set. Entering credential vault.");
      alert("Welcome to your Credential Vault!");
      navigate("/credential-vault");
    } else {
      console.log("Master password is NOT set. Cannot enter vault.");
      alert("Please set your Master Password first.");
      navigate("/set-master-password");
    }
  };

  if (loading) return <div>Loading .....</div>;

  return (
    <div>
      <div className="p-4">
        <div className="flex flex-col space-y-6 justify-between items-left mb-4">
          {user && !user.hasMasterPassword && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md text-center"
              role="alert"
            >
              <p className="font-bold text-lg mb-2">Critical Warning!</p>
              <p>
                Your Master Password has not been set. You cannot access your
                Credentials Vault without it. Please set it up to secure your
                data.{" "}
                <a href="/set-master-password" className="font-bold underline">
                  Click here!
                </a>{" "}
                to set your master password.
              </p>
            </div>
          )}

          <div>
            <button
              className="px-12 py-6 bg-sky-500 text-white text-xl font-bold rounded-lg shadow-lg shadow-sky-600/50 tracking-wide uppercase
            focus:ring-4 focus:ring-sky-300 focus:ring-opacity-75 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-sky-600 hover:shadow-2xl
            hover:shadow-sky-700/60
            "
              onClick={handleCredentialVaultCheck}
            >
              Credential Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
