import type { JSX } from "react";
import { Fragment } from "react";
import { type BundledLanguage, createHighlighterCore } from "shiki/bundle/web";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { jsx, jsxs } from "react/jsx-runtime";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import ghDark from "shiki/themes/github-dark-default.mjs";
import ghLight from "shiki/themes/github-light-default.mjs";
import js from "shiki/langs/javascript.mjs";
import python from "shiki/langs/python.mjs";
import bash from "shiki/langs/bash.mjs";
import { singleton } from "@exectx/utils";

export async function highlight(code: string, lang: BundledLanguage) {
  const highlighter = await singleton("highlighter", () => {
    return createHighlighterCore({
      themes: [ghDark, ghLight],
      langs: [js, python, bash],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    });
  });

  const out = highlighter.codeToHast(code, {
    lang,
    themes: {
      dark: "github-dark-default",
      light: "github-light-default",
    },
  });

  return toJsxRuntime(out, {
    Fragment,
    jsx,
    jsxs,
  }) as JSX.Element;
}
