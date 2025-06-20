import { useMemo, useRef, useState } from "react";
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
import type { Route } from "./+types/_shell.console.keys";
import * as v from "valibot";
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
import { Ban, Check, CircleCheck, Copy, Plus, Trash } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
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
} from "@/components/ui/alert-dialog";
import { generateApiKey } from "@exectx/crypto/gen-key";
import { eq, schema, type Key } from "@exectx/db";
import { ROUTE_PATH as DELETE_KEY_ROUTE_PATH } from "./_shell.console.keys_.delete.$id";
import { ROUTE_PATH as UPDATE_KEY_STATUS_ROUTE_PATH } from "./_shell.console.keys_.update-status.$id";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { InputField } from "@/components/forms";
import { useFormCalls } from "@/hooks/use-form-calls";

export const ROUTE_PATH = "/console/keys";

const ActionSchema = v.variant("type", [
  v.object({
    type: v.literal("create"),
    name: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(2, "The strings must be at least 2 characters long."),
      v.check((input) => !input.includes(" "), "No spaces allowed.")
      // v.rawCheck((c) => {
      //   if (Math.random() < 0.5) {
      //     c.addIssue({ message: "Test error." });
      //     c.addIssue({ message: "Test error 2." });
      //   } else {
      //     c.addIssue({ message: "Test error 3." });
      //   }
      // })
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
      // form: submission.reply({ fieldErrors: {}, resetForm: true }),
      form: submission.reply(),
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

function CreateApiKeyForm(props: { onSuccess?: () => void }) {
  const fetcher = useFetcher<typeof action>({ key: `keys:create` });
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

  useFormCalls({
    formResult: fetcher.data?.form,
    actionResult: fetcher.data,
    onSuccess: props.onSuccess,
  });

  return (
    <>
      <fetcher.Form method="post" {...getFormProps(form)} action={ROUTE_PATH}>
        <fieldset
          disabled={fetcher.state !== "idle"}
          className="group grid gap-6"
        >
          <Input {...getInputProps(fields.type, { type: "hidden" })} />
          <InputField
            inputProps={getInputProps(fields.name, { type: "text" })}
            labelProps={{ children: "Name" }}
            helper="Name should not contain spaces."
            errors={fields.name.errors}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button
              type="submit"
              form={form.id}
              className="items-center justify-center"
            >
              <span className="absolute group-enabled:opacity-0">
                <Spinner className="bg-primary-foreground" />
              </span>
              <span className="group-disabled:opacity-0">Add</span>
            </Button>
          </DialogFooter>
        </fieldset>
      </fetcher.Form>
    </>
  );
}

export function DisplayApiKey() {
  const fetcher = useFetcher<typeof action>({ key: `keys:create` });
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  if (!fetcher.data?.result || fetcher.data?.result?.type !== "create")
    return null;
  const key = fetcher.data.result.key;
  return (
    <>
      <div className="rounded-lg text-muted-foreground border p-4 font-mono text-sm ">
        <p className="break-all">{key}</p>
      </div>

      <DialogFooter>
        <Button
          onClick={() => copyToClipboard(key)}
          {...(isCopied ? { "data-copied": "" } : {})}
          className="items-center group justify-center min-w-24 active:bg-blue-400!"
          // aria-label={isCopied ? "Copied" : "Copy API Key"}
        >
          <Check className="size-3 not-group-data-copied:hidden" />
          <Copy className="size-3 group-data-copied:hidden" />
          <span className="group-data-copied:hidden">Copy</span>
          <span className="not-group-data-copied:hidden">Copied</span>
        </Button>
      </DialogFooter>
    </>
  );
}

export function CreateApiKeyDialog() {
  const [formOpen, setFormOpen] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);

  return (
    <>
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="size-4" />
            Create Key
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px] gap-6 rounded-2xl"
          // style={{ display: keyOpen ? "none" : undefined }}
        >
          <DialogHeader>
            <DialogTitle className="font-normal">Create API Key</DialogTitle>
            <DialogDescription asChild>
              <p>Give your key a name so you can easily identify it later.</p>
            </DialogDescription>
          </DialogHeader>
          <CreateApiKeyForm
            onSuccess={() => {
              setFormOpen(false);
              setTimeout(() => {
                setKeyOpen(true);
              }, 0);
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={keyOpen} onOpenChange={setKeyOpen} defaultOpen={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-normal">API Key</DialogTitle>
            <DialogDescription>
              This is your API key. Keep it safe!
            </DialogDescription>
          </DialogHeader>
          <DisplayApiKey />
        </DialogContent>
      </Dialog>
    </>
  );
}

function KeyStatusUpdateDialogContent({ row }: { row: { original: Key } }) {
  const statusUpdateFetcher = useFetcher<typeof action>({
    key: `key:status-update:${row.original.id}`,
  });
  const isStatusUpdatePending = statusUpdateFetcher.state !== "idle";

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle className="font-normal">
          Are you sure you want to{" "}
          {row.original.disabledAt ? "enable" : "disable"} this API key?
        </AlertDialogTitle>
        <AlertDialogDescription>
          This will {row.original.disabledAt ? "enable" : "disable"} your API
          key.
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
              variant: row.original.disabledAt ? "default" : "destructive",
            })}
            type="submit"
            disabled={isStatusUpdatePending}
            // onClick={(e) => {}}
          >
            {row.original.disabledAt ? "Enable" : "Disable"}
          </AlertDialogAction>
        </statusUpdateFetcher.Form>
      </AlertDialogFooter>
    </>
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

          <AlertDialog
            open={statusDialog}
            onOpenChange={setStatusDialog}
            defaultOpen={false}
          >
            {/* <AlertDialogContent>
              <KeyStatusUpdateDialogContent row={row} />
            </AlertDialogContent> */}
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

          <AlertDialog
            open={deleteDialog}
            onOpenChange={setDeleteDialog}
            defaultOpen={false}
          >
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

// TODO: pagination, selection, actions
export default function APIKeysPage() {
  const { keys } = useLoaderData<typeof loader>();
  const { deletes, statusUpdates } = usePendingKeys();

  const _keys = useMemo(() => {
    // Use a single loop for efficiency
    const deletesSet = new Set(deletes);
    const statusUpdatesSet = new Set(statusUpdates);

    const result: typeof keys = [];
    for (const key of keys) {
      if (deletesSet.has(key.id)) continue;
      if (statusUpdatesSet.has(key.id)) {
        result.push({ ...key, disabledAt: key.disabledAt ? null : new Date() });
      } else {
        result.push(key);
      }
    }
    return result;
  }, [keys, deletes, statusUpdates]);

  const table = useReactTable({
    data: _keys,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    // getSortedRowModel: getSortedRowModel(),
    // getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 md:gap-6 max-w-5xl mx-auto w-full">
        <div className="bg-card rounded-xl p-6 flex border flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-light">API keys</h1>
            <CreateApiKeyDialog />
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
