import { Link, useLoaderData } from "react-router";
import { ROUTE_PATH as KEYS_ROUTE_PATH } from "./_shell.console.keys";
import { ROUTE_PATH as NEW_RULESET_ROUTE_PATH } from "./_shell.console.rules_.new";
import type { Route } from "./+types/_shell.docs.quickstart";
import * as cookieTool from "cookie-es";
import { CodeSnippets } from "@/components/custom/code-snippet";
import { snippets } from "./_shell.docs._index";

export async function loader(args: Route.LoaderArgs) {
  const cookieHeader = args.request.headers.get("cookie");
  const cookies = cookieTool.parse(cookieHeader ?? "");
  return { lang: cookies["default_lang"] as string | undefined };
}

/**
 * Quickstart
 *
 * Renders a concise introduction to the Modelrules API, illustrating how it
 * seamlessly overrides OpenAI-compatible LLM parameters. Ideal for environments
 * where client-side SDKs have limited configurability.
 *
 * All parameter customization is performed server-side. While the app could be
 * run locally, it is provided as a hosted service for simplicity and broad
 * accessibility.
 *
 * @returns JSX.Element containing the quickstart documentation layout
 */
export default function Quickstart() {
  const { lang } = useLoaderData<typeof loader>();
  return (
    <div className="p-4">
      <div className="flex flex-col gap-8 md:gap-12 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          <h1 className="text-4xl font-light">Quickstart</h1>
          <div className="space-y-4">
            <p>
              Modelrules API provides a simple way to override any API parameters
              for OpenAI-compatible LLM providers. It's ideal for environments
              where LLM clients are constrained to specific parameters or can't
              offer flexible customization.
            </p>
            <p>
              All configuration is applied server-side: while this app could
              theoretically run locally on your computer, it's offered as a
              hosted service for ease of use and accessibility.
            </p>
          </div>
        </div>
        <div className="space-y-4 pt-2">
          <h2 className="text-2xl font-light">
            Creating your first virtual API key
          </h2>
          <p>
            To get started with Modelrules, you'll need to create a
            <Link
              to={KEYS_ROUTE_PATH}
              className="underline mx-1 text-muted-foreground underline-offset-4"
            >
              virtual API key
            </Link>
            .
          </p>
        </div>
        <div className="space-y-4 pt-2">
          <h2 className="text-2xl font-light">
            Create a ruleset for a given LLM provider
          </h2>
          <p>
            Use the
            <Link
              to={NEW_RULESET_ROUTE_PATH}
              className="underline mx-1 text-muted-foreground underline-offset-4"
            >
              new ruleset page
            </Link>
            to create a ruleset for a specific LLM provider or model. There, you
            can override API parameters and supply the required provider
            credentials.
          </p>
        </div>
        <div className="space-y-4 pt-2">
          <h2 className="text-2xl font-light">Making your first request</h2>
          <p>
            After creating a ruleset, send a request to the Modelrules API as
            usual. The API will automatically apply your ruleset's parameters. To
            specify which ruleset to use, prepend its name and two colons to
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
