import { HeroHeader } from "@/components/marketing/header";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <Outlet />
      </main>
    </>
  );
}
