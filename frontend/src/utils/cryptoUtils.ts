export const bufferToBase64 = (buffer: Uint8Array): string =>
  btoa(String.fromCharCode(...buffer));

export const base64ToBuffer = (base64: string): Uint8Array =>
  new Uint8Array([...atob(base64)].map((char) => char.charCodeAt(0)));

export const generateSalt = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(16));
};

export const deriveKey = async (
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

export const encryptData = async (
  plainText: string,
  key: CryptoKey
): Promise<{ iv: string; cipherText: string }> => {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plainText)
  );

  return {
    iv: bufferToBase64(iv),
    cipherText: bufferToBase64(new Uint8Array(encrypted)),
  };
};

export const decryptData = async (
  cipherText: string,
  iv: string,
  key: CryptoKey
): Promise<string> => {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBuffer(iv) },
    key,
    base64ToBuffer(cipherText)
  );

  return new TextDecoder().decode(decrypted);
};
