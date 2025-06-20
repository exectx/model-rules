import { getValibotConstraint, parseWithValibot } from "@conform-to/valibot";
import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { data, Form, redirect, useActionData } from "react-router";
import type { Route } from "./+types/_shell.console.rules_.new";
// import { appContext } from "@/lib/app-context";
// import { ProviderRoute } from "@exectx/utils/route";
import * as v from "valibot";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputField, OutputField, TextareaField } from "@/components/forms";
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
import { ROUTE_PATH as RULES_ROUTE_PATH } from "./_shell.console.rules";
import { buildKey, encrypt } from "@exectx/crypto/aes";
import { useIsPending } from "@/hooks/use-is-pending";
import { Spinner } from "@/components/ui/spinner";

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
      for (const issue of parsed.issues) {
        addIssue({ message: issue.message });
      }
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
    await buildKey(userId, args.context.cloudflare.env.ENCRYPTION_KEY)
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
  args.context.cloudflare.ctx.waitUntil(pendingCacheQueries);
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
  const isPending = useIsPending();

  // getTextareaProps

  return (
    <div className="p-4 flex-1 max-w-2xl w-full mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Configure your provider and rules</CardTitle>
          <CardDescription>
            Create rules linked to a specific LLM provider.
          </CardDescription>
        </CardHeader>
        <Form
          method="POST"
          action={ROUTE_PATH}
          {...getFormProps(form)}
          className="contents"
        >
          <fieldset disabled={isPending} className="contents group/form">
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <InputField
                  labelProps={{ children: "Prefix" }}
                  inputProps={getInputProps(fields.prefix, {
                    type: "text",
                  })}
                  errors={fields.prefix.errors}
                  helper="This prefix will be used to identify the ruleset. It must be unique."
                />
                <InputField
                  labelProps={{ children: "Base URL" }}
                  inputProps={getInputProps(fields.baseUrl, {
                    type: "url",
                    placeholder: "https://api.openai.com/v1",
                  })}
                  errors={fields.baseUrl.errors}
                  helper="The base URL of the LLM provider's API."
                />
                <InputField
                  labelProps={{ children: "Provider API Key" }}
                  inputProps={getInputProps(fields.apiKey, {
                    type: "password",
                    placeholder: "sk-...",
                  })}
                  errors={fields.apiKey.errors}
                  helper="The API key for the LLM provider."
                />
                <Expandable className="group/exp" open>
                  <ExpandableSummary>
                    <ChevronRight className="size-5 transition-transform group-open/exp:rotate-90" />
                    <span>Rules</span>
                  </ExpandableSummary>
                  <ExpandableContent>
                    <Expandable className="group/provider">
                      <ExpandableSummary>
                        <ChevronRight className="size-5 transition-transform group-open/provider:rotate-90" />
                        <span>Provider rules</span>
                      </ExpandableSummary>
                      <ExpandableContent>
                        <TextareaField
                          labelProps={{
                            className: "inline-flex gap-1.5 items-center",
                            children: (
                              <>
                                Provider Rules
                                <span className="border border-input rounded bg-input/80 text-muted-foreground px-1 py-0.5 text-xs">
                                  JSON
                                </span>
                              </>
                            ),
                          }}
                          textareaProps={{
                            ...getTextareaProps(fields.providerRules),
                            className:
                              "font-mono text-sm placeholder:text-sm max-h-[30lh]",
                            placeholder: `{\n  "temperature": 0.8,\n  "max_tokens": 25000\n}`,
                          }}
                          helper="These parameters will be applied to every request sent to this provider. Must be a valid JSON."
                          errors={fields.providerRules.errors}
                        />
                      </ExpandableContent>
                    </Expandable>

                    <Expandable className="group/model">
                      <ExpandableSummary>
                        <ChevronRight className="size-5 transition-transform group-open/model:rotate-90" />
                        <span>Model rules</span>
                      </ExpandableSummary>
                      <ExpandableContent>
                        <TextareaField
                          labelProps={{
                            className: "inline-flex gap-1.5 items-center",
                            children: (
                              <>
                                Model rules
                                <span className="border border-input rounded bg-input/80 text-muted-foreground px-1 py-0.5 text-xs">
                                  JSON
                                </span>
                              </>
                            ),
                          }}
                          textareaProps={{
                            ...getTextareaProps(fields.modelRules),
                            className:
                              "font-mono text-sm placeholder:text-sm max-h-[30lh]",
                            placeholder: `{\n  "o4-mini": {\n    "temperature": 0.8,\n    "max_tokens": 25000\n  },\n  "o3-mini": {\n    "temperature": 0.7,\n    "max_tokens": 75000\n  }\n}`,
                          }}
                          helper="These parameters will be applied to the request matching the model name. Must be a valid JSON."
                          errors={fields.modelRules.errors}
                        />
                      </ExpandableContent>
                    </Expandable>
                  </ExpandableContent>
                </Expandable>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" form={form.id} className="w-full">
                <span className="absolute group-enabled/form:opacity-0">
                  <Spinner className="bg-primary-foreground" />
                </span>
                <span className="group-disabled/form:opacity-0">Save</span>
              </Button>
            </CardFooter>
          </fieldset>
        </Form>
      </Card>
    </div>
  );
}
