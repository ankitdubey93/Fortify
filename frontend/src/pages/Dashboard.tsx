import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { signout, resendVerificationEmail } from "../services/authServices";

const Dashboard: React.FC = () => {
  const { user, setUser, setIsLoggedIn, refreshUserDetails } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch latest user info when Dashboard mounts
    refreshUserDetails();
  }, []);

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

  const handleResendVerification = async () => {
    try {
      const res = await resendVerificationEmail(user!.email);
      if (res.ok) {
        alert("Verification email resent. Please check your inbox.");
      } else {
        alert(res.message || "Failed to resend verification email.");
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      alert("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 flex flex-col items-center px-6 py-10">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-sky-800 mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          You are logged into your Fortify dashboard.
        </p>

        {/* Master password not set */}
        {user?.hasMasterPassword === false && (
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

        {/* Email not verified */}
        {user?.emailVerified === false && (
          <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-md mb-4 shadow-md">
            <p>
              Your email is <strong>not verified</strong>. Please click the link
              sent to you on your registered email. If you did not get the
              email,{" "}
              <button
                type="button"
                onClick={handleResendVerification}
                className="underline text-sky-800 font-medium hover:text-sky-900 cursor-pointer"
              >
                Click here
              </button>
            </p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => {
              if (!user?.emailVerified && user?.hasMasterPassword === false) {
                alert(
                  "Please verify your email and set your master password first."
                );
              } else if (!user?.emailVerified) {
                alert("Please verify your email first.");
              } else if (user?.hasMasterPassword === false) {
                alert("Please set your master password first.");
              } else {
                navigate("/dashboard/credential-vault");
              }
            }}
            className="w-full bg-sky-700 text-white text-lg font-semibold py-3 rounded-lg shadow-md hover:bg-sky-800 transition-all"
          >
            🔐 Go to Credential Vault
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
