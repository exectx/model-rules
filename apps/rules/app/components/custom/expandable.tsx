import { cn } from "@/lib/utils";
import * as React from "react";

export interface DetailsProps
  extends React.DetailsHTMLAttributes<HTMLDetailsElement> {}

export function Expandable({ children, className, ...props }: DetailsProps) {
  return (
    <details
      className={cn(
        "border text-base w-full overflow-hidden rounded-md",
        "open:details-content:[block-size:auto]",
        "details-content:[block-size:0]",
        "details-content:transition-discrete",
        "details-content:[transition-property:block-size,content-visibility]",
        "details-content:duration-500",
        className,
      )}
      {...props}
    >
      {children}
    </details>
  );
}

export function ExpandableSummary({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <summary
      className={cn(
        "flex items-center px-3 py-2 gap-2 hover:cursor-pointer text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </summary>
  );
}

export function ExpandableContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-3 grid gap-4", className)} {...props}>
      {children}
    </div>
  );
}
