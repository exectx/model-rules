import { safeTry } from "@exectx/utils";
import { getServices } from "@services/context";

export async function invalidateAllRulesCache(userId: string) {
  const { cache, db } = getServices();
  const [, err] = await safeTry(async () => {
    const keys = await db.query.keys.findMany({
      where: (t, { and, isNull, eq }) =>
        and(eq(t.userId, userId), isNull(t.disabledAt)),
      columns: {
        id: true,
        hash: true,
      },
    });
    if (keys.length > 0) {
      console.log("Keys to invalidate:", keys);
      return await Promise.all(
        keys.map(async (k) => {
          return cache.rulesByHash.remove(k.hash).then(({ err }) => {
            if (err) {
              console.log("Error invalidating key:", k.id, err.message);
            } else {
              console.log("Successfully invalidated key:", k.id);
            }
          });
        })
      );
    }
  });
  if (err) {
    console.log("Error invalidating keys:", err.message);
  }
}

export async function invalidateRuleCacheByKeyHash({
  hash,
  id,
}: {
  hash: string;
  id: string;
}) {
  const { cache } = getServices();
  return cache.rulesByHash.remove(hash).then(({ err }) => {
    if (err) {
      console.log(
        "Error invalidating rule cache by key hash:",
        id,
        err.message
      );
    } else {
      console.log("Successfully invalidated rule cache by key hash:", id);
    }
  });
}
