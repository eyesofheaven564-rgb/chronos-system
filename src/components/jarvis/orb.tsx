import { cn } from "@/lib/utils";
import type { AssistantState } from "@/types/jarvis";

const ringSpeed: Record<AssistantState, string> = {
  idle: "animate-orb-spin",
  listening: "animate-orb-spin",
  thinking: "animate-orb-spin-fast",
  executing: "animate-orb-spin-fast",
  responding: "animate-orb-spin",
};

export function Orb({ state }: { state: AssistantState }) {
  const active = state !== "idle";

  return (
    <div className="relative grid size-40 place-items-center sm:size-52">
      {/* ambient glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-primary/10 blur-3xl transition-opacity duration-700",
          active ? "opacity-100" : "opacity-50",
        )}
      />

      {/* listening pulse */}
      {state === "listening" && (
        <div className="absolute inset-2 rounded-full border border-primary/40 animate-orb-pulse" />
      )}

      {/* rotating ring */}
      <svg
        viewBox="0 0 100 100"
        className={cn("absolute inset-0 size-full text-primary", ringSpeed[state])}
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.4"
          strokeOpacity={active ? 0.55 : 0.25}
          strokeDasharray="18 6 2 6"
          strokeLinecap="round"
        />
      </svg>

      {/* thin static ring */}
      <div className="absolute inset-[14%] rounded-full border border-border" />

      {/* core */}
      <div
        className={cn(
          "relative size-[46%] rounded-full animate-breathe",
          "bg-[radial-gradient(circle_at_35%_30%,color-mix(in_oklab,var(--primary)_75%,transparent),transparent_70%)]",
          active ? "glow-soft" : "",
        )}
        style={{ animationDuration: state === "thinking" ? "2.2s" : undefined }}
      >
        <div className="absolute inset-0 rounded-full border border-primary/30" />
      </div>
    </div>
  );
}
