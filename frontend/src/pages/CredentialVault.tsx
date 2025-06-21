import React, { useState } from "react";

import { base64ToBuffer, decryptData } from "../utils/cryptoUtils";
import { getEncryptionSalt } from "../services/dashServices";
import { deriveKey } from "../utils/deriveKey";
import { getEncryptedVault } from "../services/vaultservices";

const CredentialVault: React.FC = () => {
  const [masterPassword, setMasterPassword] = useState("");
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [error, setError] = useState("");

  // Fetch encryption salt on mount

  const handleUnlock = async () => {
    setError("");

    try {
      const response = await getEncryptionSalt();
      const { encryptionSalt, keyDerivationMethod, verification } = response;

      if (!encryptionSalt || !keyDerivationMethod || !verification) {
        throw new Error("Missing required encryption data from server.");
      }

      const key = await deriveKey(
        masterPassword,
        base64ToBuffer(encryptionSalt),
        keyDerivationMethod
      );

      const check = await decryptData(
        verification.cipherText,
        verification.iv,
        key
      );

      const verificationText = import.meta.env.VITE_VERIFICATION_TEXT;

      if (check !== verificationText) {
        throw new Error("Master password verification failed.");
      }

      // console.log(key);
      // const encrypted = await getEncryptedVault(); // returns { data: [ { website, username, ciphertext, iv } ] }

      // const decrypted = await Promise.all(
      //   encrypted.data.map(async (entry: any) => {
      //     const decryptedWebsite = await decryptData(
      //       entry.website.cipherText,
      //       entry.website.iv,
      //       key
      //     );
      //     const decryptedUsername = await decryptData(
      //       entry.username.cipherText,
      //       entry.username.iv,
      //       key
      //     );
      //     const decryptedPassword = await decryptData(
      //       entry.password.cipherText,
      //       entry.password.iv,
      //       key
      //     );
      //     const decryptedNotes = entry.notes
      //       ? await decryptData(entry.notes.cipherText, entry.notes.iv, key)
      //       : "";

      //     return {
      //       ...entry,
      //       decryptedWebsite,
      //       decryptedUsername,
      //       decryptedPassword,
      //       decryptedNotes,
      //     };
      //   })
      // );

      // setCredentials(decrypted);
      setVaultUnlocked(true);
    } catch (error) {
      console.error(error);
      setError("Incorrect master password or decryption failed.");
    }
  };

  if (!vaultUnlocked) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <h2 className="text-xl font-bold mb-4">Enter Master Password</h2>
        <input
          type="password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />
        <button
          onClick={handleUnlock}
          className="w-full bg-sky-700 text-white p-2 rounded hover:bg-sky-800"
        >
          Unlock Vault
        </button>
        {error && <p className="text-red-600 mt-3">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-sky-800">Your Credentials</h2>
      {credentials.length === 0 ? (
        <p className="text-gray-600">No entries found.</p>
      ) : (
        <ul className="space-y-4">
          {credentials.map((cred, idx) => (
            <li key={idx} className="bg-white shadow p-4 rounded-md">
              <p>
                <strong>Website:</strong> {cred.website}
              </p>
              <p>
                <strong>Username:</strong> {cred.username}
              </p>
              <p>
                <strong>Password:</strong> {cred.decryptedPassword}
              </p>
              {cred.notes && (
                <p>
                  <strong>Notes:</strong> {cred.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CredentialVault;
