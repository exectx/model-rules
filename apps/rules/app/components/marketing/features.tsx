import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Key, Lock, Settings2 } from "lucide-react";
import { type ReactNode } from "react";

export default function Features() {
  return (
    <section className="py-16 md:py-32" id="features">
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-light lg:text-5xl">
            Built to cover your needs
          </h2>
          <p className="mt-4 text-muted-foreground">
            ModelRules allows you to customize request parameters and route
            requests to different LM providers.
          </p>
        </div>
        <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Settings2 className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Customizable</h3>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create custom rules to overwrite your LLM API parameters and
                apply them per model or provider.
              </p>
            </CardContent>
          </Card>

          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Lock className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Secure</h3>
            </CardHeader>

            <CardContent>
              <p className="mt-3 text-sm text-muted-foreground">
                Securely store provider API keys and credentials.
              </p>
            </CardContent>
          </Card>

          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Key className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Access Tokens</h3>
            </CardHeader>

            <CardContent>
              <p className="mt-3 text-sm text-muted-foreground">
                Create and revoke access tokens for your applications.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function CardDecorator({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:bg-white/5 dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
      />
      <div
        aria-hidden
        className="bg-radial to-card absolute inset-0 from-transparent to-75%"
      />
      <div className="bg-card absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">
        {children}
      </div>
    </div>
  );
}
