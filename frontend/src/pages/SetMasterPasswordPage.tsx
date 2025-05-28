import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMasterPassword } from "../contexts/MasterPasswordProvider";
import { deriveKey, generateSalt, bufferToBase64 } from "../utils/cryptoUtils";
import { storeVaultSalt } from "../services/apiService";

const SetMasterPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { setEncryptionKey } = useMasterPassword();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const salt = generateSalt();
      const key = await deriveKey(password, salt);
      setEncryptionKey(key);

      const encodedSalt = bufferToBase64(salt);
      await storeVaultSalt(encodedSalt);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Failed to set master password.");
    }
  };

  return (
    <div className="flex justify-center mt-24">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center">
          Set Master Password
        </h2>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <input
          type="password"
          placeholder="Master Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="password"
          placeholder="Confirm Master Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Set Password
        </button>
      </form>
    </div>
  );
};

export default SetMasterPasswordPage;
