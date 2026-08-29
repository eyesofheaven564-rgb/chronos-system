import { cn } from "@/lib/utils";

export function ActivityIndicator({ activity }: { activity: string | null }) {
  return (
    <div
      className={cn(
        "flex h-6 items-center gap-2 transition-opacity duration-300",
        activity ? "opacity-100" : "opacity-0",
      )}
      aria-live="polite"
    >
      <span className="size-1.5 rounded-full bg-primary animate-blink" />
      <span className="hud-label text-muted-foreground">
        {activity ?? "idle"}
        {activity && activity !== "Finished" ? "…" : ""}
      </span>
    </div>
  );
}
