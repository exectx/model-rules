import {
  Form,
  Link,
  useLoaderData,
  redirect,
  useFetcher,
  data,
  useFetchers,
} from "react-router";
import type { Route } from "./+types/console.rules";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { eq, schema } from "@exectx/db";
import { getAuth } from "@clerk/react-router/ssr.server";
import {
  Ban,
  CheckCircle,
  Edit,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useRef, useState } from "react";
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
import * as v from "valibot";
import { parseWithValibot } from "@conform-to/valibot";
import { ROUTE_PATH as DELETE_RULE_ROUTE_PATH } from "./console.rules_.delete.$id";

export const ROUTE_PATH = "/console/rules";

export async function loader(args: Route.LoaderArgs) {
  const { db } = args.context.services;
  const userId = args.context.auth?.userId;
  if (!userId) return redirect("/auth/sign-in");
  const query = db.query.rules.findMany({
    where: (rules, { eq, and, isNull }) =>
      and(eq(rules.userId, userId), isNull(rules.deletedAt)),
    columns: {
      id: true,
      prefix: true,
      baseUrl: true,
      isDefault: true,
    },
  });
  return { userId, rules: await query };
}

const RuleActionClientSchema = v.variant("type", [
  v.object({
    type: v.literal("delete"),
    id: v.string(),
  }),
  v.object({
    type: v.literal("setDefault"),
    id: v.string(),
  }),
]);

export async function action(args: Route.ActionArgs) {
  const { db } = args.context.services;
  const userId = args.context.auth?.userId;
  if (!userId) throw data({ error: "Not authorized" }, { status: 401 });
  const formData = await args.request.formData();
  const submission = parseWithValibot(formData, {
    schema: RuleActionClientSchema,
  });
  if (submission.status !== "success") {
    return data(submission.reply(), {
      status: submission.status === "error" ? 400 : 500,
    });
  }
  const { type, id } = submission.value;
  if (type === "delete") {
    // ignoring soft delete for now
    await db.delete(schema.rules).where(eq(schema.rules.id, id));
    return data(submission.reply({ fieldErrors: {} }));
  } else {
    throw new Error("Not implemented");
  }
}

// type LoaderData = SerializeFrom<j
type RuleItem = ReturnType<
  typeof useLoaderData<typeof loader>
>["rules"][number];

const columns: ColumnDef<RuleItem>[] = [
  {
    accessorKey: "prefix",
    header: "Prefix",
    cell: (info) => {
      const rule = info.row.original;
      return (
        <Link
          to={`/console/rules/${rule.prefix}`}
          data-table-row-link
          className="static -my-0.5 before:pointer-events-auto before:absolute before:left-0 before:top-0 before:z-0 before:block before:h-full before:w-full before:cursor-pointer flex w-full min-w-0 max-w-64 flex-col"
        >
          {rule.prefix}
        </Link>
      );
    },
  },
  {
    accessorKey: "baseUrl",
    header: "Base URL",
  },
  {
    accessorKey: "isDefault",
    header: "Default",
    cell: ({ row }) => (row.original.isDefault ? "Yes" : "No"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rule = row.original;
      const fetcher = useFetcher<typeof action>({
        key: `rules:delete:${rule.id}`,
      });
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
      const isPending = fetcher.state !== "idle";

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
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to={`/console/rules/${rule.prefix}/settings`}>
                  <Settings className="size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="destructive"
                // className="[&>svg]:text-destructive-foreground! text-destructive-foreground!"
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  ruleset for "{rule.prefix}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <fetcher.Form
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
                </fetcher.Form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];

function usePendingDeletes(): string[] {
  const fetchers = useFetchers();
  const stableDeletesRef = useRef<string[]>([]);
  const currentDeletes = useMemo(() => {
    const result: string[] = [];
    for (const f of fetchers) {
      if (!f.formData) continue;
      const formDataObj = Object.fromEntries(f.formData.entries());
      const parsed = v.safeParse(RuleActionClientSchema, formDataObj);
      if (!parsed.success) continue;
      if (parsed.output.type !== "delete") continue;
      result.push(parsed.output.id);
    }
    result.sort();
    return result;
  }, [fetchers]);

  if (currentDeletes.join(",") !== stableDeletesRef.current.join(",")) {
    stableDeletesRef.current = currentDeletes;
  }
  return stableDeletesRef.current;
}

export default function RulesPage() {
  const { rules } = useLoaderData<typeof loader>();
  const deletes = usePendingDeletes();
  const _rules = useMemo(() => {
    return rules.filter((rule) => !deletes.includes(rule.id));
  }, [rules, deletes]);

  const table = useReactTable({
    data: _rules,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 md:gap-6 max-w-5xl mx-auto w-full">
        <div className="bg-card rounded-xl p-6 flex border flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-light">Rules</h1>
            <Button asChild>
              <Link to="/console/rules/new">
                <Plus className="size-4" />
                Create Rules
              </Link>
            </Button>
          </div>

          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow className="*:uppercase" key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group/table-row has-[[data-table-row-link]]:relative has-[[data-table-row-link]]:isolate [&:has([data-table-row-link])_:where(a,button)]:z-1"
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
                    No rulesets found.
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
