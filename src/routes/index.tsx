import { createFileRoute } from "@tanstack/react-router";

import { ActivityIndicator } from "@/components/jarvis/activity-indicator";
import { Composer } from "@/components/jarvis/composer";
import { MessageList } from "@/components/jarvis/message-list";
import { Orb } from "@/components/jarvis/orb";
import { useJarvis } from "@/state/jarvis-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JARVIS — Personal AI Assistant" },
      {
        name: "description",
        content:
          "Talk to JARVIS: a minimal, futuristic assistant interface with voice input and live tool activity.",
      },
      { property: "og:title", content: "JARVIS — Personal AI Assistant" },
      {
        property: "og:description",
        content:
          "Talk to JARVIS: a minimal, futuristic assistant interface with voice input and live tool activity.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { state, statusLabel, activity, messages } = useJarvis();

  return (
    <div className="flex min-h-screen flex-col items-center px-5 pb-8 pt-20 md:pt-16">
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <Orb state={state} />
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-[0.7rem] font-medium uppercase tracking-[0.45em] text-foreground">
            Jarvis
          </h1>
          <p className="hud-label text-muted-foreground">{statusLabel}</p>
        </div>
        <ActivityIndicator activity={activity} />
      </div>

      <div className="w-full max-w-2xl space-y-4">
        <MessageList messages={messages} />
        <Composer />
        <p className="hud-label text-center text-muted-foreground/50">
          enter to send · mic for voice
        </p>
      </div>
    </div>
  );
}
