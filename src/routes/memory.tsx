import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/jarvis/app-shell";
import type { Memory } from "@/types/jarvis";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory — JARVIS" },
      {
        name: "description",
        content: "Long-term facts and preferences JARVIS keeps about you.",
      },
      { property: "og:title", content: "Memory — JARVIS" },
      {
        property: "og:description",
        content: "Long-term facts and preferences JARVIS keeps about you.",
      },
    ],
  }),
  component: MemoryPage,
});

// Illustrative shape only — no memory backend is connected yet.
const examples: Memory[] = [
  {
    id: "1",
    kind: "preference",
    content: "User prefers concise answers.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    kind: "project",
    content: "Project: JARVIS",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    kind: "tool",
    content: "Favorite tools: Web Search, Reminders",
    createdAt: new Date().toISOString(),
  },
];

function MemoryPage() {
  return (
    <Page>
      <PageHeader
        title="Memory"
        description="What JARVIS remembers between sessions. Not connected to storage yet — the entries below are placeholders."
      />

      <ul className="divide-y divide-border border-y border-border">
        {examples.map((memory) => (
          <li key={memory.id} className="flex items-start gap-4 py-4">
            <span className="hud-label mt-1 w-20 shrink-0 text-primary">{memory.kind}</span>
            <p className="text-sm text-foreground/90">{memory.content}</p>
          </li>
        ))}
      </ul>
    </Page>
  );
}
