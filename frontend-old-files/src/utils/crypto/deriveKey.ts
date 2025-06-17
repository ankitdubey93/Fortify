import bundledArgon2 from "argon2-browser/dist/argon2-bundled.min.js";

export const deriveKey = async (
  password: string,
  salt: Uint8Array,
  method: "pbkdf2" | "argon2id" = "pbkdf2"
): Promise<CryptoKey> => {
  if (method === "argon2id") {
    const result = await bundledArgon2.hash({
      pass: password,
      salt,
      type: bundledArgon2.ArgonType.Argon2id,
      hashLen: 32,
      time: 3,
      mem: 65536,
      parallelism: 1,
    });

    return await window.crypto.subtle.importKey(
      "raw",
      result.hash,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  } else {
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
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
};
