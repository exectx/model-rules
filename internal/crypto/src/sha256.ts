import { b64 } from "./base64";

export async function sha256(source: string | Uint8Array): Promise<string> {
  const buf =
    typeof source === "string" ? new TextEncoder().encode(source) : source;

  const hash = await crypto.subtle.digest("sha-256", buf);
  return b64(hash);
}
