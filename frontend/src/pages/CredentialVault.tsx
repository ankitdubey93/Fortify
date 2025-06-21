import React, { useState } from "react";

import { base64ToBuffer, decryptData, encryptData } from "../utils/cryptoUtils";
import { getEncryptionSalt } from "../services/dashServices";
import { deriveKey } from "../utils/deriveKey";
import { addEntry, getEncryptedVault } from "../services/vaultservices";

const CredentialVault: React.FC = () => {
  const [masterPassword, setMasterPassword] = useState("");
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newEntry, setNewEntry] = useState({
    website: "",
    username: "",
    password: "",
    notes: "",
  });

  const [key, setKey] = useState<CryptoKey | null>(null);
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

      const encrypted = await getEncryptedVault();

      const decrypted = await Promise.all(
        encrypted.data.map(async (entry: any) => {
          const decryptedWebsite = await decryptData(
            entry.website.cipherText,
            entry.website.iv,
            key
          );
          const decryptedUsername = await decryptData(
            entry.username.cipherText,
            entry.username.iv,
            key
          );
          const decryptedPassword = await decryptData(
            entry.password.cipherText,
            entry.password.iv,
            key
          );
          const decryptedNotes = entry.notes
            ? await decryptData(entry.notes.cipherText, entry.notes.iv, key)
            : "";

          return {
            ...entry,
            decryptedWebsite,
            decryptedUsername,
            decryptedPassword,
            decryptedNotes,
          };
        })
      );

      setKey(key);
      setCredentials(decrypted);
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

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return;

    try {
      const website = await encryptData(newEntry.website, key);
      const username = await encryptData(newEntry.username, key);
      const password = await encryptData(newEntry.password, key);
      const notes = newEntry.notes
        ? await encryptData(newEntry.notes, key)
        : null;

      await addEntry({
        website,
        username,
        password,
        notes,
      });

      setShowAddForm(false);
      setNewEntry({ website: "", username: "", password: "", notes: "" });
      handleUnlock(); // refresh entries
    } catch (err) {
      console.error("Add entry failed", err);
      setError("Failed to add entry.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-sky-800">Your Credentials</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-sky-700 text-white px-4 py-2 rounded hover:bg-sky-800"
        >
          + Add Entry
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse bg-white shadow rounded-md">
          <thead>
            <tr className="bg-sky-100 text-sky-800 font-semibold">
              <th className="px-4 py-2 border">Website</th>
              <th className="px-4 py-2 border">Username</th>
              <th className="px-4 py-2 border">Password</th>
              <th className="px-4 py-2 border">Notes</th>
            </tr>
          </thead>
          <tbody>
            {credentials.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-600">
                  No entries found.
                </td>
              </tr>
            ) : (
              credentials.map((cred, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{cred.decryptedWebsite}</td>
                  <td className="border px-4 py-2">{cred.decryptedUsername}</td>
                  <td className="border px-4 py-2">{cred.decryptedPassword}</td>
                  <td className="border px-4 py-2">{cred.decryptedNotes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-sky-700">
              Add New Entry
            </h3>
            <form className="space-y-4" onSubmit={handleAddEntry}>
              <input
                type="text"
                placeholder="Website"
                value={newEntry.website}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, website: e.target.value })
                }
                required
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Username"
                value={newEntry.username}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, username: e.target.value })
                }
                required
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Password"
                value={newEntry.password}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, password: e.target.value })
                }
                required
                className="w-full border p-2 rounded"
              />
              <textarea
                placeholder="Notes (optional)"
                value={newEntry.notes}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, notes: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
              <div className="flex justify-between items-center mt-4">
                <button
                  type="submit"
                  className="bg-sky-700 text-white px-4 py-2 rounded hover:bg-sky-800"
                >
                  Save Entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-red-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialVault;
