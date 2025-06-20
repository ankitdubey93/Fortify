const API_BASE_DASH = "http://localhost:3000/api/dashboard";

export const sendMasterPassword = async (
  encryptionSalt: string,
  keyDerivationMethod: string
) => {
  const response = await fetch(`${API_BASE_DASH}/set-master-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ encryptionSalt, keyDerivationMethod }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error || "Failed to set master password.");
  }

  return response.json();
};

export const getMasterPasswordStatus = async () => {
  const response = await fetch(`${API_BASE_DASH}/master-password-status`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch master password status.");
  }

  return response.json();
};

export const getEncryptionSalt = async () => {
  const response = await fetch(`${API_BASE_DASH}/salt`, {
    credentials: "include",
  });

  return await response.json();
};
