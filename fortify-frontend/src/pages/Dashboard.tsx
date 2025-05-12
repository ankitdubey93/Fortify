import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDashboardData,
  deleteEntry,
  updateEntry,
  signOutUser,
} from "../services/apiService";

interface Entry {
  _id: string;
  website: string;
  username: string;
  password: string;
  notes?: string;
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setUser(data.user);
      } catch (error) {
        console.error("Dashboard error:", error);
      }
    };

    fetchData();
  }, []);

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
      setEditingEntry(null);
      setUpdatedEntry({});
    } catch (err) {
      console.error("Update failed", err);
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

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Welcome, {user?.name}</h1>
      <button
        onClick={handleSignOut}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Sign Out
      </button>

      <ul className="space-y-4">
        {user?.data.map((entry) => (
          <li key={entry._id} className="border p-4 rounded shadow-sm">
            <p>
              <strong>Website:</strong> {entry.website}
            </p>
            <p>
              <strong>Username:</strong> {entry.username}
            </p>
            <p>
              <strong>Password:</strong> {entry.password}
            </p>
            {entry.notes && (
              <p>
                <strong>Notes:</strong> {entry.notes}
              </p>
            )}
            <div className="mt-2 space-x-2">
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
            </div>
          </li>
        ))}
      </ul>

      {editingEntry && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Edit Entry</h2>
            <input
              type="text"
              placeholder="Website"
              value={updatedEntry.website || ""}
              onChange={(e) =>
                setUpdatedEntry({ ...updatedEntry, website: e.target.value })
              }
              className="w-full border p-2 mb-2"
            />
            <input
              type="text"
              placeholder="Username"
              value={updatedEntry.username || ""}
              onChange={(e) =>
                setUpdatedEntry({ ...updatedEntry, username: e.target.value })
              }
              className="w-full border p-2 mb-2"
            />
            <input
              type="text"
              placeholder="Password"
              value={updatedEntry.password || ""}
              onChange={(e) =>
                setUpdatedEntry({ ...updatedEntry, password: e.target.value })
              }
              className="w-full border p-2 mb-2"
            />
            <input
              type="text"
              placeholder="Notes"
              value={updatedEntry.notes || ""}
              onChange={(e) =>
                setUpdatedEntry({ ...updatedEntry, notes: e.target.value })
              }
              className="w-full border p-2 mb-2"
            />
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
    </div>
  );
};

export default Dashboard;
