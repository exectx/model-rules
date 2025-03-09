import * as React from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import * as Icons from "@/components/ui/icons";
import { TextScramble } from "@/components/motion-primitives/text-scramble";

const Square = React.forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 bg-background relative sm:size-16 rounded-xl sm:rounded-2xl border border-input overflow-hidden size-[clamp(32px,10vw,64px)]",
        className
      )}
    >
      {/* <div className="dark:bg-input/30 p-3 size-full flex items-center justify-center"> */}
      <div className="dark:bg-input/30 p-[clamp(6px,2vw,12px)] sm:p-3 size-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
});
Square.displayName = "Square";

const demoLMCalls = [
  {
    provider: "anthropic",
    model: "claude-3.7-sonnet",
    icon: Icons.Anthropic,
    refName: "anthropicRef",
    parameters: {
      previous: { temperature: "0.1", max_tokens: "100K" },
      updated: { temperature: "0.7", max_tokens: "128K" },
    },
  },
  {
    provider: "deepseek",
    model: "DeepSeek-R1",
    icon: Icons.DeepSeek,
    refName: "deepseekRef",
    parameters: {
      previous: { top_p: "1.0", max_tokens: "164K" },
      updated: { top_p: "0.8", max_tokens: "28K" },
    },
  },
  {
    provider: "openrouter",
    model: "openrouter/quasar-alpha",
    icon: Icons.OpenRouter,
    refName: "openrouterRef",
    parameters: {
      previous: { temperature: "0.2", max_tokens: "250K" },
      updated: { temperature: "0.7", max_tokens: "1M" },
    },
  },
  {
    provider: "openai",
    model: "o3-mini",
    icon: Icons.OpenAI,
    refName: "openaiRef",
    parameters: {
      previous: { temperature: "0.2", max_tokens: "25K" },
      updated: { temperature: "1.0", max_tokens: "100K" },
    },
  },
];

export function AnimatedHeroBeam({ className }: { className?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const middleRef = React.useRef<HTMLDivElement>(null);
  const userRef = React.useRef<HTMLDivElement>(null);

  const providerRefs = React.useRef<
    Record<string, React.RefObject<HTMLDivElement | null>>
  >({});
  demoLMCalls.forEach((call) => {
    providerRefs.current[call.refName] = React.useRef<HTMLDivElement>(null);
  });
  const [currentProviderIndex, setCurrentProviderIndex] = React.useState(0);
  const [isBeaming, setIsBeaming] = React.useState(false);
  const [showText, setShowText] = React.useState(false);
  const [showUpdatedValue, setShowUpdatedValue] = React.useState(false);
  // --- Timing Configuration ---
  const [beamDuration, setBeamDuration] = React.useState(5.5); // Time allocated per provider cycle
  const [isLooping, setIsLooping] = React.useState(false);
  const currentProviderData = demoLMCalls[currentProviderIndex];

  // Effect to manage the main cycle progression
  React.useEffect(() => {
    const initialDelay = 1000; // Delay to match beam delay=1, adjust if needed
    let intervalId: null | number = null;
    let beamMiddleEnterId: null | number = null;
    let hideTextTimeoutId: null | number = null;
    let showUpdatedValueTimeoutId: null | number = null;
    let hideUpdatedValueTimeoutId: null | number = null;
    const startInterval = () => {
      showUpdatedValueTimeoutId && clearTimeout(showUpdatedValueTimeoutId);
      hideUpdatedValueTimeoutId && clearTimeout(hideUpdatedValueTimeoutId);
      hideTextTimeoutId && clearTimeout(hideTextTimeoutId);
      beamMiddleEnterId && clearTimeout(beamMiddleEnterId);

      if (!isLooping) {
        beamMiddleEnterId = setTimeout(() => {
          showUpdatedValueTimeoutId && clearTimeout(showUpdatedValueTimeoutId);
          hideUpdatedValueTimeoutId && clearTimeout(hideUpdatedValueTimeoutId);
          hideTextTimeoutId && clearTimeout(hideTextTimeoutId);

          setIsBeaming(true);
          setShowText(true);

          showUpdatedValueTimeoutId = setTimeout(() => {
            setShowUpdatedValue(true);
          }, 1500);

          hideUpdatedValueTimeoutId = setTimeout(() => {
            setShowUpdatedValue(false);
          }, 4500);

          hideTextTimeoutId = setTimeout(() => {
            setShowText(false);
          }, 3600);
        }, 900);
      }

      intervalId = setInterval(() => {
        showUpdatedValueTimeoutId && clearTimeout(showUpdatedValueTimeoutId);
        hideUpdatedValueTimeoutId && clearTimeout(hideUpdatedValueTimeoutId);
        hideTextTimeoutId && clearTimeout(hideTextTimeoutId);
        beamMiddleEnterId && clearTimeout(beamMiddleEnterId);

        beamMiddleEnterId = setTimeout(() => {
          showUpdatedValueTimeoutId && clearTimeout(showUpdatedValueTimeoutId);
          hideUpdatedValueTimeoutId && clearTimeout(hideUpdatedValueTimeoutId);
          hideTextTimeoutId && clearTimeout(hideTextTimeoutId);
          setShowText(true);

          showUpdatedValueTimeoutId = setTimeout(() => {
            setShowUpdatedValue(true);
          }, 1500);

          hideUpdatedValueTimeoutId = setTimeout(() => {
            setShowUpdatedValue(false);
          }, 4500);

          hideTextTimeoutId = setTimeout(() => {
            setShowText(false);
          }, 3600);
        }, 900);

        setIsLooping(true);
        setIsBeaming(true);
        setCurrentProviderIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % demoLMCalls.length;
          return nextIndex;
        });
      }, beamDuration * 1000);
    };

    // Start the interval after an initial delay
    const initialTimeoutId = setTimeout(() => {
      startInterval();
    }, initialDelay);

    // Cleanup function: clear the initial timeout *and* the interval if it started
    return () => {
      clearTimeout(initialTimeoutId);
      clearInterval(intervalId ?? undefined);
      clearTimeout(beamMiddleEnterId ?? undefined);
      clearTimeout(hideTextTimeoutId ?? undefined);
      clearTimeout(showUpdatedValueTimeoutId ?? undefined);
      clearTimeout(hideUpdatedValueTimeoutId ?? undefined);
    };
  }, [beamDuration, demoLMCalls.length]);

  // --- Render ---
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden -p-[clamp(2px,3vw,40px)]",
        className
      )}
      ref={containerRef}
    >
      <div className="flex size-full flex-row items-stretch justify-between gap-[clamp(12px,3vw,40px)]">
        {/* --- User Icon (Left) --- */}
        <div className="flex flex-col justify-center gap-2">
          <Square ref={userRef}>
            <Icons.User className="size-[clamp(12px,4vw,28px)] sm:size-7" />
          </Square>
        </div>

        {/* --- Middle Box (Service) --- */}
        <div className="flex flex-col justify-center">
          <div
            ref={middleRef}
            className="z-10 bg-background relative w-[clamp(140px,40vw,256px)] sm:w-64 rounded-xl sm:rounded-2xl border border-input overflow-hidden"
          >
            <div className="dark:bg-input/10 p-[clamp(4px,1.5vw,16px)] sm:p-4 space-y-2 sm:space-y-3">
              <div className="text-center mb-2 text-[clamp(9px,2.5vw,16px)] sm:text-base">
                ModelRules
              </div>
              <div className="-text-[clamp(10px,3vw,14px)] -sm:text-sm text-muted-foreground grid gap-[clamp(4px,1.5vw,8px)] sm:gap-2 grid-cols-8 items-center">
                {/* Model Name */}
                <div className="border border-input rounded-md sm:rounded-lg px-0 py-0 sm:px-3 sm:py-1.5 text-center col-span-8 h-[clamp(24px,7vw,32px)] sm:h-8 flex items-center justify-center">
                  <div
                    className="font-mono text-[clamp(6px,2vw,12px)] sm:text-xs w-full text-center duration-1000 transition-opacity"
                    style={{ opacity: showText ? 1 : 0 }}
                  >
                    {currentProviderData.model}
                  </div>
                </div>

                {/* Dynamic Parameters */}
                {Object.entries(currentProviderData.parameters.updated).map(
                  ([key, updatedValue]) => {
                    const previousValue =
                      currentProviderData.parameters.previous[
                        key as keyof typeof currentProviderData.parameters.previous
                      ];
                    if (previousValue === undefined) return null;

                    return (
                      <div
                        key={key}
                        className="grid grid-cols-subgrid col-span-full gap-[clamp(4px,1.5vw,8px)] sm:gap-2 items-center"
                      >
                        {/* Parameter Label */}
                        <div
                          className={cn(
                            "px-0 py-0 sm:py-1.5 sm:px-3 rounded-md sm:rounded-lg border border-input/50 bg-muted/50 col-span-4 h-[clamp(24px,7vw,32px)] sm:h-8 flex items-center justify-center"
                          )}
                        >
                          <div
                            className="font-mono text-[clamp(6px,2vw,12px)] sm:text-xs w-full text-center duration-1000 transition-opacity"
                            style={{
                              opacity: showText ? 1 : 0,
                            }}
                          >
                            {key}
                          </div>
                        </div>
                        {/* Parameter Value Area (Conditional Scramble/Loop) */}
                        <div className="col-span-4">
                          <div
                            className={cn(
                              "px-0 py-0 -px-2 -py-1 sm:px-3 sm:py-1.5 transition-colors duration-700 rounded-md sm:rounded-lg border border-input flex items-center justify-center overflow-hidden h-[clamp(24px,7vw,32px)] sm:h-8",
                              {
                                "animate-pulse !border-primary/30":
                                  showText && !showUpdatedValue,
                              }
                            )}
                          >
                            <div
                              className="font-mono text-[clamp(6px,2vw,12px)] sm:text-xs duration-1000 transition-opacity"
                              style={{
                                opacity: showText ? 1 : 0,
                              }}
                            >
                              <TextScramble
                                key={`${key}-${previousValue}-${updatedValue}`}
                                as="span"
                                trigger={showUpdatedValue}
                                // className=""
                              >
                                {showUpdatedValue
                                  ? updatedValue
                                  : previousValue}
                              </TextScramble>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Provider Icons (Right) --- */}
        <div
          // className="flex flex-col justify-center gap-4"
          className="flex flex-col justify-center gap-[clamp(10px,2.5vw,16px)] sm:gap-4"
        >
          {demoLMCalls.map((call) => {
            const IconComponent = call.icon;
            const currentRef = providerRefs.current[call.refName] ?? undefined;
            return (
              <Square key={call.provider} ref={currentRef}>
                <IconComponent className="size-[clamp(16px,4vw,28px)] sm:size-7" />
              </Square>
            );
          })}
        </div>
      </div>

      {/* --- Animated Beams --- */}

      {/* User -> Middle Beam: Single instance, attempting to loop */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={userRef}
        toRef={middleRef}
        duration={beamDuration}
        delay={isLooping ? 0 : 1}
        gradientStartColor="#bfdbfe"
        gradientStopColor="#60a5fa"
      />

      {/* Middle -> Provider Beams */}
      {demoLMCalls.map((call, index) => {
        const providerRef = providerRefs.current[call.refName];
        if (!providerRef) return null;

        return (
          <AnimatedBeam
            key={`${call.provider}-anibeam`}
            containerRef={containerRef}
            fromRef={middleRef}
            toRef={providerRef}
            duration={beamDuration} // Takes full slot duration (Corrected)
            delay={isLooping ? 0 : 1} // Starts at the beginning of the provider's slot (Corrected)
            gradientStartColor={
              index === currentProviderIndex ? "#bfdbfe" : "transparent"
            }
            gradientStopColor={
              index === currentProviderIndex ? "#60a5fa" : "transparent"
            }
          />
        );
      })}
    </div>
  );
}
