import { fetchWithRefresh } from "./httpClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_URL_AUTH = `${BASE_URL}/auth`;
const API_URL_DASH = `${BASE_URL}/dashboard`;

interface Entry {
  _id: string;
  website: string;
  username: string;
  password: string;
  notes?: string;
}

export const registerUser = async (data: {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
}) => {
  const { name, username, password } = data;

  const response = await fetch(`${API_URL_AUTH}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, username, password }),
  });

  if (!response.ok) {
    throw new Error("Registration failed.");
  }

  return await response.json();
};

export const storeVaultSalt = async (
  vaultSaltBase64: string,
  method: string
) => {
  const response = await fetch(`${API_URL_DASH}/set-master-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      encryptionSalt: vaultSaltBase64,
      keyDerivationMethod: method,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to store vault salt.");
  }

  return await response.json();
};

export const loginUser = async (credentials: {
  username: string;
  password: string;
}) => {
  const { username, password } = credentials;

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

  await response.json();
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
