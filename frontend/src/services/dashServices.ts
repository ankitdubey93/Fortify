import { fetchWithAutoRefresh } from "./fetchWithAutoRefresh";

const API_BASE_DASH = `${import.meta.env.VITE_API_BASE_URL}/dashboard`;

export const sendMasterPassword = async (
  encryptionSalt: string,
  keyDerivationMethod: string,
  verification: {
    secret: string;
    hmac: string;
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

export const getEmailVerifiedStatus = async () => {
  const response = await fetch(`${API_BASE_DASH}/email-verified`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch email verification status.");
  }

  return response.json();
};

export const getEncryptionSalt = async () => {
  const response = await fetchWithAutoRefresh(`${API_BASE_DASH}/salt`, {
    credentials: "include",
  });
  const result = await response.json();
  console.log(result);
  return result;
};


export const changePasswordLoggedIn = async (oldPassword: string, newPassword: string): Promise<{success: boolean; message:string}> => {
  try {
    const response = await fetch(`${API_BASE_DASH}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        
      },
      body: JSON.stringify({oldPassword, newPassword}), 
      credentials: "include",
    });
    const data = await response.json();
    if(!response.ok) {
      return {success: false, message: data.message || "Password reset failed."}
    }
      return {success: true, message: data.message || "Password reset successfully."};
    

  } catch (error) {
    console.error("Reset password error: ", error);
    return {success: false, message: "Something went wrong."}
  }
}


export const sendMasterPasswordReset = async ( newEncryptionSalt: string, newKeyDerivationMethod:string,
  newVerification: {
    secret: string;
    hmac: string;
  },
  reEncryptedEntries: any[]
):Promise<{success: boolean; message: string}> => {
  try {
    const response = await fetch(`${API_BASE_DASH}/reset-master-password`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      }, 
      body: JSON.stringify({
        
        newEncryptionSalt, 
        newKeyDerivationMethod,
        newVerification, 
        reEncryptedEntries,
      }),
    });

    const data = await response.json(); 

    if(!response.ok) {
      return {success: false, message: data.message || "Failed to reset master password."};
    }

    return {success: true, message: data.message || "Master password reset successfully."};

  } catch (error) {
    console.error("Reset master password error:", error);
    return {success: false, message: "Something went wrong."};
  }
};

export const restoreVault = async (backupData: {entries: any[];verification: {
  secret: string; hmac: string
}}) => {
  const response = await fetch(`${API_BASE_DASH}/restore-vault-data`, 
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backupData),
    },

  );

  const data = await response.json();
 if (!response.ok) throw new Error(data?.message || "Failed to restore vault/verification.");
  return data;
}