import { b64, decodeBase64 } from "./base64";

export async function buildKey(userId: string, masterKey: string) {
  const encoder = new TextEncoder();
  const masterBuf = encoder.encode(masterKey);
  const saltBuf = encoder.encode(userId); // ← userId is your per-user salt

  // import master secret for derivation
  const baseKey = await crypto.subtle.importKey(
    "raw",
    masterBuf,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // derive the AES-GCM key
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuf,
      iterations: 100_000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(data: string, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate a random IV
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: 128, // Optional, default is 128 bits
    },
    key,
    new TextEncoder().encode(data)
  );
  return {
    encrypted: b64(encrypted),
    iv: b64(iv.buffer),
  };
}

export async function decrypt(
  encryptedData: { iv: string; encrypted: string },
  key: CryptoKey
) {
  const iv = decodeBase64(encryptedData.iv);
  const data = decodeBase64(encryptedData.encrypted);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: 128, // Optional, default is 128 bits
    },
    key,
    data
  );
  return new TextDecoder().decode(decrypted);
}
