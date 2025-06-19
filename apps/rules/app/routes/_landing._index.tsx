import type { Route } from "./+types/_landing._index";
import { Hero } from "@/components/marketing/hero";
import Features from "@/components/marketing/features";
import { Footer } from "@/components/marketing/footer";

export function meta({}: Route.MetaArgs) {
  return [
    {
      name: "description",
      content:
        "Override LLM parameters before sending your API request to any OpenAI API compatible provider.",
    },
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
