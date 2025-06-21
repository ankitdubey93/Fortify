const API_BASE_VAULT = "http://localhost:3000/api/dashboard/credential-vault";

export const getEncryptedVault = async () => {
  const res = await fetch(`${API_BASE_VAULT}/`, { credentials: "include" });
  return await res.json();
};

export const addEntry = async (entryData: any) => {
  const response = await fetch(`${API_BASE_VAULT}/add-entry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(entryData),
  });

  if (!response.ok) throw new Error("failed to add entry.");

  return await response.json();
};
