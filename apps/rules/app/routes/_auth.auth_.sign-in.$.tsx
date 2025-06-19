import type { Route } from "./+types/_auth.auth_.sign-in.$";
import { redirect } from "react-router";
import { SignIn } from "@clerk/react-router";

export async function loader(args: Route.LoaderArgs) {
  const userId = args.context.auth?.userId;
  if (userId) return redirect("/console");
}

export default function SignInPage() {
  return <SignIn />;
}
