import { signout } from "../services/authServices";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useMasterPasswordStatus } from "../hooks/useMasterPasswordStatus";

const Dashboard: React.FC = () => {
  const { user, setUser, setIsLoggedIn } = useAuth();
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
    <div className="min-h-screen bg-sky-100 flex flex-col items-center px-6 py-10">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-sky-800 mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          You are logged into your Fortify dashboard.
        </p>

        {hasMasterPassword === false && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-md mb-6 shadow-md">
            <p>
              You have not set your <strong>master password</strong>.{" "}
              <Link
                to="/set-master-password"
                className="underline text-sky-800 font-medium hover:text-sky-900"
              >
                Set it now
              </Link>
            </p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => navigate("/dashboard/credential-vault")}
            className="w-full bg-sky-700 text-white text-lg font-semibold py-3 rounded-lg shadow-md hover:bg-sky-800 transition-all"
          >
            🔐 Go to Credential Vault
          </button>

          <button
            onClick={handleSignout}
            className="w-full bg-red-500 text-white text-md font-medium py-2 rounded-lg shadow hover:bg-red-600 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
