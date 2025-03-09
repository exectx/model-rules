import { Form, useFetcher } from "react-router";
import { ROUTE_PATH as RULES_ROUTE_PATH } from "./console.rules";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as v from "valibot";
import { parseWithValibot, getValibotConstraint } from "@conform-to/valibot";
import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { OutputField } from "@/components/forms";
import { cn } from "@/lib/utils";
import { redirect, data } from "react-router";
import { and, eq, isNull, schema } from "@exectx/db";
import type { Route } from "./+types/console.rules_.$slug.settings";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { useId, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildKey, encrypt } from "@exectx/crypto/aes";
import { useRuleData } from "./console.rules_.$slug";
import {
  baseUrlSchema,
  modelRulesFormSchema,
  providerRulesFormSchema,
  rulesetPrefixSchema,
} from "./console.rules_.new";
import { ROUTE_PATH as DELETE_RULE_ROUTE_PATH } from "./console.rules_.delete.$id";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useIsPending } from "@/hooks/use-is-pending";
import { invalidateAllRulesCache } from "@/lib/cache-utils";
// import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"; // Using remix types as placeholders if Route types are not defined

export const ROUTE_PATH = (slug: string) => `/console/rules/${slug}/settings`;

const EditRuleFormSchema = v.variant("action", [
  v.object({
    action: v.literal("update_prefix"),
    id: v.string(),
    prefix: rulesetPrefixSchema,
  }),
  v.object({
    action: v.literal("update_provider_details"),
    id: v.string(),
    baseUrl: v.optional(baseUrlSchema),
    apiKey: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1))),
  }),
  v.object({
    action: v.literal("update_rules"),
    id: v.string(),
    providerRules: providerRulesFormSchema,
    modelRules: modelRulesFormSchema,
  }),
]);

export async function action(args: Route.ActionArgs) {
  const userId = args.context.auth?.userId;
  if (!userId) throw data({ error: "Not authorized" }, { status: 401 });
  const { db } = args.context.services;
  const { slug } = args.params;
  if (!slug) return redirect(RULES_ROUTE_PATH);

  const formData = await args.request.formData();
  const submission = parseWithValibot(formData, {
    schema: EditRuleFormSchema,
  });

  if (submission.status !== "success") {
    return data(
      { result: submission.reply() },
      {
        status: submission.status === "error" ? 400 : 500,
      }
    );
  }

  const input = submission.value;
  const existingRule = await db.query.rules.findFirst({
    columns: { id: true },
    where: (table, { eq, and, isNull }) =>
      and(
        eq(table.id, input.id),
        eq(table.prefix, slug),
        eq(table.userId, userId),
        isNull(table.deletedAt)
      ),
  });

  if (!existingRule) {
    return data(
      {
        result: submission.reply({
          formErrors: ["Rule not found or unauthorized to edit."],
        }),
      },
      { status: 404 }
    );
  }

  if (input.action === "update_prefix") {
    if (
      await db.query.rules.findFirst({
        where: (table, { eq, and }) =>
          and(eq(table.prefix, input.prefix), eq(table.userId, userId)),
        columns: { id: true },
      })
    ) {
      return data(
        {
          result: submission.reply({
            fieldErrors: {
              prefix: ["This prefix already exists."],
            },
          }),
        },
        { status: 409 }
      );
    }
    await db
      .update(schema.rules)
      .set({
        prefix: input.prefix,
      })
      .where(
        and(
          eq(schema.rules.id, existingRule.id),
          eq(schema.rules.userId, userId),
          isNull(schema.rules.deletedAt)
        )
      );
    // return redirect(ROUTE_PATH(input.prefix));
  } else if (input.action === "update_provider_details") {
    let apiKeyEncrypted: string | undefined;
    let apiKeyIv: string | undefined;
    if (input.apiKey) {
      const encryptionKey = await buildKey(
        userId,
        args.context.cf.env.ENCRYPTION_KEY
      );
      const { encrypted, iv } = await encrypt(input.apiKey, encryptionKey);
      apiKeyEncrypted = encrypted;
      apiKeyIv = iv;
    }
    await db
      .update(schema.rules)
      .set({
        baseUrl: input.baseUrl,
        apiKeyEncrypted,
        apiKeyIv,
      })
      .where(
        and(
          eq(schema.rules.id, existingRule.id),
          eq(schema.rules.userId, userId),
          isNull(schema.rules.deletedAt)
        )
      );
    // return { result: submission.reply() };
  } else {
    await db
      .update(schema.rules)
      .set({
        providerRules: input.providerRules,
        modelRules: input.modelRules,
      })
      .where(
        and(
          eq(schema.rules.id, existingRule.id),
          eq(schema.rules.userId, userId),
          isNull(schema.rules.deletedAt)
        )
      );
    // return { result: submission.reply() };
  }
  // Invalidate cache
  args.context.cf.ctx.waitUntil(invalidateAllRulesCache(userId));
  if (input.action === "update_prefix") {
    return redirect(ROUTE_PATH(input.prefix));
  }
  return data(
    {
      result: submission.reply({
        // fieldErrors: {},
        // resetForm: true,
      }),
    },
    { status: 200 }
  );
}

const updatePrefixFetcherKey = "update:rules:prefix";
function PrefixSection() {
  // const {
  //   rule: { prefix },
  // } = useLoaderData<typeof loader>();
  const { prefix, id } = useRuleData();

  const fetcher = useFetcher<typeof action>({ key: updatePrefixFetcherKey });
  const [form, fields] = useForm({
    lastResult: fetcher.data?.result,
    constraint: getValibotConstraint(EditRuleFormSchema),
    onValidate({ formData }) {
      return parseWithValibot(formData, { schema: EditRuleFormSchema });
    },
    defaultValue: { action: "update_prefix", id },
  });
  const [dialog, setDialog] = useState(false);

  return (
    <>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Prefix name</CardTitle>
          <CardDescription>
            The prefix name is used to identify the ruleset. It must be unique
            and is used in the API calls, before the model name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex">
            <Input
              readOnly
              disabled
              value={prefix}
              className="rounded-r-none border-r-0"
            />
            <Button
              size={"icon"}
              variant={"outline"}
              className="rounded-l-none"
              onClick={() => setDialog(true)}
            >
              <Pencil className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={dialog}
        onOpenChange={(open) => {
          if (!open) {
            setTimeout(() => form.reset(), 150);
          }
          setDialog(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change your prefix</DialogTitle>
            <DialogDescription>
              The prefix name is used to identify the ruleset in the API. It
              must be unique.
            </DialogDescription>
          </DialogHeader>
          <fetcher.Form
            method="POST"
            {...getFormProps(form)}
            action={ROUTE_PATH(prefix)}
          >
            <input {...getInputProps(fields.action, { type: "hidden" })} />
            <input {...getInputProps(fields.id, { type: "hidden" })} />
            <fieldset className="flex flex-col gap-2">
              <Label htmlFor={fields.prefix.id}>New Prefix</Label>
              <Input
                placeholder={"e.g. " + prefix}
                autoComplete="off"
                {...getInputProps(fields.prefix, { type: "text" })}
              />
              <OutputField errors={fields.prefix.errors} />
            </fieldset>
          </fetcher.Form>
          <DialogFooter>
            <Button
              form={form.id}
              type="submit"
              className="w-full"
              disabled={!form.dirty || fetcher.state !== "idle"}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const updateRulesProviderFetcherKey = "update:rules:provider";
function ProviderDetailsSection() {
  const { prefix, ...rule } = useRuleData();
  const fetcher = useFetcher<typeof action>({
    key: updateRulesProviderFetcherKey,
  });
  const id = useId();
  const [form, fields] = useForm({
    id: id + "-" + (rule.updatedAt?.getTime() ?? 0),
    lastResult: fetcher.data?.result,
    constraint: getValibotConstraint(EditRuleFormSchema),
    onValidate({ formData }) {
      return parseWithValibot(formData, { schema: EditRuleFormSchema });
    },
    defaultValue: {
      action: "update_provider_details",
      id: rule.id,
      baseUrl: rule.baseUrl,
    },
  });
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Provider Details</CardTitle>
          <CardDescription>
            Settings for the LLM upstream provider.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <fetcher.Form
            method="POST"
            {...getFormProps(form)}
            action={ROUTE_PATH(prefix)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input {...getInputProps(fields.action, { type: "hidden" })} />
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <fieldset className="col-span-1 flex flex-col gap-2">
                <Label htmlFor={fields.apiKey.id}>API Key</Label>
                <div className="relative">
                  <Input
                    autoComplete="off"
                    className="pe-9 placeholder:italic"
                    placeholder="The API Key Value is encrypted"
                    // placeholder={"•".repeat(20) + rule.apiKeyPreview}
                    {...getInputProps(fields.apiKey, {
                      type: isVisible ? "text" : "password",
                    })}
                  />
                  <button
                    className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={toggleVisibility}
                    aria-label={isVisible ? "Hide password" : "Show password"}
                    aria-pressed={isVisible}
                    aria-controls="password"
                  >
                    {isVisible ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <OutputField
                  info={
                    <div className="inline-flex items-center gap-1">
                      Credentials can be updated, the current one ends with
                      <span className="border border-input rounded bg-input/80 text-muted-foreground px-1 py-0.5 text-xs">
                        {rule.apiKeyPreview}
                      </span>
                    </div>
                  }
                  errors={fields.apiKey.errors}
                />
              </fieldset>
              <fieldset className="col-span-1 flex flex-col gap-2">
                <Label htmlFor={fields.baseUrl.id}>Base URL</Label>
                <Input
                  autoComplete="off"
                  placeholder="https://api.openai.com/v1"
                  {...getInputProps(fields.baseUrl, { type: "url" })}
                />
                <OutputField errors={fields.baseUrl.errors} />
              </fieldset>
            </div>
          </fetcher.Form>
        </CardContent>
        <CardFooter className="justify-end">
          <Button form={form.id} disabled={fetcher.state !== "idle"}>
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}

const updateRulesFetcherKey = "update:rules:rules";
function RulesSection() {
  const rule = useRuleData();
  const fetcher = useFetcher<typeof action>({
    key: updateRulesFetcherKey,
  });
  const id = useId();
  const [form, fields] = useForm({
    id: id + "-" + (rule.updatedAt?.getTime() ?? 0),
    lastResult: fetcher.data?.result,
    constraint: getValibotConstraint(EditRuleFormSchema),
    onValidate({ formData }) {
      return parseWithValibot(formData, { schema: EditRuleFormSchema });
    },
    defaultValue: {
      action: "update_rules",
      id: rule.id,
      providerRules: rule.providerRules
        ? JSON.stringify(rule.providerRules, null, 2)
        : undefined,
      modelRules: rule.modelRules
        ? JSON.stringify(rule.modelRules, null, 2)
        : undefined,
    },
  });

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Rules</CardTitle>
        <CardDescription>
          Modify the provider and model-specific rules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <fetcher.Form
          method="POST"
          {...getFormProps(form)}
          action={ROUTE_PATH(rule.prefix)}
        >
          <input {...getInputProps(fields.action, { type: "hidden" })} />
          <input {...getInputProps(fields.id, { type: "hidden" })} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <fieldset className="flex flex-col gap-2">
              <Label htmlFor={fields.providerRules.id}>Provider Rules</Label>
              <Textarea
                {...getTextareaProps(fields.providerRules)}
                autoComplete="off"
                className="font-mono text-sm placeholder:text-sm max-h-[30lh] min-h-[8lh]"
                placeholder={`{\n  "temperature": 0.8,\n  "max_tokens": 25000\n}`}
              />
              <OutputField errors={fields.providerRules.errors} />
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <Label htmlFor={fields.modelRules.id}>Model Rules</Label>
              <Textarea
                {...getTextareaProps(fields.modelRules)}
                autoComplete="off"
                className="font-mono text-sm placeholder:text-sm max-h-[30lh] min-h-[8lh]"
                placeholder={`{\n  "o4-mini": {\n    "temperature": 0.8,\n    "max_tokens": 25000\n  }\n}`}
              />
              <OutputField errors={fields.modelRules.errors} />
            </fieldset>
          </div>
        </fetcher.Form>
      </CardContent>
      <CardFooter className="justify-end">
        <Button form={form.id} disabled={fetcher.state !== "idle"}>
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}

function DeleteRulesSection() {
  const rule = useRuleData();
  const isPending = useIsPending();
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Delete Ruleset</CardTitle>
        <CardDescription>
          The ruleset will be permanently deleted, including all associated
          provider credentials. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={isPending}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Ruleset</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                ruleset, including all associated provider credentials.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Form
                method="DELETE"
                className="contents"
                action={DELETE_RULE_ROUTE_PATH(rule.id)}
              >
                <AlertDialogAction
                  className={buttonVariants({ variant: "destructive" })}
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </Form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

export default function EditRulePage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:gap-6 max-w-5xl mx-auto w-full">
        <PrefixSection />
        <ProviderDetailsSection />
        <RulesSection />
        <DeleteRulesSection />
      </div>
    </div>
  );
}
