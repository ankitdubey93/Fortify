import { useContext } from "react";
import { MasterPasswordContext } from "./MasterPasswordContext";

export const useMasterPassword = () => {
  const context = useContext(MasterPasswordContext);
  if (!context)
    throw new Error(
      "useMasterPassword must be used within MasterPasswordProvider"
    );
  return context;
};
