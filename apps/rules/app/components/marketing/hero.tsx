import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { AnimatedHeroBeam } from "./hero-beams";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function Hero() {
  return (
    <section>
      <div className="relative mx-auto max-w-6xl px-6 pt-40 lg:pb-16 md:pt-48">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <TextEffect
            preset="fade-in-blur"
            speedSegment={0.3}
            as="h1"
            className="text-balance text-4xl font-light md:text-5xl lg:text-6xl"
          >
            Rewrite Model Parameters and Route API requests
          </TextEffect>
          <TextEffect
            per="line"
            preset="fade-in-blur"
            speedSegment={0.3}
            delay={0.5}
            as="p"
            className="mx-auto mt-6 max-w-2xl md:text-lg text-pretty text-muted-foreground"
          >
            A rules engine to transform and route LM API requests
          </TextEffect>

          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.75,
                  },
                },
              },
              ...transitionVariants,
            }}
            className="mt-12"
          >
            <div className="mx-auto max-w-sm">
              <Button
                aria-label="submit"
                variant="outline"
                size="lg"
                className="text-base px-5 rounded-xl"
                asChild
              >
                <Link to="/auth/sign-in">
                  <span>Get Started</span>
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </div>
          </AnimatedGroup>
        </div>
      </div>
      <div className="max-lg:-mt-20 lg:-mt-40">
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.75,
                },
              },
            },
            ...transitionVariants,
          }}
        >
          <div className="h-[clamp(300px,80vh,800px)] relative">
            <ThemeColorFlickeringGrid />
            <div className="mx-auto max-w-6xl px-6 h-full">
              <div className="h-full mx-auto w-full max-w-4xl">
                <AnimatedHeroBeam />
              </div>
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}

function ThemeColorFlickeringGrid() {
  const [color, setColor] = useState<string>();

  function setColorFromTheme() {
    const foregroundColor = getComputedStyle(document.documentElement).color;
    setColor(foregroundColor);
  }

  useEffect(() => {
    setColorFromTheme();
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    query.addEventListener("change", setColorFromTheme);
    return () => {
      query.removeEventListener("change", setColorFromTheme);
    };
  }, []);

  return (
    <FlickeringGrid
      className="absolute inset-0 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
      color={color}
      maxOpacity={0.1}
    ></FlickeringGrid>
  );
}
