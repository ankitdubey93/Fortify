import { signout } from "../services/authServices";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { user, setUser, setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleSignout = async () => {
    try {
      await signout();
      setUser(null);
      setIsLoggedIn(false);
      navigate("/");
    } catch (error) {
      console.error("Signout failed:", error);
      alert("Failed to sign out. Try again.");
    }
  };

  return (
    <div>
      <p>Welcome to the Dashboard</p>
      <h1>Welcome, {user?.name}!</h1>
      <div>
        <button
          onClick={handleSignout}
          className="rounded border-red-50 text-2xl"
        >
          Signout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
