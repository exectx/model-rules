import { data, Link, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/console.rules_.$slug._index";
import { ROUTE_PATH as RULES_ROUTE_PATH } from "./console.rules";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Pencil } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ROUTE_PATH as EDIT_RULES_ROUTE_PATH } from "./console.rules_.$slug.settings";
import { useRuleData } from "./console.rules_.$slug";

export default function RuleSetPage() {
  const ruleset = useRuleData();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:gap-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-light">Ruleset Details</h1>
          <Button variant="outline" asChild>
            <Link to={EDIT_RULES_ROUTE_PATH(ruleset.prefix)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{ruleset.prefix} ruleset</CardTitle>
            <CardDescription>
              Detailed information about your ruleset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableHead className="w-[180px]">Prefix</TableHead>
                  <TableCell>{ruleset.prefix}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-[180px]">Base URL</TableHead>
                  <TableCell>
                    <Button
                      asChild
                      variant={"link"}
                      size={"sm"}
                      className="p-0"
                    >
                      <Link target="_blank" to={ruleset.baseUrl}>
                        {ruleset.baseUrl}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>API Key</TableHead>
                  <TableCell>
                    <div className="flex items-center select-none">
                      <span className="tabular-nums tracking-wide font-mono text-xs">
                        {"•".repeat(15) + ruleset.apiKeyPreview}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableCell>
                    {/* Placeholder for now, replace with actual status */}
                    <Badge variant={false ? "default" : "secondary"}>
                      {false ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Created At</TableHead>
                  <TableCell>{ruleset.createdAt.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Last Updated</TableHead>
                  <TableCell>
                    {ruleset.updatedAt?.toLocaleString() ?? "-"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>model rules</CardTitle>
              <CardDescription>
                Model-specific configuration rules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ruleset.modelRules &&
              Object.keys(ruleset.modelRules).length > 0 ? (
                <Textarea
                  readOnly
                  disabled
                  value={JSON.stringify(ruleset.modelRules, null, 2)}
                  className="h-64 font-mono text-sm"
                />
              ) : (
                <div className="border rounded-md p-4 flex h-20 items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No model rules configured.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>provider rules</CardTitle>
              <CardDescription>
                Configuration rules applied to all models for this provider.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ruleset.providerRules &&
              Object.keys(ruleset.providerRules).length > 0 ? (
                <Textarea
                  readOnly
                  disabled
                  value={JSON.stringify(ruleset.providerRules, null, 2)}
                  className="h-64 font-mono text-sm"
                />
              ) : (
                <div className="border rounded-md p-4 flex h-20 items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No provider rules configured.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Future sections for rules, analytics, etc. can be added here */}
        {/* Example:
        <Card>
          <CardHeader>
            <CardTitle>Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <p>List of rules will go here...</p>
          </CardContent>
        </Card>
        */}
      </div>
    </div>
  );
}
