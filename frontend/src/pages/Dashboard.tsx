import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDashboardData,
  deleteEntry,
  updateEntry,
  addEntry,
  signOutUser,
} from "../services/apiService";
import DashboardNavbar from "../components/DashboardNavbar";
import { useMasterPassword } from "../contexts/useMasterPassword";
import { encryptData } from "../utils/cryptoUtils";

interface EncryptedData {
  cipherText: string;
  iv: string;
}

interface Entry {
  _id: string;
  website: string;
  username: string;
  password: string;
  notes?: string;
  iv: string;
}

interface EncryptedEntryPayload {
  website: EncryptedData;
  username: EncryptedData;
  password: EncryptedData;
  notes?: EncryptedData;
}

interface User {
  _id: string;
  name: string;
  username: string;
  data: Entry[];
}

export const Dashboard: React.FunctionComponent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [updatedEntry, setUpdatedEntry] = useState<Partial<Entry>>({});
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<Entry>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { encryptionKey } = useMasterPassword();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        console.log(data);
        setUser({ ...data.loggedInUser, data: data.entries });
      } catch (error) {
        console.error("Dashboard error:", error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <div>Loading .....</div>;

  const handleDelete = async (entryId: string) => {
    try {
      await deleteEntry(entryId);
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              data: prevUser.data.filter((e) => e._id !== entryId),
            }
          : null
      );
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleUpdate = async () => {
    if (!editingEntry) return;
    try {
      const updated = await updateEntry(editingEntry._id, updatedEntry);
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              data: prevUser.data.map((entry) =>
                entry._id === updated._id ? updated : entry
              ),
            }
          : null
      );
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setEditingEntry(null);
      setUpdatedEntry({});
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate("/auth");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleAddEntry = async () => {
    if (
      !encryptionKey ||
      !newEntry.website ||
      !newEntry.username ||
      !newEntry.password
    ) {
      // Basic validation: ensure required fields are not empty
      console.error("Website, username, and password are required.");
      return;
    }

    try {
      const encryptedWebsite = await encryptData(
        newEntry.website,
        encryptionKey
      );
      const encryptedUsername = await encryptData(
        newEntry.username,
        encryptionKey
      );
      const encryptedPassword = await encryptData(
        newEntry.password,
        encryptionKey
      );
      const encryptedNotes = newEntry.notes
        ? await encryptData(newEntry.notes, encryptionKey)
        : { cipherText: "", iv: encryptedWebsite.iv };

      const payloadToSendToBackend: EncryptedEntryPayload = {
        website: encryptedWebsite,
        username: encryptedUsername,
        password: encryptedPassword,
        notes: encryptedNotes,
      };

      const response = await addEntry(payloadToSendToBackend);
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              data: [...prevUser.data, response],
            }
          : null
      );
      setNewEntry({});
      setShowAddPopup(false);
    } catch (error) {
      console.error("Add entry failed:", error);
    }
  };

  return (
    <div>
      {user && <DashboardNavbar name={user.name} onSignOut={handleSignOut} />}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4"></div>

        <button
          onClick={() => setShowAddPopup(true)}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        >
          Add New Entry
        </button>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Website</th>
                <th className="border p-2">Username</th>
                <th className="border p-2">Password</th>
                <th className="border p-2">Notes</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {user?.data.map((entry) => (
                <tr key={entry._id} className="text-center">
                  <td className="border p-2">{entry.website}</td>
                  <td className="border p-2">{entry.username}</td>
                  <td className="border p-2">{entry.password}</td>
                  <td className="border p-2">{entry.notes || "-"}</td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => {
                        setEditingEntry(entry);
                        setUpdatedEntry(entry);
                      }}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Entry Popup */}
        {editingEntry && (
          <div className="fixed inset-0 bg-sky-700 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Edit Entry</h2>
              {(
                ["website", "username", "password", "notes"] as (keyof Entry)[]
              ).map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={updatedEntry[field] || ""}
                  onChange={(e) =>
                    setUpdatedEntry({
                      ...updatedEntry,
                      [field]: e.target.value,
                    })
                  }
                  className="w-full border p-2 mb-2"
                />
              ))}
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleUpdate}
                  className="bg-green-500 text-white px-4 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingEntry(null)}
                  className="bg-gray-300 px-4 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Entry Popup */}
        {showAddPopup && (
          <div className="fixed inset-0 bg-sky-700 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Add New Entry</h2>
              {(
                ["website", "username", "password", "notes"] as (keyof Entry)[]
              ).map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={newEntry[field] || ""}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, [field]: e.target.value })
                  }
                  className="w-full border p-2 mb-2"
                />
              ))}
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleAddEntry}
                  className="bg-blue-500 text-white px-4 py-1 rounded"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddPopup(false)}
                  className="bg-gray-300 px-4 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
