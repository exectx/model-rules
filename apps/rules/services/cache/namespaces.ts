import type { User } from "@clerk/react-router/ssr.server";
import type { Key, Rule } from "@exectx/db";

export type CacheNamespaces = {
  clerkUserById: User;
  rulesByHash: { rules: Rule[]; key: Key };
  keyByHash: Key[];
};

export type CacheNamespace = keyof CacheNamespaces;
