import React, { useState } from "react";
import { MasterPasswordContext } from "./MasterPasswordContext";

export const MasterPasswordProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [encryptionKey, setEncryptionKeyState] = useState<CryptoKey | null>(
    null
  );

  const setEncryptionKey = (key: CryptoKey) => setEncryptionKeyState(key);
  const clearEncryptionKey = () => setEncryptionKeyState(null);

  return (
    <MasterPasswordContext.Provider
      value={{ encryptionKey, setEncryptionKey, clearEncryptionKey }}
    >
      {children}
    </MasterPasswordContext.Provider>
  );
};
