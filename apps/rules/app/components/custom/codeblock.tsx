import { singleton } from "@exectx/utils";
import { type JSX, use, useLayoutEffect, useState } from "react";
import type { BundledLanguage } from "shiki/bundle/web";
// import { highlight } from "@/lib/shiki/shared";

const cache = new Map<string, any>();

export function CodeBlock({
  initial,
  code,
  lang,
}: {
  initial?: JSX.Element;
  code: string;
  lang: BundledLanguage;
}) {
  let [nodes, setNodes] = useState(initial);
  useLayoutEffect(() => {
    void singleton("highlight-import", async () => {
      const { highlight } = await import("@/lib/shiki/shared");
      return highlight;
    }).then((fn) => {
      fn(code, lang).then((highlightedNodes) => {
        setNodes(highlightedNodes);
      });
    });
  }, []);

  return nodes ?? <p>Loading...</p>;
}
