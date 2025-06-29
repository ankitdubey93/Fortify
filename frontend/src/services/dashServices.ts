const API_BASE_DASH = `${import.meta.env.VITE_API_BASE_URL}/dashboard`;

export const sendMasterPassword = async (
  encryptionSalt: string,
  keyDerivationMethod: string,
  verification: {
    cipherText: string;
    iv: string;
  }
) => {
  const response = await fetch(`${API_BASE_DASH}/set-master-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ encryptionSalt, keyDerivationMethod, verification }),
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
  const result = await response.json();
  console.log(result);
  return result;
};
