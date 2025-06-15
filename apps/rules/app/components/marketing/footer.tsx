import { Link } from "react-router";
import { Logo } from "@/components/logo";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="py-16 border-t border-border/50 mt-32">
      <div className="@container mx-auto max-w-5xl px-5 text-sm grid gap-4">
        <div>
          <Button
            asChild
            variant="ghost"
            className="-m-2.5 rounded-full"
            size="sm"
          >
            <Link to="/#" aria-label="home">
              <Logo className="size-4" /> ModelRules
            </Link>
          </Button>
        </div>
        <div className="text-muted-foreground">
          Built by
          <Button
            asChild
            variant="link"
            className="-m-2.5 font-normal pl-3.5"
            size="sm"
          >
            <Link to="https://github.com/exectx">exectx</Link>
          </Button>
        </div>
        <div>
          <Button
            asChild
            variant="link"
            className="-m-2.5 font-normal"
            size="sm"
          >
            <Link to="https://github.com/exectx/model-rules" target="_blank" aria-label="GitHub">
              GitHub <ArrowUpRight className="size-4 text-muted-foreground" />
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
