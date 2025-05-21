import { fetchWithRefresh } from "./httpClient";
import argon2 from "argon2-browser";

const API_URL_AUTH = "https://13.232.226.34:3000/api/auth";
const API_URL_DASH = "https://13.232.226.34:3000/api/dashboard";

interface Entry {
  _id: string;
  website: string;
  username: string;
  password: string;
  notes?: string;
}

export const loginUser = async (credentials: {
  username: string;
  password: string;
  masterPassword: string;
}) => {
  const { username, password, masterPassword } = credentials;

  const response = await fetch(`${API_URL_AUTH}/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Login Failed");
  }

  const data = await response.json();

  if (!data.vaultSalt) {
    throw new Error("Missing vault salt from server.");
  }

  const salt = new Uint8Array(
    [...atob(data.vaultSalt)].map((c) => c.charCodeAt(0))
  );

  const { hash } = await argon2.hash({
    pass: masterPassword,
    salt,
    type: argon2.ArgonType.Argon2id,
    hashLen: 32,
  });

  // hash is now a string
  const encryptionKey = hash;

  return { ...data, encryptionKey };
};

export const registerUser = async (data: {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  masterPassword: string;
  confirmMasterPassword: string;
}) => {
  const { name, username, password, masterPassword } = data;

  const salt = crypto.getRandomValues(new Uint8Array(16));

  await argon2.hash({
    pass: masterPassword,
    salt,
    type: argon2.ArgonType.Argon2id,
  });

  const encodedSalt = btoa(String.fromCharCode(...salt));

  const response = await fetch(`${API_URL_AUTH}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, username, password, vaultSalt: encodedSalt }),
  });

  if (!response.ok) {
    throw new Error("Registration failed.");
  }

  return await response.json();
};

export const signOutUser = async () => {
  const response = await fetch(`${API_URL_AUTH}/signout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed.");
  }

  return await response.json();
};

export const getDashboardData = async () => {
  const response = await fetchWithRefresh(`${API_URL_DASH}/`, {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    throw new Error("Unauthorized.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data.");
  }

  return await response.json();
};

export const deleteEntry = async (entryId: string) => {
  const res = await fetchWithRefresh(`${API_URL_DASH}/${entryId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Delete failed");

  return await res.json();
};

export const updateEntry = async (
  entryId: string,
  updatedData: Partial<Entry>
) => {
  const res = await fetchWithRefresh(`${API_URL_DASH}/${entryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) throw new Error("Update failed");

  return await res.json();
};

export const refreshAccessToken = async () => {
  const res = await fetch(`${API_URL_AUTH}/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to refresh token");
  }

  return await res.json();
};

export const addEntry = async (entryData: Partial<Entry>) => {
  const res = await fetchWithRefresh(`${API_URL_DASH}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(entryData),
  });

  if (!res.ok) {
    throw new Error("Failed to add entry");
  }

  return await res.json();
};
