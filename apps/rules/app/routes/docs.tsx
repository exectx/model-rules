import { CodeBlock } from "@/components/custom/codeblock";

function dedent(str: string) {
  const lines = str.split("\n");

  if (lines[0].trim() === "") {
    lines.shift();
  }
  if (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  const minIndent = Math.min(
    ...lines
      .filter((line) => line.trim())
      .map((line) => line.match(/^\s*/)?.[0].length ?? 0)
  );

  if (minIndent === Infinity) {
    return lines.join("\n");
  }

  return lines.map((line) => line.slice(minIndent)).join("\n");
}

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
      apiKey: process.env.RULES_API_KEY, // or your Rules API key
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
] as const;


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

export default function DocsPage() {
  // const { highlightedSnippets } = useLoaderData<typeof loader>();
  const highlightedSnippets = snippets;
  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 md:gap-6 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-light">API Documentation</h1>
        <div>
          <p className="">
            Rewrite LLM API parameters according to user defined rules, and
            route them to the corresponding LLM endpoint.
          </p>
        </div>
        <div className=" grid gap-4 p-4 rounded-4xl border">
          {highlightedSnippets.map((snippet) => (
            <div key={snippet.title} className="rounded-2xl border min-w-0">
              <h2 className="font-medium">{snippet.title}</h2>
              <div className="text-sm font-mono [&_pre]:overflow-auto [&_pre]:p-2">
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
              {/* Uncomment the line below to render raw HTML if needed */}
              {/* <div dangerouslySetInnerHTML={{ __html: snippet.code }} className="text-sm" /> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
