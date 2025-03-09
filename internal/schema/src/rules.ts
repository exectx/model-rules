import * as v from "valibot";

export const ProviderRulesSchema = v.objectWithRest(
  {
    temperature: v.optional(v.number()),
    max_tokens: v.optional(v.number()),
    top_p: v.optional(v.number()),
    frequency_penalty: v.optional(v.number()),
  },
  v.any()
);

export type ProviderRules = v.InferOutput<typeof ProviderRulesSchema>;

export const ModelRulesSchema = v.record(v.string(), ProviderRulesSchema);
export type ModelRules = v.InferOutput<typeof ModelRulesSchema>;
