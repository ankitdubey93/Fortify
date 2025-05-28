import React, { useState } from "react";
import { MasterPasswordContext } from "./MasterPasswordContext";

export const MasterPasswordProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  return (
    <MasterPasswordContext.Provider value={{ encryptionKey, setEncryptionKey }}>
      {children}
    </MasterPasswordContext.Provider>
  );
};
