import { Link } from "react-router";
import { Logo } from "@/components/logo";
import { ArrowUpRight } from "lucide-react";

const links = [
  {
    group: "Legal",
    items: [
      {
        title: "Terms",
        href: "/terms",
      },
      {
        title: "Privacy",
        href: "/privacy",
      },
    ],
  },
  {
    group: "Developers",
    items: [
      {
        title: "Documentation",
        href: "/docs",
      },
      {
        title: "GitHub",
        href: "https://github.com/exectx/model-rules",
        external: true,
      },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-20 mt-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link
              to="/#"
              aria-label="go home"
              className="inline-flex items-center gap-2"
            >
              <Logo className="size-4" />
              <span className="font-medium">Modelrules</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 md:col-span-3">
            {links.map((link, index) => (
              <div key={index} className="space-y-4 text-sm">
                <span className="block font-medium">{link.group}</span>
                {link.items.map((item, index) => (
                  <Link
                    key={index}
                    to={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="text-muted-foreground hover:text-primary flex items-center gap-1 duration-150"
                  >
                    <span>{item.title}</span>
                    {item.external && (
                      <ArrowUpRight className="size-3 text-muted-foreground" />
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
