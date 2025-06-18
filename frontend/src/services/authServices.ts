const API_BASE_AUTH = "http://localhost:3000/api/auth";

export const signup = async (
  name: string,
  username: string,
  password: string
) => {
  const response = await fetch(`${API_BASE_AUTH}/signup`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, username, password }),
  });
  return response.json();
};

export const signin = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_AUTH}/signin`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  return {
    status: response.status,
    ok: response.ok,
    ...data,
  };
};

export const signout = async () => {
  const response = await fetch(`${API_BASE_AUTH}/signout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed.");
  }

  return await response.json();
};

export const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE_AUTH}/check`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Not authenticated.");
  }

  return response.json();
};
