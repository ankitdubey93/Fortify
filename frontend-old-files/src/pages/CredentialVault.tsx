import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getDashboardData,
  addEntry,
  updateEntry,
  deleteEntry,
  type EncryptedEntryPayload,
} from "../services/apiService";

import { motion } from "framer-motion";
import { encryptData, decryptData, base64ToBuffer } from "../utils/cryptoUtils";
import { deriveKey } from "../utils/crypto/deriveKey";

interface DecryptedEntry {
  _id: string;
  website: string;
  username: string;
  password: string;
  notes?: string;
}

interface BackendEncryptedEntry {
  _id: string;
  website: { cipherText: string; iv: string };
  username: { cipherText: string; iv: string };
  password: { cipherText: string; iv: string };
  notes?: { cipherText: string; iv: string };
}

const CredentialVault: React.FC = () => {
  const { user } = useAuth();

  const [sessionMasterPassword, setSessionMasterPassword] = useState<
    string | null
  >(null);
  const [masterPasswordInput, setMasterPasswordInput] = useState<string>("");
  const [isMasterPasswordVerified, setIsMasterPasswordVerified] =
    useState<boolean>(false);
  const [masterPasswordError, setMasterPasswordError] = useState<string | null>(
    null
  );

  const [entries, setEntries] = useState<DecryptedEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataFetchError, setDataFetchError] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newEntryForm, setNewEntryForm] = useState({
    website: "",
    username: "",
    password: "",
    notes: "",
  });

  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editedEntryForm, setEditedEntryForm] = useState<
    Partial<DecryptedEntry>
  >({});
};
