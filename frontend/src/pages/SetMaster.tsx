import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { bufferToBase64, generateSalt, createHMAC } from "../utils/cryptoUtils";
import { deriveKey } from "../utils/deriveKey";
import { sendMasterPassword } from "../services/dashServices";
import { useAuth } from "../contexts/AuthContext";
import { useRedirectIfMasterPasswordExists } from "../hooks/useRedirectIfMasterPasswordExists";
import { getCurrentUser } from "../services/authServices";

const SetMaster: React.FC = () => {
  useRedirectIfMasterPasswordExists();

  const [masterPassword, setMasterPassword] = useState<string>("");

  const [confirmMasterPassword, setConfirmMasterPassword] =
    useState<string>("");
  const [method, setMethod] = useState<"pbkdf2" | "argon2id">("pbkdf2");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const { setIsLoggedIn, setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (masterPassword !== confirmMasterPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const salt = generateSalt();
      const { aesKey: _, hmacKey } = await deriveKey(
        masterPassword,
        salt,
        method
      );

      const verificationText = crypto.randomUUID();
      const hmac = await createHMAC(hmacKey, verificationText);

      const encodedSalt = bufferToBase64(salt);
      await sendMasterPassword(encodedSalt, method, {
        secret: verificationText,
        hmac,
      });
      const response = await getCurrentUser();

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsLoggedIn(true);
      }
      navigate("/dashboard", { replace: true });
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
            <div className="mt-2 mb-4 bg-sky-50 border border-sky-200 rounded p-3 text-left text-gray-700 text-sm">
              <div className="font-semibold mb-1">Password Derivation Methods</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>PBKDF2</strong>: A widely used and tested standard that
                  applies many hashing rounds to slow brute-force attacks.
                </li>
                <li>
                  <strong>Argon2id</strong>: A modern, memory-hard function designed
                  to resist GPU and ASIC attacks by requiring significant time and
                  memory.
                </li>
                <li>
                  Both methods are secure; however, <strong>Argon2id</strong> offers
                  stronger protection against modern hardware attacks.
                </li>
              </ul>
            </div>

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
