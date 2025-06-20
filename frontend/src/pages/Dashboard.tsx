import { signout } from "../services/authServices";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

import { useMasterPasswordStatus } from "../hooks/useMasterPasswordStatus";

const Dashboard: React.FC = () => {
  const { user, setUser, setIsLoggedIn } = useAuth();
  // const [hasMasterPassword, setHasMasterPassword] = useState<boolean | null>(
  //   null
  // );
  const { hasMasterPassword, loading } = useMasterPasswordStatus();
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

  if (loading) return null;

  return (
    <div>
      <p>Welcome to the Dashboard</p>
      <h1>Welcome, {user?.name}!</h1>
      {hasMasterPassword === false && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded mb-4">
          <p>
            You have not set your <strong>master password</strong>.{" "}
            <Link
              to="/set-master-password"
              className="underline text-sky-800 font-medium"
            >
              Set it now
            </Link>
          </p>
        </div>
      )}
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
