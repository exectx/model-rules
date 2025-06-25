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
import { EpicProgress } from "./components/progress-bar";
import { useOsTheme } from "./hooks/use-os-theme";
import { dark } from "@clerk/themes";
import type { ClerkClient } from "@clerk/react-router/api.server";

type Auth = ReturnType<
  Awaited<ReturnType<ClerkClient["authenticateRequest"]>>["toAuth"]
>;
type RequestState = Awaited<ReturnType<ClerkClient["authenticateRequest"]>>;

export const debugRequestState = (params: RequestState) => {
  const {
    isSignedIn,
    isAuthenticated,
    proxyUrl,
    reason,
    message,
    publishableKey,
    isSatellite,
    domain,
  } = params;
  return {
    isSignedIn,
    isAuthenticated,
    proxyUrl,
    reason,
    message,
    publishableKey,
    isSatellite,
    domain,
  };
};

// NOTE: custom clerk state object wrapper
// https://github.com/clerk/javascript/blob/main/packages/react-router/src/ssr/utils.ts

function getResponseClerkState(auth: Auth, requestState: RequestState) {
  const clerkState = {
    __clerk_ssr_state: auth,
    __publishableKey: requestState.publishableKey,
    __proxyUrl: requestState.proxyUrl,
    __domain: requestState.domain,
    __isSatellite: requestState.isSatellite,
    __signInUrl: requestState.signInUrl,
    __signUpUrl: requestState.signUpUrl,
    __afterSignInUrl: requestState.afterSignInUrl,
    __afterSignUpUrl: requestState.afterSignUpUrl,
    // @ts-ignore
    __signInForceRedirectUrl: requestState.signInForceRedirectUrl,
    // @ts-ignore
    __signUpForceRedirectUrl: requestState.signUpForceRedirectUrl,
    // @ts-ignore
    __signInFallbackRedirectUrl: requestState.signInFallbackRedirectUrl,
    // @ts-ignore
    __signUpFallbackRedirectUrl: requestState.signUpFallbackRedirectUrl,
    __clerk_debug: debugRequestState(requestState),
    __clerkJSUrl: import.meta.env.VITE_CLERK_JS_URL, //getPublicEnvVariables(context).clerkJsUrl,
    __clerkJSVersion: import.meta.env.VITE_CLERK_JS_VERSION, //getPublicEnvVariables(context).clerkJsVersion,
    __telemetryDisabled: import.meta.env.VITE_CLERK_TELEMETRY_DISABLED, //getPublicEnvVariables(context).telemetryDisabled,
    __telemetryDebug: import.meta.env.VITE_CLERK_TELEMETRY_DEBUG, //getPublicEnvVariables(context).telemetryDebug,
  };
  return { clerkState: { __internal_clerk_state: clerkState } };
}

export async function loader(args: Route.LoaderArgs) {
  const { auth, _authRequestState } = args.context;
  const data = getResponseClerkState(auth, _authRequestState);
  return data;
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
  // {
  //   rel: "stylesheet",
  //   href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  // },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;200;300;400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap",
  },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  {
    rel: "icon",
    type: "image/png",
    href: "/favicon-96x96.png",
    sizes: "96x96",
  },
  // { rel: "shortcut icon", type: "image/png", href: "/favicon.ico" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/site.webmanifest" },
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
        <title>Modelrules</title>
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
