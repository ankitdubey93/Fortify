import bundledArgon2 from "argon2-browser/dist/argon2-bundled.min.js";

export interface DerivedKeys {
  aesKey: CryptoKey;
  hmacKey: CryptoKey;
}

export const deriveKey = async (
  password: string,
  salt: Uint8Array,
  method: "pbkdf2" | "argon2id" = "pbkdf2"
): Promise<DerivedKeys> => {
  const encoder = new TextEncoder();

  if (method === "argon2id") {
    const result = await bundledArgon2.hash({
      pass: password,
      salt,
      type: bundledArgon2.ArgonType.Argon2id,
      hashLen: 64,
      time: 3,
      mem: 65536,
      parallelism: 1,
    });

    const keyMaterial = result.hash;

    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      keyMaterial.slice(0, 32),
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );

    const hmacKey = await crypto.subtle.importKey(
      "raw",
      keyMaterial.slice(32),
      { name: "HMAC", hash: "SHA-256" },
      true, // extractable
      ["sign"]
    );

    return { aesKey, hmacKey };
  } else {
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const derivedBits = await window.crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      512
    );

    const buffer = new Uint8Array(derivedBits);

    const aesKey = await crypto.subtle.importKey(
      "raw",
      buffer.slice(0, 32),
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );

    const hmacKey = await crypto.subtle.importKey(
      "raw",
      buffer.slice(32),
      { name: "HMAC", hash: "SHA-256" },
      true, // extractable
      ["sign"]
    );

    return { aesKey, hmacKey };
  }
};
