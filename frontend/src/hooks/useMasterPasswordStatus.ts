import { useEffect, useState } from "react";
import { getMasterPasswordStatus } from "../services/dashService";

export const useMasterPasswordStatus = () => {
  const [hasMasterPassword, setHasMasterPassword] = useState<boolean | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await getMasterPasswordStatus();
        setHasMasterPassword(res.hasMasterPassword);
      } catch (err) {
        console.error("Error fetching master password status:", err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  return { hasMasterPassword, loading };
};
