import { useEffect, useMemo, useRef, useState } from "react";
import { getValibotConstraint, parseWithValibot } from "@conform-to/valibot";
import {
  getFormProps,
  getInputProps,
  useForm,
  type SubmissionResult,
} from "@conform-to/react";
import {
  data,
  redirect,
  useFetcher,
  useFetchers,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/console.keys";
import * as v from "valibot";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangleIcon,
  Ban,
  Check,
  CircleCheck,
  Copy,
  Plus,
  Trash,
} from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { generateApiKey } from "@exectx/crypto/gen-key";
import { eq, schema, type Key } from "@exectx/db";
import { ROUTE_PATH as DELETE_KEY_ROUTE_PATH } from "./console.keys_.delete.$id";
import { ROUTE_PATH as UPDATE_KEY_STATUS_ROUTE_PATH } from "./console.keys_.update-status.$id";
import { Badge } from "@/components/ui/badge";

export const ROUTE_PATH = "/console/keys";

const ActionSchema = v.variant("type", [
  v.object({
    type: v.literal("create"),
    name: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(2, "The strings must be at least 2 characters long")
    ),
  }),
  v.object({
    type: v.literal("delete"),
    id: v.string(),
  }),
]);

type ActionSchema = v.InferOutput<typeof ActionSchema>;

export async function loader(args: Route.LoaderArgs) {
  const { db } = args.context.services;
  const userId = args.context.auth?.userId;
  if (!userId) return redirect("/auth/sign-in");
  const keys = await db.query.keys.findMany({
    where: (keys, { eq, isNull, and }) =>
      and(eq(keys.userId, userId), isNull(keys.deletedAt)),
  });
  return { userId, keys };
}

type ActionResult = {
  form: SubmissionResult<string[]>;
  result?:
    | {
        type: "create";
        key: string;
      }
    | {
        type: "delete";
        id: string;
      };
};

// TODO: remove discriminated union and use this action for creation only
export async function action(args: Route.ActionArgs) {
  const { db } = args.context.services;
  const userId = args.context.auth?.userId;
  if (!userId) throw data(null, { status: 401 });

  const formData = await args.request.formData();
  const submission = parseWithValibot(formData, { schema: ActionSchema });
  if (submission.status !== "success") {
    return data<ActionResult>(
      { form: submission.reply() },
      {
        status: submission.status === "error" ? 400 : 500,
      }
    );
  }

  const { type } = submission.value;
  if (type === "create") {
    const { hash, key } = await generateApiKey(100, "sk-rules-v0");
    await db.insert(schema.keys).values({
      userId,
      name: submission.value.name,
      hash,
      preview: `${key.substring(0, 16)}...${key.substring(key.length - 4)}`,
    });
    // await new Promise((resolve) => setTimeout(resolve, 1500));
    return data<ActionResult>({
      form: submission.reply({ fieldErrors: {} }),
      result: { type: "create", key },
    });
  } else {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // throw new Error("Failed to delete key");
    await db.delete(schema.keys).where(eq(schema.keys.id, submission.value.id));
    return data<ActionResult>({
      form: submission.reply({ fieldErrors: {} }),
      result: { type: "delete", id: submission.value.id },
    });
  }
}

export function CreateApiKeyFormDialog() {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher<typeof action>({ key: `keys:create` });
  const isPending = fetcher.state !== "idle";
  // const actionData = useActionData<typeof action>();
  const actionData = fetcher.data;
  const [actionResult, setActionResult] = useState<ActionResult["result"]>();

  const [form, fields] = useForm({
    defaultValue: {
      type: "create",
    },
    lastResult: fetcher.data?.form,
    constraint: getValibotConstraint(ActionSchema),
    onValidate({ formData }) {
      return parseWithValibot(formData, { schema: ActionSchema });
    },
  });

  useEffect(() => {
    setActionResult(actionData?.result);
  }, [actionData]);

  function resetActionResult() {
    setActionResult(undefined);
  }

  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          form.reset();
          // account for dialog close/open animation
          setTimeout(() => {
            resetActionResult();
          }, 200);
        }
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Create Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] gap-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-normal">
            {actionResult?.type !== "create"
              ? "Create API Key"
              : "Save your API key"}
          </DialogTitle>
          <DialogDescription asChild>
            {actionResult?.type !== "create" ? (
              <p>Give your key a name so you can easily identify it later.</p>
            ) : (
              <div className="flex justify-between items-center">
                <p>You will not be able to see your key again.</p>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 min-w-22"
                    onClick={() => copyToClipboard(actionResult.key)}
                  >
                    {isCopied ? (
                      <Check className="size-3" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {isCopied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form
          method="post"
          className="gap-6"
          {...getFormProps(form)}
          action="/console/keys"
          style={{
            display: actionResult?.type !== "create" ? "grid" : "none",
          }}
        >
          <Input {...getInputProps(fields.type, { type: "hidden" })} />
          <div className="grid items-center gap-3">
            <Label htmlFor={fields.name.id} className="text-muted-foreground">
              Name your key
            </Label>
            <Input
              required
              placeholder="my test key for ai agents"
              autoComplete="off"
              className="col-span-3"
              aria-invalid={Boolean(fields.name.errors)}
              {...getInputProps(fields.name, { type: "text" })}
            />
            {fields.name.errors && (
              <p className="text-destructive-foreground text-sm">
                {fields.name.errors.join(",")}
              </p>
            )}
          </div>
        </fetcher.Form>
        <div
          className="rounded-lg text-muted-foreground border p-3.5 font-mono text-sm break-all"
          style={{
            display: actionResult?.type === "create" ? "block" : "none",
          }}
        >
          {actionResult?.type === "create" && actionResult?.key}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              {actionResult?.type === "create" ? "Close" : "Cancel"}
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form={form.id}
            className="min-w-20"
            disabled={isPending || !form.dirty}
            style={{
              display: actionResult?.type === "create" ? "none" : "inline-flex",
            }}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const columns: ColumnDef<Key>[] = [
  {
    accessorKey: "name",
    header: "Key",
    cell: ({ row }) => {
      const disabled = row.original.disabledAt;
      return (
        <div className="grid">
          <div className="flex items-center gap-2 h-[22px]">
            <span>{row.getValue<string>("name")}</span>
            {
              <Badge
                variant="secondary"
                style={{
                  display: !disabled ? "none" : undefined,
                }}
              >
                Disabled
              </Badge>
            }
          </div>
          <div className="truncate text-muted-foreground">
            {row.original.preview}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("createdAt")).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "lastUsed",
    header: "Last Used",
    cell: ({ row }) => {
      const lastUsed = row.getValue<Key["lastUsed"]>("lastUsed");
      return <div>{lastUsed ? new Date(lastUsed).toLocaleString() : "—"}</div>;
    },
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const [deleteDialog, setDeleteDialog] = useState(false);
      const [statusDialog, setStatusDialog] = useState(false);
      const deleteFetcher = useFetcher<typeof action>({
        key: `key:delete:${row.original.id}`,
      });
      const statusUpdateFetcher = useFetcher<typeof action>({
        key: `key:status-update:${row.original.id}`,
      });
      const isDeletePending = deleteFetcher.state !== "idle";
      const isStatusUpdatePending = statusUpdateFetcher.state !== "idle";

      return (
        <div className="text-right">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 relative border bg-transparent dark:bg-transparent border-transparent dark:border-transparent hover:border-border"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                variant={row.original.disabledAt ? "default" : "destructive"}
                data-key-enabled={!Boolean(row.original.disabledAt)}
                className="group"
                onSelect={() => {
                  setStatusDialog(true);
                }}
              >
                <CircleCheck className="size-4 group-data-[variant=destructive]:hidden" />
                <Ban className="size-4 group-data-[variant=default]:hidden" />
                {row.original.disabledAt ? "Enable" : "Disable"}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  setDeleteDialog(true);
                }}
              >
                <Trash className="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={statusDialog} onOpenChange={setStatusDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-normal">
                  Are you sure you want to{" "}
                  {row.original.disabledAt ? "enable" : "disable"} this API key?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will {row.original.disabledAt ? "enable" : "disable"}
                  your API key.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <statusUpdateFetcher.Form
                  method="POST"
                  className="contents"
                  action={UPDATE_KEY_STATUS_ROUTE_PATH(row.original.id)}
                >
                  <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({
                      variant: row.original.disabledAt
                        ? "default"
                        : "destructive",
                    })}
                    type="submit"
                    disabled={isStatusUpdatePending}
                  >
                    {row.original.disabledAt ? "Enable" : "Disable"}
                  </AlertDialogAction>
                </statusUpdateFetcher.Form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-normal">
                  Are you sure you want to delete this API key?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your API key.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <deleteFetcher.Form
                  method="DELETE"
                  className="contents"
                  action={DELETE_KEY_ROUTE_PATH(row.original.id)}
                >
                  <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: "destructive" })}
                    type="submit"
                    disabled={isDeletePending}
                  >
                    Delete
                  </AlertDialogAction>
                </deleteFetcher.Form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];

function usePendingKeys(): { deletes: string[]; statusUpdates: string[] } {
  const fetchers = useFetchers();
  const stableDeletesRef = useRef<string[]>([]);
  const stableStatusUpdatesRef = useRef<string[]>([]);

  const currentDeletes = useMemo(() => {
    const result: string[] = [];
    for (const f of fetchers) {
      if (!f.key.startsWith("key:delete:")) continue;
      const id = f.key.replace("key:delete:", "");
      if (!id) continue;
      result.push(id);
    }
    result.sort();
    return result;
  }, [fetchers]);

  const currentStatusUpdates = useMemo(() => {
    const result: string[] = [];
    for (const f of fetchers) {
      if (!f.key.startsWith("key:status-update:")) continue;
      const id = f.key.replace("key:status-update:", "");
      if (!id) continue;
      result.push(id);
    }
    result.sort();
    return result;
  }, [fetchers]);

  if (currentDeletes.join(",") !== stableDeletesRef.current.join(",")) {
    stableDeletesRef.current = currentDeletes;
  }
  if (
    currentStatusUpdates.join(",") !== stableStatusUpdatesRef.current.join(",")
  ) {
    stableStatusUpdatesRef.current = currentStatusUpdates;
  }

  return {
    deletes: stableDeletesRef.current,
    statusUpdates: stableStatusUpdatesRef.current,
  };
}

export default function APIKeysPage() {
  const { keys } = useLoaderData<typeof loader>();
  const { deletes, statusUpdates } = usePendingKeys();

  const _keys = useMemo(() => {
    return keys
      .filter((key) => !deletes.includes(key.id))
      .map((key) => {
        // Apply optimistic status update if this key has a pending status change
        if (statusUpdates.includes(key.id)) {
          return {
            ...key,
            disabledAt: key.disabledAt ? null : new Date(),
          };
        }
        return key;
      });
  }, [keys, deletes, statusUpdates]);

  const table = useReactTable({
    data: _keys,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 md:gap-6 max-w-5xl mx-auto w-full">
        <div className="bg-card rounded-xl p-6 flex border flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-light">API keys</h1>
            <CreateApiKeyFormDialog />
          </div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow className="*:uppercase" key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No API keys found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
