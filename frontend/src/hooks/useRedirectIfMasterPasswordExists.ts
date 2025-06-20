import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMasterPasswordStatus } from "../services/dashService";

export const useRedirectIfMasterPasswordExists = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const res = await getMasterPasswordStatus();
        if (res.hasMasterPassword) {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Error checking master password:", err);
      }
    };

    checkAndRedirect();
  }, [navigate]);
};
