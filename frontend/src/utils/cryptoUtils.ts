export const bufferToBase64 = (buffer: Uint8Array): string =>
  btoa(String.fromCharCode(...buffer));

export const base64ToBuffer = (base64: string): Uint8Array =>
  new Uint8Array([...atob(base64)].map((char) => char.charCodeAt(0)));

export const generateSalt = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(16));
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

export const createHMAC = async (
  key: CryptoKey,
  message: string
): Promise<string> => {
  const encoder = new TextEncoder();
  const msgBuffer = encoder.encode(message);

  const rawKey = await crypto.subtle.exportKey("raw", key);

  const hmacKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", hmacKey, msgBuffer);

  return bufferToBase64(new Uint8Array(signature));
};
