import * as React from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  title?: string;
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({
  title,
  code,
  language = "javascript",
  className,
}: CodeBlockProps) {
  return (
    <div
      className={cn(
        "rounded-md overflow-hidden border border-border",
        className,
      )}
    >
      {title && (
        <div className="bg-muted px-4 py-2 border-b border-border">
          <p className="text-sm">{title}</p>
        </div>
      )}
      <pre className="p-4 overflow-x-auto bg-muted/50 text-sm font-mono h-full">
        <code>{code}</code>
      </pre>
    </div>
  );
}
