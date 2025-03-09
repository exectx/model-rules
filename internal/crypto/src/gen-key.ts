import basex from "base-x";
import { sha256 } from "./sha256";

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bs58 = basex(BASE58);

export async function generateApiKey(length: number, prefix: string) {
  const random = crypto.getRandomValues(new Uint8Array(length));
  const key = prefix + "_" + bs58.encode(random);
  const hash = await sha256(key);
  return { key, hash };
}
