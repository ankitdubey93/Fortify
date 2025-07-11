import { useEffect, useState } from "react";
import { getEmailVerifiedStatus } from "../services/dashServices";

export const useEmailVerifiedStatus = () => {
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await getEmailVerifiedStatus();

        const data = await response.json();

        if (response.ok) {
          setEmailVerified(data.user?.emailVerified ?? false);
        } else {
          setEmailVerified(false);
        }
      } catch (error: unknown) {
        console.error("Error checking email verification: ", error);
        setEmailVerified(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  return { emailVerified, loading };
};
