import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyEmail } from "../services/authServices";
import { useAuth } from "../contexts/AuthContext";

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const { refreshUserDetails } = useAuth();

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return; // 👈 Prevent double run
    hasRun.current = true;
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const verify = async () => {
      try {
        if (!token) {
          setStatus("error");
          return;
        }

        const res = await verifyEmail(token);
        if (res.ok) {
          await refreshUserDetails();
          setStatus("success");
          setTimeout(
            () => navigate("/dashboard?verified=1", { replace: true }),
            3000
          );
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Email verification failed: ", error);
        setStatus("error");
      }
    };

    verify();
  }, [location.search, refreshUserDetails, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-100 text-center px-6">
      {status === "loading" && (
        <p className="text-lg">Verifying your email...</p>
      )}
      {status === "success" && (
        <div className="text-green-700 bg-green-100 border border-green-400 px-6 py-4 rounded shadow">
          <p className="font-semibold">✅ Your email has been verified!</p>
          <p className="mt-2 text-sm text-gray-700">
            Redirecting to dashboard...
          </p>
        </div>
      )}
      {status === "error" && (
        <div className="text-red-700 bg-red-100 border border-red-400 px-6 py-4 rounded shadow">
          <p className="font-semibold">
            ❌ Verification failed or token is invalid.
          </p>
          <p className="mt-2">
            Please try verifying again or{" "}
            <a href="/dashboard" className="underline text-sky-700 font-medium">
              return to dashboard
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
