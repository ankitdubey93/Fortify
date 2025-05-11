const API_URL = "http://localhost:3000/api/auth";

export const loginUser = async (credentials: {
  username: string;
  password: string;
}) => {
  const response = await fetch(`${API_URL}/sigin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
  const response = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Registration failed.");
  }

  return await response.json();
};
