import { type HonoEnv } from "@services/hono/env";
import { type Context } from "hono";
import { createCache, Namespace, type Cache as UnkeyCache } from "@unkey/cache";
import type { CacheNamespace, CacheNamespaces } from "./namespaces";
import { MemoryStore, type Store } from "@unkey/cache/stores";
import { CloudflareKVStore } from "@exectx/cache";
import { ONE_YEAR_MS } from "@exectx/utils/constants";

const persistentMap = new Map();

export type Cache = UnkeyCache<CacheNamespaces>;

export function initCache(c: Context<HonoEnv>): UnkeyCache<CacheNamespaces> {
  const stores: Array<Store<CacheNamespace, any>> = [];

  const memory = new MemoryStore<
    CacheNamespace,
    CacheNamespaces[CacheNamespace]
  >({
    persistentMap,
    unstableEvictOnSet: {
      frequency: 0.1,
      maxItems: 5000,
    },
  });

  const cloudflareKV = new CloudflareKVStore<CacheNamespace, CacheNamespaces>({
    cacheBuster: "v1",
    namespace: c.env.KVCache,
  });

  stores.push(memory);
  stores.push(cloudflareKV);

  const namespaceOpts = {
    stores,
    fresh: ONE_YEAR_MS,
    stale: ONE_YEAR_MS,
  };

  return createCache({
    clerkUserById: new Namespace<CacheNamespaces["clerkUserById"]>(
      c.executionCtx,
      {
        ...namespaceOpts,
        fresh: 10 * 60 * 1000, // 10 minutes
        stale: 30 * 60 * 1000, // 30 minutes
      }
    ),
    keyByHash: new Namespace<CacheNamespaces["keyByHash"]>(
      c.executionCtx,
      namespaceOpts
    ),
    rulesByHash: new Namespace<CacheNamespaces["rulesByHash"]>(
      c.executionCtx,
      namespaceOpts
    ),
  });
}
