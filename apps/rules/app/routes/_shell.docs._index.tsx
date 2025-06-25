import type { Route } from "./+types/_shell.docs._index";
import * as cookieTool from "cookie-es";
import { CodeSnippets } from "@/components/custom/code-snippet";
import { useLoaderData } from "react-router";
import type { BundledLanguage } from "shiki/bundle/web";
import { dedent } from "@/lib/utils";

const snippets = [
  {
    title: "cURL",
    lang: "bash",
    code: dedent(`
    curl -X POST https://rules.exectx.run/api/chat/completions \\
    -H "Authorization: Bearer $RULES_API_KEY" \\
    -H "Content-Type: application/json" \\
    -d '{
      "model": "<USER_DEFINED_PREFIX>::<MODEL_NAME>",
      "messages": [{
        "role": "user", 
        "content": "What is the capital of France?"
      }],
    }'`),
  },
  {
    title: "JavaScript",
    lang: "javascript",
    code: dedent(`
    import OpenAI from "openai";

    const openai = new OpenAI({
      apiKey: process.env.RULES_API_KEY,
      baseURL: "https://rules.exectx.run/api",
    });

    async function main() {
      const chatCompletion = await openai.chat.completions.create({
        model: "<USER_DEFINED_PREFIX>::<MODEL_NAME>",
        messages: [{
          role: "user",
          content: "What is the capital of France?",
        }],
      });

      console.log(chatCompletion.choices[0].message.content);
    }

    main();
  `),
  },
  {
    title: "Python",
    lang: "python",
    code: dedent(`
    import os
    from openai import OpenAI

    client = OpenAI(
        api_key=os.environ.get("RULES_API_KEY"),
        base_url="https://rules.exectx.run/api",
    )

    chat_completion = client.chat.completions.create(
        model="<USER_DEFINED_PREFIX>::<MODEL_NAME>",
        messages=[
            {
                "role": "user",
                "content": "What is the capital of France?",
            }
        ],
    )

    print(chat_completion.choices[0].message.content)
  `),
  },
] satisfies Array<{ title: string; lang: BundledLanguage; code: string }>;

// NOTE: for prerendering, we need to disable the loading of WASM in the loader based on the previous attempt to prerender
// export async function loader() {
//   // @ts-ignore
//   await loadWasm(import("../assets/onig.wasm"));
//   console.log("Loading WASM for Shiki...", import.meta.env.MODE);

//   const highlighter = await createHighlighterCore({
//     themes: [ghDark, ghLight],
//     langs: [js, python, bash],
//     engine: createOnigurumaEngine(() => import("shiki/wasm")),
//   });

//   const highlightedSnippets = await Promise.all(
//     snippets.map(async (snippet) => ({
//       ...snippet,
//       code: highlighter.codeToHtml(snippet.code, {
//         lang: snippet.lang,
//         themes: {
//           dark: ghDark,
//           light: ghLight,
//         },
//       }),
//     }))
//   );

//   return data(
//     { highlightedSnippets }
//   );
// }

export async function loader(args: Route.LoaderArgs) {
  const cookieHeader = args.request.headers.get("cookie");
  const cookies = cookieTool.parse(cookieHeader ?? "");
  return { lang: cookies["default_lang"] as string | undefined };
}

export default function DocsPage() {
  const highlightedSnippets = snippets;
  const { lang } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex flex-col gap-8 md:gap-12 max-w-4xl mx-auto w-full">
        <div className="space-y-8">
          <h1 className="text-4xl font-light">Overview</h1>
          <div className="space-y-4">
            <p>
              Modelrules is a ruleset engine that rewrites LLM API parameters
              according to user-defined rules and routes them to the configured
              LLM endpoint provider.
            </p>
            <p>Here you have an example of how to use the Modelrules API:</p>
          </div>
          <CodeSnippets
            defaultValue={lang ?? "cURL"}
            snippets={highlightedSnippets}
          />
        </div>
      </div>
    </div>
  );
}
