const API_BASE_VAULT = `${import.meta.env.VITE_API_BASE_URL}/dashboard/credential-vault`;

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

export const updateEntry = async (entryId: string, updatedData: any) => {
  const response = await fetch(`${API_BASE_VAULT}/${entryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to update entry.");
  }

  return response.json();
};

export const deleteEntry = async (entryId: string) => {
  const response = await fetch(`${API_BASE_VAULT}/${entryId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) throw new Error("Failed to delete entry");
  return response.json();
};
