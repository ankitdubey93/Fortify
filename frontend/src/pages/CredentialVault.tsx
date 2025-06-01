import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMasterPassword } from "../contexts/useMasterPassword";
import { getDashboardData } from "../services/apiService";

interface User {
  _id: string;
  name: string;
  username: string;
  data: EncryptedEntry[];
  encryptionSalt: string;
}

export const Entries: React.FunctionComponent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [decryptedEntries, setDecryptedEntries] = useState<DecryptedEntry[]>(
    []
  );
  const [editingEntry, setEditingEntry] = useState<DecryptedEntry | null>(null);
  const [updatedEntry, setUpdatedEntry] = useState<Partial<DecryptedEntry>>({});
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<DecryptedEntry>>({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { encryptionKey, clearEncryptionKey } = useMasterPassword();

  console.log("Encryption key in Entries:", encryptionKey);

  useEffect(() => {
    if (!encryptionKey) {
      console.log(
        "Encryption key not found, redirecting to dashboard for unlock."
      );
      navigate("/dashboard");
      return;
    }

    const fetchDataAndDecrypt = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        console.log("Raw encrypted data fetched: ", data);

        setUser({ ...data.loggedInUser, data: data.entries });

        const decrypted = await decryptAllEntries(data.entries, encryptionKey);
        setDecryptedEntries(decrypted);
      } catch (error) {
        console.error(
          "Error on fetching or decrypting data in Entries: ",
          error
        );
        clearEncryptionKey();
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndDecrypt();
  }, [encryptionKey, navigate, clearEncryptionKey]);
};

const decryptAllEntries = useCallback(async (encryptedEntries: EncryptedEntry[], key: CryptoKey))