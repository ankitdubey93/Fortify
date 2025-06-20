const API_BASE_VAULT = "http://localhost:3000/api/dashboard/credential-vault";

export const getEncryptedVault = async () => {
  const res = await fetch(`${API_BASE_VAULT}/`, { credentials: "include" });
  return await res.json();
};
