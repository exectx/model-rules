import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {

  const sleepFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  context.cloudflare.ctx.waitUntil(
    sleepFor(1000).then(() => console.log('hello from waituntil'))
  )
  return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome message={loaderData.message} />;
}
