import {
  Form,
  useActionData,
  useFetcher,
  useNavigation,
  useSubmit,
} from "react-router";
import { ROUTE_PATH as RULES_ROUTE_PATH } from "./_shell.console.rules";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Edit, Trash2, Info } from "lucide-react";
import * as v from "valibot";
import { parseWithValibot, getValibotConstraint } from "@conform-to/valibot";
import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { ErrorField, InputField, TextareaField } from "@/components/forms";
import { cn } from "@/lib/utils";
import { redirect, data } from "react-router";
import { and, eq, isNull, schema } from "@exectx/db";
import type { Route } from "./+types/_shell.console.rules_.$slug.settings";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildKey, encrypt } from "@exectx/crypto/aes";
import { useRuleData } from "./_shell.console.rules_.$slug";
import {
  baseUrlSchema,
  modelRulesFormSchema,
  providerRulesFormSchema,
  rulesetPrefixSchema,
} from "./_shell.console.rules_.new";
import { ROUTE_PATH as DELETE_RULE_ROUTE_PATH } from "./_shell.console.rules_.delete.$id";
import { useIsPending } from "@/hooks/use-is-pending";
import { invalidateAllRulesCache } from "@/lib/cache-utils";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFormCalls } from "@/hooks/use-form-calls";

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
    action: v.literal("update_provider_rules"),
    id: v.string(),
    providerRules: v.unwrap(providerRulesFormSchema),
  }),
  v.object({
    action: v.literal("update_model_rules"),
    id: v.string(),
    modelRules: v.unwrap(modelRulesFormSchema),
  }),
  v.object({
    action: v.literal("clear_rule"),
    id: v.string(),
    ruleType: v.union([v.literal("providerRules"), v.literal("modelRules")]),
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
    if (
      typeof input.baseUrl === "undefined" &&
      typeof input.apiKey === "undefined"
    ) {
      return data(
        {
          result: submission.reply({
            formErrors: [
              "At least one of base URL or API key must be provided.",
            ],
          }),
        },
        { status: 400 }
      );
    }

    let apiKeyEncrypted: string | undefined;
    let apiKeyIv: string | undefined;
    if (input.apiKey) {
      const encryptionKey = await buildKey(
        userId,
        args.context.cloudflare.env.ENCRYPTION_KEY
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
  } else if (input.action === "update_provider_rules") {
    await db
      .update(schema.rules)
      .set({
        providerRules: input.providerRules,
      })
      .where(
        and(
          eq(schema.rules.id, existingRule.id),
          eq(schema.rules.userId, userId),
          isNull(schema.rules.deletedAt)
        )
      );
  } else if (input.action === "update_model_rules") {
    await db
      .update(schema.rules)
      .set({
        modelRules: input.modelRules,
      })
      .where(
        and(
          eq(schema.rules.id, existingRule.id),
          eq(schema.rules.userId, userId),
          isNull(schema.rules.deletedAt)
        )
      );
  } else if (input.action === "clear_rule") {
    const updateData =
      input.ruleType === "providerRules"
        ? { providerRules: null }
        : { modelRules: null };

    await db
      .update(schema.rules)
      .set(updateData)
      .where(
        and(
          eq(schema.rules.id, existingRule.id),
          eq(schema.rules.userId, userId),
          isNull(schema.rules.deletedAt)
        )
      );
  }
  // Invalidate cache
  args.context.cloudflare.ctx.waitUntil(invalidateAllRulesCache(userId));
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

function UpdatePrefixForm(props: { onSuccess?: () => void }) {
  let { id, prefix, updatedAt } = useRuleData();
  let formId = `${useId()}-${prefix}-${updatedAt?.getTime() ?? 0}`;
  const actionData = useActionData<typeof action>();
  let navigation = useNavigation();
  let hasSubmitted = useRef(false);
  let isPending = useIsPending();
  let prevPrefix = useRef(prefix);
  let submit = useSubmit();

  const [form, fields] = useForm({
    id: formId,
    // lastResult: fetcher.data?.result,
    lastResult: actionData?.result,
    constraint: getValibotConstraint(EditRuleFormSchema),
    onValidate({ formData }) {
      return parseWithValibot(formData, { schema: EditRuleFormSchema });
    },
    defaultValue: { action: "update_prefix", id },
    onSubmit(event, context) {
      submit(event.currentTarget, context);
      hasSubmitted.current = true;
    },
  });

  useEffect(() => {
    if (navigation.state !== "idle") return;
    if (!hasSubmitted.current) return;
    if (prevPrefix.current === prefix) return;
    // this means page has been redirected after successful form submission
    // NOTE: actionData is missing because of redirect
    props.onSuccess?.();
    // reset stuff
    prevPrefix.current = prefix;
    hasSubmitted.current = false;
  }, [navigation.state]);

  return (
    <Form
      method="POST"
      action={ROUTE_PATH(prefix)}
      className="contents"
      {...getFormProps(form)}
    >
      <fieldset disabled={isPending} className="contents group">
        <input {...getInputProps(fields.action, { type: "hidden" })} />
        <input {...getInputProps(fields.id, { type: "hidden" })} />
        <InputField
          labelProps={{ children: "New Prefix" }}
          inputProps={{
            placeholder: "e.g. " + prefix,
            autoComplete: "off",
            ...getInputProps(fields.prefix, {
              type: "text",
            }),
          }}
          errors={fields.prefix.errors}
        />
        <DialogFooter>
          <Button type="submit" className="w-full" disabled={!form.dirty}>
            <span className="absolute group-enabled:opacity-0">
              <Spinner />
            </span>
            <span className="group-disabled:opacity-0">Save Changes</span>
          </Button>
        </DialogFooter>
      </fieldset>
    </Form>
  );
}

function PrefixSection() {
  const { prefix } = useRuleData();
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
      <Dialog open={dialog} onOpenChange={setDialog} defaultOpen={false}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change your prefix</DialogTitle>
            <DialogDescription>
              The prefix name is used to identify the ruleset in the API. It
              must be unique.
            </DialogDescription>
          </DialogHeader>
          <UpdatePrefixForm
            onSuccess={() => {
              console.log("Prefix updated successfully.");
              setDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProviderDetailsSection(props: { onSuccess?: () => void }) {
  const { prefix, ...rule } = useRuleData();
  let fetcher = useFetcher<typeof action>();
  let formId = `${useId()}-provider-${rule.id}-${rule.updatedAt?.getTime() ?? 0}`;
  const [form, fields] = useForm({
    id: formId,
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
  const isPending = fetcher.state !== "idle";

  return (
    <>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Provider Details</CardTitle>
          <CardDescription>
            Settings for the LLM upstream provider.
          </CardDescription>
        </CardHeader>
        <fetcher.Form
          method="POST"
          {...getFormProps(form)}
          action={ROUTE_PATH(prefix)}
          className="contents"
        >
          <fieldset disabled={isPending} className="contents group">
            <CardContent>
              <div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                style={{ marginTop: form.errors?.length ? "0" : "-1rem" }}
              >
                <ErrorField
                  id={form.errorId}
                  errors={form.errors}
                  className={"col-span-full"}
                />
                <input {...getInputProps(fields.action, { type: "hidden" })} />
                <input {...getInputProps(fields.id, { type: "hidden" })} />
                <InputField
                  labelProps={{ children: "API Key" }}
                  errors={fields.apiKey.errors}
                  helper="Credentials can be updated."
                  inputProps={{
                    id: fields.apiKey.id,
                    element: (
                      <div className="relative">
                        <Input
                          autoComplete="off"
                          className="pe-11 placeholder:italic"
                          placeholder={`API Key is encrypted. It ends with ***${rule.apiKeyPreview}`}
                          {...getInputProps(fields.apiKey, {
                            type: isVisible ? "text" : "password",
                          })}
                        />
                        <Button
                          className="absolute group/show -translate-y-1/2 top-1/2 right-1 size-fit bg-transparent py-1.5 px-3"
                          type="button"
                          size="icon"
                          variant="secondary"
                          onClick={toggleVisibility}
                          aria-label={
                            isVisible ? "Hide New API key" : "Show New API key"
                          }
                          aria-pressed={isVisible}
                          aria-controls="password"
                        >
                          <EyeOff
                            className="size-4 hidden group-aria-pressed/show:block"
                            aria-hidden="true"
                          />
                          <Eye
                            className="size-4 block group-aria-pressed/show:hidden"
                            aria-hidden="true"
                          />
                        </Button>
                      </div>
                    ),
                  }}
                />
                <InputField
                  labelProps={{ children: "Base URL" }}
                  inputProps={{
                    placeholder: "https://api.openai.com/v1",
                    ...getInputProps(fields.baseUrl, { type: "url" }),
                  }}
                  errors={fields.baseUrl.errors}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit" disabled={!form.dirty}>
                <span className="absolute group-enabled:opacity-0">
                  <Spinner className="bg-primary-foreground" />
                </span>
                <span className="group-disabled:opacity-0">Save Changes</span>
              </Button>
            </CardFooter>
          </fieldset>
        </fetcher.Form>
      </Card>
    </>
  );
}

// Individual rule editor component
function RuleEditor({
  ruleType,
  ruleValue,
  onCancel,
}: {
  ruleType: "providerRules" | "modelRules";
  ruleValue: any;
  onCancel: () => void;
}) {
  const rule = useRuleData();
  const fetcher = useFetcher<typeof action>();
  const id = useId();

  const [form, fields] = useForm({
    id: `${id}-edit-${ruleType}-${rule.updatedAt?.getTime() ?? 0}`,
    lastResult: fetcher.data?.result,
    constraint: getValibotConstraint(EditRuleFormSchema),
    onValidate({ formData }) {
      const submission = parseWithValibot(formData, {
        schema: EditRuleFormSchema,
      });
      return submission;
    },
    defaultValue: {
      action:
        ruleType === "providerRules"
          ? "update_provider_rules"
          : "update_model_rules",
      id: rule.id,
      ...(ruleType === "providerRules"
        ? {
            providerRules: ruleValue ? JSON.stringify(ruleValue, null, 2) : "",
          }
        : {
            modelRules: ruleValue ? JSON.stringify(ruleValue, null, 2) : "",
          }),
    },
  });

  const isPending = fetcher.state !== "idle";

  useFormCalls({
    formResult: fetcher.data?.result,
    actionResult: fetcher.data,
    onSuccess: () => {
      onCancel();
    },
  });

  return (
    <fetcher.Form
      method="POST"
      action={ROUTE_PATH(rule.prefix)}
      {...getFormProps(form)}
    >
      <fieldset
        disabled={isPending}
        className="w-full flex flex-col gap-4 group"
      >
        <input {...getInputProps(fields.action, { type: "hidden" })} />
        <input {...getInputProps(fields.id, { type: "hidden" })} />

        {ruleType === "providerRules" ? (
          <TextareaField
            labelProps={{ children: "Updated Provider Rules" }}
            textareaProps={{
              ...getTextareaProps(fields.providerRules),
              autoComplete: "off",
              className:
                "font-mono text-sm placeholder:text-sm max-h-[30lh] min-h-[8lh]",
              placeholder: `{\n  "temperature": 0.8,\n  "max_tokens": 25000\n}`,
            }}
            errors={fields.providerRules.errors}
          />
        ) : (
          <TextareaField
            labelProps={{ children: "Updated Model Rules" }}
            textareaProps={{
              ...getTextareaProps(fields.modelRules),
              autoComplete: "off",
              className:
                "font-mono text-sm placeholder:text-sm max-h-[30lh] min-h-[8lh]",
              placeholder: `{\n  "o4-mini": {\n    "temperature": 0.8,\n    "max_tokens": 25000\n  }\n}`,
            }}
            errors={fields.modelRules.errors}
          />
        )}

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!form.dirty}>
            <span className="absolute group-enabled:opacity-0">
              <Spinner className="bg-primary-foreground" />
            </span>
            <span className="group-disabled:opacity-0">Save Changes</span>
          </Button>
        </div>
      </fieldset>
    </fetcher.Form>
  );
}

// Individual rule display component
function RuleDisplay({
  ruleType,
  ruleValue,
  onEdit,
}: {
  ruleType: "providerRules" | "modelRules";
  ruleValue: any;
  onEdit: () => void;
}) {
  const rule = useRuleData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const clearFetcher = useFetcher<typeof action>();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">
          {ruleType === "providerRules" ? "Provider Rules" : "Model Rules"}
        </h4>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghostty" size="icon" className="size-8">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <Edit className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!Boolean(ruleValue)}
              variant="destructive"
              onSelect={() => setDialogOpen(true)}
            >
              <Trash2 className="size-4" />
              Clear
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {ruleValue ? (
        <div className="rounded-md border bg-muted/30 p-3">
          <pre className="text-sm font-mono whitespace-pre-wrap overflow-auto max-h-[200px]">
            {JSON.stringify(ruleValue, null, 2)}
          </pre>
        </div>
      ) : (
        <Alert>
          <Info className="size-4" />
          <AlertTitle className="font-normal">
            No {ruleType === "providerRules" ? "Provider" : "Model"} Rules
            Configured
          </AlertTitle>
        </Alert>
      )}

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Clear {ruleType === "providerRules" ? "Provider" : "Model"} Rules
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear these rules? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <clearFetcher.Form
              action={ROUTE_PATH(rule.prefix)}
              className="contents"
              method="POST"
            >
              <input type="hidden" name="action" value="clear_rule" />
              <input type="hidden" name="id" value={rule.id} />
              <input type="hidden" name="ruleType" value={ruleType} />
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit">Clear Rules</AlertDialogAction>
            </clearFetcher.Form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RulesSection() {
  const rule = useRuleData();
  const [editingRule, setEditingRule] = React.useState<
    "providerRules" | "modelRules" | null
  >(null);

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Rules</CardTitle>
        <CardDescription>
          Configure provider and model-specific rules for this ruleset.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8">
          <div className="grid gap-6">
            <div
              className={cn(editingRule === "providerRules" && "opacity-50")}
            >
              <RuleDisplay
                ruleType="providerRules"
                ruleValue={rule.providerRules}
                onEdit={() => setEditingRule("providerRules")}
              />
            </div>
            {editingRule === "providerRules" && (
              <div className="">
                <RuleEditor
                  ruleType="providerRules"
                  ruleValue={rule.providerRules}
                  onCancel={() => setEditingRule(null)}
                />
              </div>
            )}
          </div>

          <div className="grid gap-6">
            <div className={cn(editingRule === "modelRules" && "opacity-50")}>
              <RuleDisplay
                ruleType="modelRules"
                ruleValue={rule.modelRules}
                onEdit={() => setEditingRule("modelRules")}
              />
            </div>
            {editingRule === "modelRules" && (
              <div className="">
                <RuleEditor
                  ruleType="modelRules"
                  ruleValue={rule.modelRules}
                  onCancel={() => setEditingRule(null)}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
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
              <Form
                method="DELETE"
                className="contents"
                action={DELETE_RULE_ROUTE_PATH(rule.id) + "?redirect=true"}
              >
                <fieldset disabled={isPending} className="contents group">
                  <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: "destructive" })}
                    type="submit"
                  >
                    <span className="absolute group-enabled:opacity-0">
                      <Spinner />
                    </span>
                    <span className="group-disabled:opacity-0">Delete</span>
                  </AlertDialogAction>
                </fieldset>
              </Form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

export default function EditRulePage({ params }: Route.ComponentProps) {
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
