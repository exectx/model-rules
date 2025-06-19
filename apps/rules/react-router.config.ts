import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  // TODO: fix this, why can't we prerender any route?
  // prerender: ["/", "/privacy", "terms"],
  future: {
    unstable_viteEnvironmentApi: true,
  },
} satisfies Config;
