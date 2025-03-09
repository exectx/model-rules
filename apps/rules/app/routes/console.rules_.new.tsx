import { getValibotConstraint, parseWithValibot } from "@conform-to/valibot";
import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { data, Form, redirect, useActionData } from "react-router";
import type { Route } from "./+types/console.rules_.new";
// import { appContext } from "@/lib/app-context";
// import { ProviderRoute } from "@exectx/utils/route";
import * as v from "valibot";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OutputField } from "@/components/forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import {
  Expandable,
  ExpandableContent,
  ExpandableSummary,
} from "@/components/custom/expandable";
import { Textarea } from "@/components/ui/textarea";
import { safeTry } from "@exectx/utils";
import { ModelRulesSchema, ProviderRulesSchema } from "@exectx/schema/rules";
import { schema } from "@exectx/db";
import { ROUTE_PATH as RULES_ROUTE_PATH } from "./console.rules";
import { buildKey, encrypt } from "@exectx/crypto/aes";

export const providerRulesFormSchema = v.optional(
  v.pipe(
    v.string(),
    v.rawTransform(({ dataset, addIssue, NEVER }) => {
      const [_parsed, err] = safeTry(() => JSON.parse(dataset.value));
      if (err) {
        addIssue({ message: err.message });
        return NEVER;
      }
      if (Array.isArray(_parsed)) {
        addIssue({ message: "Provider Rules must be an object." });
        return NEVER;
      }
      const parsed = v.safeParse(ProviderRulesSchema, _parsed);
      if (parsed.success) {
        return parsed.output;
      }
      addIssue({ message: "Invalid Rules" });
      return NEVER;
    })
  )
);

export const modelRulesFormSchema = v.optional(
  v.pipe(
    v.string(),
    v.rawTransform(({ dataset, addIssue, NEVER }) => {
      const [_parsed, err] = safeTry(() => JSON.parse(dataset.value));
      if (err) {
        addIssue({ message: err.message });
        return NEVER;
      }
      if (Array.isArray(_parsed)) {
        addIssue({ message: "Model Rules must be an object." });
        return NEVER;
      }
      const parsed = v.safeParse(ModelRulesSchema, _parsed);
      if (parsed.success) {
        return parsed.output;
      }
      addIssue({ message: "Invalid Rules" });
      return NEVER;
    })
  )
);

export const baseUrlSchema = v.pipe(
  v.string(),
  v.trim(),
  v.url(),
  v.transform((url) =>
    url.endsWith("/") ? url.replace(/\/+$/, "/") : url + "/"
  )
);

export const rulesetPrefixSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1),
  v.check((input) => input !== "new", "Prefix cannot be 'new'"),
  v.check((input) => !input.includes(" "), "Prefix cannot contain spaces")
);

export const NewRulesetFormSchema = v.object({
  prefix: rulesetPrefixSchema,
  baseUrl: baseUrlSchema,
  apiKey: v.pipe(v.string(), v.trim()),
  isDefault: v.optional(v.boolean()),
  providerRules: providerRulesFormSchema,
  modelRules: modelRulesFormSchema,
});

export async function loader(args: Route.LoaderArgs) {
  const userId = args.context.auth?.userId;
  if (!userId) return redirect("/auth/sign-in");
}

export const ROUTE_PATH = "/console/rules/new";

export async function action(args: Route.ActionArgs) {
  const { db, cache } = args.context.services;
  const userId = args.context.auth?.userId;
  if (!userId) throw data({ error: "Not authorized" }, { status: 401 });
  const formData = await args.request.formData();
  const submission = parseWithValibot(formData, {
    schema: NewRulesetFormSchema,
  });
  if (submission.status !== "success") {
    return data(
      { form: submission.reply() },
      {
        status: submission.status === "error" ? 400 : 500,
      }
    );
  }
  const encryptedData = await encrypt(
    submission.value.apiKey,
    await buildKey(userId, args.context.cf.env.ENCRYPTION_KEY)
  );
  const [result] = await db
    .insert(schema.rules)
    .values({
      userId: userId,
      prefix: submission.value.prefix,
      baseUrl: submission.value.baseUrl,
      apiKeyPreview: submission.value.apiKey.slice(-5),
      apiKeyEncrypted: encryptedData.encrypted,
      apiKeyIv: encryptedData.iv,
      isDefault: submission.value.isDefault,
      providerRules: submission.value.providerRules,
      modelRules: submission.value.modelRules,
    })
    .returning();
  if (!result) {
    return data(
      {
        form: submission.reply({
          formErrors: ["Failed to create ruleset."],
        }),
      },
      { status: 500 }
    );
  }
  const pendingCacheQueries = safeTry(async () => {
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
      await Promise.all(
        keys.map(async (k) => {
          return cache.rulesByHash.remove(k.hash);
        })
      );
    }
  });
  args.context.cf.ctx.waitUntil(pendingCacheQueries);
  return redirect(RULES_ROUTE_PATH);
}

export default function NewRoutePage() {
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult: actionData?.form,
    constraint: getValibotConstraint(NewRulesetFormSchema),
    onValidate({ formData }) {
      return parseWithValibot(formData, { schema: NewRulesetFormSchema });
    },
  });

  return (
    <div className="p-4 flex-1 max-w-2xl w-full mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Configure your provider and rules</CardTitle>
          <CardDescription>
            Create rules linked to a specific LLM provider.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="POST" action={ROUTE_PATH} {...getFormProps(form)}>
            <div className="grid w-full items-center gap-4">
              <fieldset className="flex flex-col gap-1.5">
                <Label
                  htmlFor={fields.prefix.id}
                  className="flex items-center gap-2"
                >
                  Prefix
                  <span className="border border-input rounded bg-input/80 text-muted-foreground px-1 py-0.5 text-xs">
                    Unique
                  </span>
                </Label>
                <Input
                  autoComplete="off"
                  aria-invalid={Boolean(fields.prefix.errors)}
                  placeholder="e.g. openai"
                  {...getInputProps(fields.prefix, { type: "text" })}
                />
                <OutputField
                  info="Unique prefix to distinguish between different LLM providers."
                  errors={fields.prefix.errors}
                />
              </fieldset>
              <fieldset className="flex flex-col gap-1.5">
                <Label
                  htmlFor={fields.baseUrl.id}
                  className="flex items-center gap-2"
                >
                  Base URL
                </Label>
                <Input
                  autoComplete="off"
                  aria-invalid={Boolean(fields.baseUrl.errors)}
                  placeholder="https://api.openai.com/v1"
                  {...getInputProps(fields.baseUrl, { type: "url" })}
                />
                <OutputField
                  info="The base URL of the LLM provider's API."
                  errors={fields.baseUrl.errors}
                />
              </fieldset>
              <fieldset className="flex flex-col gap-1.5">
                <Label
                  htmlFor={fields.apiKey.id}
                  className="flex items-center gap-2"
                >
                  Provider API Key
                </Label>
                <Input
                  autoComplete="off"
                  aria-invalid={Boolean(fields.apiKey.errors)}
                  placeholder="sk-..."
                  {...getInputProps(fields.apiKey, { type: "password" })}
                />
                <OutputField
                  info="The API key for the LLM provider."
                  errors={fields.apiKey.errors}
                />
              </fieldset>

              <Expandable className="group" open>
                <ExpandableSummary>
                  <ChevronRight className="size-5 transition-transform group-open:rotate-90" />
                  <span>Rules</span>
                </ExpandableSummary>
                <ExpandableContent>
                  <Expandable className="group/provider">
                    <ExpandableSummary>
                      <ChevronRight className="size-5 transition-transform group-open/provider:rotate-90" />
                      <span>Provider rules</span>
                    </ExpandableSummary>
                    <ExpandableContent>
                      <fieldset className="flex flex-col gap-1.5">
                        <Label
                          htmlFor={fields.providerRules.id}
                          className="flex items-center gap-2"
                        >
                          Rules
                          <span className="border border-input rounded bg-input/80 text-muted-foreground px-1 py-0.5 text-xs">
                            JSON
                          </span>
                        </Label>
                        <Textarea
                          className="font-mono text-sm placeholder:text-sm max-h-[30lh]"
                          placeholder={`{\n  "temperature": 0.8,\n  "max_tokens": 25000\n}`}
                          {...getTextareaProps(fields.providerRules)}
                        />
                        <OutputField
                          errors={fields.providerRules.errors}
                          info="These parameters will be applied to every request sent to this provider. Must be a valid JSON."
                        />
                      </fieldset>
                    </ExpandableContent>
                  </Expandable>

                  <Expandable className="group/model">
                    <ExpandableSummary>
                      <ChevronRight className="size-5 transition-transform group-open/model:rotate-90" />
                      <span>Model rules</span>
                    </ExpandableSummary>
                    <ExpandableContent>
                      <fieldset className="flex flex-col gap-1.5">
                        <Label
                          htmlFor={fields.modelRules.id}
                          className="flex items-center gap-2"
                        >
                          Rules
                          <span className="border border-input rounded bg-input/80 text-muted-foreground px-1 py-0.5 text-xs">
                            JSON
                          </span>
                        </Label>
                        <Textarea
                          className="font-mono text-sm placeholder:text-sm max-h-[30lh]"
                          placeholder={`{\n  "o4-mini": {\n    "temperature": 0.8,\n    "max_tokens": 25000\n  },\n  "o3-mini": {\n    "temperature": 0.7,\n    "max_tokens": 75000\n  }\n}`}
                          {...getTextareaProps(fields.modelRules)}
                        />
                        <OutputField
                          errors={fields.modelRules.errors}
                          info="These parameters will be applied to the request matching the model name. Must be a valid JSON."
                        />
                      </fieldset>
                    </ExpandableContent>
                  </Expandable>
                </ExpandableContent>
              </Expandable>
            </div>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" form={form.id} className="min-w-full">
            Save
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
