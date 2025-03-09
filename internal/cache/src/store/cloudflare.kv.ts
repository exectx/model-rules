import { Err, Ok, type Result } from "@unkey/error";
import superjson from "superjson";
import { CacheError } from "../errors";
import type { Entry, Store } from "./interface";

// TODO: move to patches

export type CloudflareKvStoreConfig = {
  /**
   * As your data changes, you might want to invalidate old cached values by bumping cacheBuster.
   * @default "v1"
   */
  cacheBuster?: string;
  namespace: KVNamespace;
};

/**
 * A cache Store implementation for Cloudflare Workers KV.
 * Relies on a KV binding available at runtime as `KV_NAMESPACE`.
 */
export class CloudflareKVStore<TNamespace extends string, TValue = any>
  implements Store<TNamespace, TValue>
{
  public readonly name = "cloudflare-kv";
  private readonly config: Required<CloudflareKvStoreConfig>;

  constructor(config: CloudflareKvStoreConfig) {
    this.config = {
      cacheBuster: config.cacheBuster ?? "v1",
      namespace: config.namespace,
    };
  }

  private getKey(namespace: TNamespace, key: string): string {
    // Key includes cacheBuster to enable cache invalidation.
    return `${this.config.cacheBuster}:${namespace}:${key}`;
  }

  public async get(
    namespace: TNamespace,
    key: string
  ): Promise<Result<Entry<TValue> | undefined, CacheError>> {
    try {
      const raw = await this.config.namespace.get(this.getKey(namespace, key));
      if (raw == null) {
        return Ok(undefined);
      }
      const entry = superjson.parse(raw) as Entry<TValue>;
      return Ok(entry);
    } catch (err) {
      return Err(
        new CacheError({
          tier: this.name,
          key,
          message: (err as Error).message,
        })
      );
    }
  }

  public async set(
    namespace: TNamespace,
    key: string,
    entry: Entry<TValue>
  ): Promise<Result<void, CacheError>> {
    try {
      const value = superjson.stringify(entry);
      // Calculate TTL in seconds from staleUntil timestamp.
      const now = Date.now();
      const ttl = Math.max(0, Math.floor((entry.staleUntil - now) / 1000));
      await this.config.namespace.put(this.getKey(namespace, key), value, {
        expirationTtl: ttl || undefined,
      });
      return Ok();
    } catch (err) {
      return Err(
        new CacheError({
          tier: this.name,
          key,
          message: (err as Error).message,
        })
      );
    }
  }

  public async remove(
    namespace: TNamespace,
    keys: string | string[]
  ): Promise<Result<void, CacheError>> {
    const ks = Array.isArray(keys) ? keys : [keys];
    try {
      await Promise.all(
        ks.map((k) => this.config.namespace.delete(this.getKey(namespace, k)))
      );
      return Ok();
    } catch (err) {
      return Err(
        new CacheError({
          tier: this.name,
          key: ks.join(","),
          message: (err as Error).message,
        })
      );
    }
  }
}
