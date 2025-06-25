import { Link, useLoaderData } from "react-router";
import { ROUTE_PATH as KEYS_ROUTE_PATH } from "./_shell.console.keys";
import { ROUTE_PATH as NEW_RULESET_ROUTE_PATH } from "./_shell.console.rules_.new";
import type { Route } from "./+types/_shell.docs.quickstart";
import * as cookieTool from "cookie-es";
import { CodeSnippets } from "@/components/custom/code-snippet";
import { Separator } from "@/components/ui/separator";
import { dedent } from "@/lib/utils";
import type { BundledLanguage } from "shiki/bundle/web";

const snippets = [
  {
    title: "cURL",
    lang: "bash",
    code: dedent(`
    curl -X POST https://rules.exectx.run/api/chat/completions \\
    -H "Authorization: Bearer $RULES_API_KEY" \\
    -H "Content-Type: application/json" \\
    -d '{
      "model": "my-ruleset::gpt-3.5-turbo",
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
        model: "my-ruleset::gpt-3.5-turbo",
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
        model="my-ruleset::gpt-3.5-turbo",
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


export async function loader(args: Route.LoaderArgs) {
  const cookieHeader = args.request.headers.get("cookie");
  const cookies = cookieTool.parse(cookieHeader ?? "");
  return { lang: cookies["default_lang"] as string | undefined };
}

export default function Quickstart() {
  const { lang } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex flex-col gap-8 md:gap-12 max-w-4xl mx-auto w-full">
        <div className="space-y-8">
          <h1 className="text-4xl font-light">Quickstart</h1>
          <div className="space-y-4">
            <p>
              Modelrules API provides a simple way to override any API
              parameters for OpenAI-compatible LLM providers. It's ideal for
              environments where LLM clients are constrained to specific
              parameters or can't offer flexible customization.
            </p>
            <p>
              All configuration rules are applied server-side; if you prefer to
              manage them client-side, you'll need to locally run the project by
              cloning the repository.
            </p>
          </div>
        </div>
        <Separator />
        <div className="space-y-4 pt-2">
          <h2 className="text-3xl">Creating your first virtual API key</h2>
          <p>
            To get started with Modelrules, you'll need to create a{" "}
            <Link
              to={KEYS_ROUTE_PATH}
              className="text-blue-500 dark:text-blue-400 hover:opacity-80"
            >
              virtual API key
            </Link>
            .
          </p>
        </div>
        <div className="space-y-4 pt-2">
          <h2 className="text-3xl">
            Create a ruleset for a given LLM provider
          </h2>
          <p>
            Use the{" "}
            <Link
              to={NEW_RULESET_ROUTE_PATH}
              className="text-blue-500 dark:text-blue-400 hover:opacity-80"
            >
              new ruleset page
            </Link>{" "}
            to create a ruleset for a specific LLM provider or model. There, you
            can override API parameters and supply the required provider
            credentials.
          </p>
        </div>
        <div className="space-y-4 pt-2">
          <h2 className="text-3xl">Making your first request</h2>
          <p>
            After creating a ruleset, send a request to the Modelrules API as
            usual. The API will automatically apply your ruleset's parameters.
            To specify which ruleset to use, prepend its name and two colons to
            the model name. For example, with a ruleset named "my-ruleset" and
            the "gpt-3.5-turbo" model, set the model to
            "my-ruleset::gpt-3.5-turbo".
          </p>
          <div className="pt-2">
            <CodeSnippets defaultValue={lang ?? "cURL"} snippets={snippets} />
          </div>
        </div>
      </div>
    </div>
  );
}
