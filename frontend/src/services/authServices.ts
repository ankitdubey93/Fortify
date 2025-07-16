import { fetchWithAutoRefresh } from "./fetchWithAutoRefresh";

const API_BASE_AUTH = `${import.meta.env.VITE_API_BASE_URL}/auth`;

export const signup = async (name: string, email: string, password: string) => {
  const response = await fetch(`${API_BASE_AUTH}/signup`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });
  return response.json();
};

export const signin = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_AUTH}/signin`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
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
  const response = await fetchWithAutoRefresh(`${API_BASE_AUTH}/check`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Not authenticated.");
  }

  return response.json();
};

export const verifyEmail = async (token: string) => {
  try {
    const response = await fetch(
      `${API_BASE_AUTH}/verify-email?token=${token}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await response.json();

    return {
      ok: response.ok,

      message: data.message || "",
    };
  } catch (error) {
    console.error("Verify Email failed:", error);
    return {
      ok: false,
      message: "Something went wrong.",
    };
  }
};

export const resendVerificationEmail = async (email: string) => {
  const response = await fetch(`${API_BASE_AUTH}/resend-verification`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  return {
    status: response.status,
    ok: response.ok,
    ...data,
  };
};
