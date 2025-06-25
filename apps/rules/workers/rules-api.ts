import { sha256 } from "@exectx/crypto/sha256";
import type { App } from "./app";
import { safeTry } from "@exectx/utils";
import {
  eq,
  getTableColumns,
  schema,
  type Rule,
  and,
  isNull,
} from "@exectx/db";
import { buildKey, decrypt } from "@exectx/crypto/aes";
import { cors } from "hono/cors";

export function addRulesApi(app: App) {
  app.use(
    "/api/*",
    cors({
      origin: "*",
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
  app.use("/api/*", async (c) => {
    const { db, cache } = c.get("services");
    if (c.req.method !== "POST") {
      return c.text("Method Not Allowed", 405, { Allow: "POST" });
    }
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.text("Not Authorized", 401, { "WWW-Authenticate": "Bearer" });
    }
    const apikey = authHeader.slice(7);
    if (!apikey) {
      return c.text("Not Authorized", 401, { "WWW-Authenticate": "Bearer" });
    }
    const [body, bodyErr] = await safeTry(c.req.json());
    if (bodyErr) {
      return c.json(
        {
          error: "Bad request",
          message: "Request body could not be read properly",
        },
        500
      );
    }
    const model = body.model;
    if (!model) {
      return c.json(
        { error: "Bad request", message: "Missing 'model' parameter" },
        400
      );
    }

    if (typeof model !== "string") {
      return c.json(
        { error: "Bad request", message: "'model' must be a string" },
        400
      );
    }

    const hash = await sha256(apikey);

    const cacheQuery = cache.rulesByHash.swr(hash, async () => {
      console.log("cache miss for key hash:", hash);
      let query = db
        .select()
        .from(schema.rules)
        .innerJoin(
          schema.keys,
          and(
            eq(schema.rules.userId, schema.keys.userId),
            isNull(schema.rules.deletedAt)
          )
        )
        .where(and(eq(schema.keys.hash, hash), isNull(schema.keys.deletedAt)));
      const data = await query;
      if (data.length === 0) {
        throw new Error("No providers and rules found for this key");
      }
      const [{ keys: key }] = data;
      const rules = data.map(({ rules }) => rules);
      return { rules, key };
    });

    const cacheData = await cacheQuery;
    if (cacheData.err || !cacheData.val) {
      return c.json(
        {
          error: "Internal server error",
          message: cacheData.err?.message ?? "Empty value error",
        },
        500
      );
    }
    const { val: data } = cacheData;

    const updateLastUsedTimestamp = safeTry(async () => {
      const { key } = data;
      await db
        .update(schema.keys)
        .set({
          lastUsed: new Date(),
        })
        .where(eq(schema.keys.id, key.id));
    });
    c.executionCtx.waitUntil(updateLastUsedTimestamp);

    if (data.key.disabledAt) {
      return c.json(
        {
          error: "Forbidden",
          message: "Invalid API Key",
        },
        403
      );
    }
    const [routeInfo, err] = safeTry(() =>
      getMatchingRuleset(model, data.rules)
    );
    if (err) {
      return c.json({ error: "Bad request", message: err.message }, 400);
    }
    const { model: actualModel, rule } = routeInfo;
    let { providerRules, modelRules } = rule;
    let payload = body;
    payload.model = actualModel;
    let appliedRules: Record<string, unknown> = {};
    if (providerRules) {
      Object.assign(appliedRules, providerRules);
    }
    if (modelRules?.[actualModel]) {
      Object.assign(appliedRules, modelRules[actualModel]);
    }
    Object.assign(payload, appliedRules);

    const headers = new Headers();
    const headersToCopy = [
      "accept",
      "accept-encoding",
      "content-type",
      "user-agent",
    ];
    for (const [name, value] of c.req.raw.headers) {
      const lower = name.toLowerCase();
      if (headersToCopy.includes(lower)) {
        import.meta.env.DEV && console.log("copying", name, value);
        headers.set(name, value);
      } else {
        import.meta.env.DEV && console.log("ignoring", name);
      }
    }
    if (!c.req.header("User-Agent")) {
      headers.set("user-agent", "Model-Rules/v0.0.0");
    }

    const cryptoKey = await buildKey(rule.userId, c.env.ENCRYPTION_KEY);
    const apiKey = await decrypt(
      { encrypted: rule.apiKeyEncrypted, iv: rule.apiKeyIv },
      cryptoKey
    );
    headers.set("Authorization", `Bearer ${apiKey}`);

    const appUrl = new URL(c.req.url);
    const baseUrl = new URL(rule.baseUrl);
    const basePath = baseUrl.pathname;
    const requestPath = appUrl.pathname.replace("/api/", "");
    const upstreamUrl = `${baseUrl.origin}${basePath}${requestPath}`;
    console.log("upstream URL:", upstreamUrl);
    console.log("upstream model:", actualModel);
    console.log("applied Rules:", appliedRules);
    const upstreamRequest = fetch(upstreamUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    return upstreamRequest;
  });
}

// TODO: ignore multiple separators (::) in the model name
function getMatchingRuleset(model: string, rules: Rule[]) {
  model = model.trim();
  const count = (model.match(new RegExp("::", "g")) || []).length;
  if (count > 1) {
    throw new Error("Invalid separator usage");
  }
  let rule: Rule | undefined = undefined;
  if (count === 1) {
    const [prefix, _model] = model.split("::");
    if (!prefix) {
      throw new Error("Invalid prefix");
    }
    if (!_model) {
      throw new Error("Invalid model");
    }
    model = _model;
    rule = rules.find((r) => r.prefix === prefix);
  } else {
    rule = rules.find((r) => r.isDefault);
  }
  if (!rule) {
    throw new Error("No matching provider route found");
  }
  return { rule, model };
}
