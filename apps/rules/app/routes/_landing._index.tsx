import type { Route } from "./+types/_landing._index";
import { Hero } from "@/components/marketing/hero";
import Features from "@/components/marketing/features";
import { Footer } from "@/components/marketing/footer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Footer />
    </>
  );
}
