const API_URL_AUTH = "http://localhost:3000/api/auth";
const API_URL_DASH = "http://localhost:3000/api/dashboard";

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
}) => {
  console.log(credentials);
  const response = await fetch(`${API_URL_AUTH}/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Login Failed");
  }

  return await response.json();
};

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
  const response = await fetch(`${API_URL_DASH}/`, {
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
  const res = await fetch(`${API_URL_DASH}/entry/${entryId}`, {
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
  const res = await fetch(`${API_URL_DASH}/entry/${entryId}`, {
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
