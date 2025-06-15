import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { ClerkProvider } from "@clerk/react-router";

import type { Route } from "./+types/root";
import globalStyles from "./app.css?url";
import { rootAuthLoader } from "@clerk/react-router/ssr.server";
import { EpicProgress } from "./components/progress-bar";
import { useOsTheme } from "./hooks/use-os-theme";
import { dark } from "@clerk/themes";

export async function loader(args: Route.LoaderArgs) {
  return rootAuthLoader(args);
}

export const links: Route.LinksFunction = () => [
  { rel: "preload", href: globalStyles, as: "style", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: globalStyles, crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;200;300;400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap",
  },
  // <link
  //   href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;200;300;400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap"
  //   rel="stylesheet"
  // />
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Model Rules</title>
        <Meta />
        <Links />
        {import.meta.env.DEV && (
          <script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          />
        )}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const loaderData = useLoaderData<typeof loader>();
  const theme = useOsTheme();
  return (
    <ClerkProvider
      loaderData={loaderData}
      signInFallbackRedirectUrl={"/console"}
      signUpFallbackRedirectUrl={"/console"}
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
      }}
    >
      <Outlet />
      <EpicProgress />
    </ClerkProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
