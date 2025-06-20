import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bufferToBase64, generateSalt } from "../utils/cryptoUtils";
import { deriveKey } from "../utils/deriveKey";
import { sendMasterPassword } from "../services/dashService";
import { getMasterPasswordStatus } from "../services/dashService";

const SetMaster: React.FC = () => {
  const [masterPassword, setMasterPassword] = useState<string>("");

  const [confirmMasterPassword, setConfirmMasterPassword] =
    useState<string>("");
  const [method, setMethod] = useState<"pbkdf2" | "argon2id">("pbkdf2");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkMasterPasswordStatus = async () => {
      try {
        const data = await getMasterPasswordStatus();
        if (data.hasMasterPassword) {
          navigate("/dashboard");
        }
      } catch (error: unknown) {
        console.error("Error checking master password status:", error);
      }
    };

    checkMasterPasswordStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (masterPassword !== confirmMasterPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const salt = generateSalt();
      await deriveKey(masterPassword, salt, method);

      const encodedSalt = bufferToBase64(salt);
      await sendMasterPassword(encodedSalt, method);

      navigate("/dashboard");
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to set master password.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 flex flex-col items-center text-center px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-sky-800 mb-2">
          Welcome to Fortify
        </h1>
        <p className="text-lg text-gray-700 max-w-xl">
          Fortify requires a master password for encryption. You will be
          required to enter the master password while entering your vault every
          time. Please make it a secure one.
        </p>
      </div>

      <div className="flex-grow flex items-center justfiy-center">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="password"
              name="masterPassword"
              placeholder="Master Password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-sky-500"
              required
            />

            <input
              type="password"
              name="confirmMasterPassword"
              placeholder="Confirm Master Password"
              value={confirmMasterPassword}
              onChange={(e) => setConfirmMasterPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-sky-500"
              required
            />
            <select
              value={method}
              onChange={(e) =>
                setMethod(e.target.value as "pbkdf2" | "argon2id")
              }
              className="w-full border rounded p-2"
            >
              <option value="pbkdf2">PBKDF2</option>
              <option value="argon2id">Argon2id</option>
            </select>

            {error && (
              <p className="text-red-600 text-sm font-semibold">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-sky-700 text-white py-2 rounded hover:bg-sky-800 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetMaster;
