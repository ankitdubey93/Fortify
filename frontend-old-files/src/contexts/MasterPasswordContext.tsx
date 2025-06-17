import { createContext } from "react";

interface MasterPasswordContextProps {
  encryptionKey: CryptoKey | null;
  setEncryptionKey: (key: CryptoKey) => void;
  clearEncryptionKey: () => void;
}

export const MasterPasswordContext = createContext<
  MasterPasswordContextProps | undefined
>(undefined);
