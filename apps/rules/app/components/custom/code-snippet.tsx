import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { CodeBlock } from "@/components/custom/codeblock";
import type { BundledLanguage } from "shiki/bundle/web";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Check, Copy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const SNIPPET_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function CodeSnippets({
  snippets,
  defaultValue,
  langCookieName = "default_lang",
}: {
  snippets: Array<{ title: string; lang: BundledLanguage; code: string }>;
  defaultValue: string;
  langCookieName?: string;
}) {
  let { isCopied, copyToClipboard } = useCopyToClipboard();
  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={(value) => {
        if (
          typeof window !== "undefined" &&
          // @ts-ignore
          window.cookieStore
        ) {
          // @ts-ignore
          window.cookieStore.set({
            name: langCookieName,
            value,
            expires: Date.now() + SNIPPET_COOKIE_MAX_AGE * 1000,
          });
        } else {
          document.cookie = `${langCookieName}=${value}; path=/; max-age=${SNIPPET_COOKIE_MAX_AGE}`;
        }
      }}
      className="gap-0 relative bg-card border rounded-[0.75rem]"
    >
      <ScrollArea className="border-b">
        <TabsList className="gap-1 bg-transparent">
          {snippets.map((snippet) => (
            <TabsTrigger
              key={snippet.title}
              value={snippet.title}
              className="data-[state=active]:bg-secondary hover:bg-muted data-[state=inactive]:font-normal data-[state=active]:text-secondary-foreground rounded-md data-[state=active]:shadow-none"
            >
              {snippet.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {snippets.map((snippet) => (
        <TabsContent key={snippet.title} value={snippet.title}>
          <div className="text-sm font-mono [&_pre]:overflow-auto [&_pre]:p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  {...(isCopied ? { "data-copied": "" } : {})}
                  className="absolute top-1 h-7 w-7 right-1 z-10 rounded-md group"
                  onClick={() => copyToClipboard(snippet.code)}
                >
                  <Check className="size-3 not-group-data-copied:hidden" />
                  <Copy className="size-3 group-data-copied:hidden" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isCopied ? "Copied" : "Copy to clipboard"}
              </TooltipContent>
            </Tooltip>
            <CodeBlock
              lang={snippet.lang}
              code={snippet.code}
              initial={
                <pre>
                  <code>{snippet.code}</code>
                </pre>
              }
            />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function CodeSnippet({
  snippet,
  className,
}: {
  snippet: { title?: string; lang: BundledLanguage; code: string };
  className?: string;
}) {
  let { isCopied, copyToClipboard } = useCopyToClipboard();
  return (
    <div
      className={`relative bg-card border rounded-[0.75rem] ${className ?? ""}`}
    >
      <div className="text-sm font-mono [&_pre]:overflow-auto [&_pre]:p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              {...(isCopied ? { "data-copied": "" } : {})}
              className="absolute top-1 h-7 w-7 right-1 z-10 rounded-md group"
              onClick={() => copyToClipboard(snippet.code)}
            >
              <Check className="size-3 not-group-data-copied:hidden" />
              <Copy className="size-3 group-data-copied:hidden" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="relative w-32 h-6 flex items-center justify-center overflow-hidden">
            <span
              className={`absolute left-0 right-0 transition-all duration-200 ease-in-out ${isCopied ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
              aria-hidden={isCopied}
            >
              Copy to clipboard
            </span>
            <span
              className={`absolute left-0 right-0 transition-all duration-200 ease-in-out ${isCopied ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
              aria-hidden={!isCopied}
            >
              Copied
            </span>
          </TooltipContent>
        </Tooltip>
        <CodeBlock
          lang={snippet.lang}
          code={snippet.code}
          initial={
            <pre>
              <code>{snippet.code}</code>
            </pre>
          }
        />
      </div>
    </div>
  );
}
