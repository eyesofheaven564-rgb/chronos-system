import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Page, PageHeader } from "@/components/jarvis/app-shell";
import { Switch } from "@/components/ui/switch";
import type { Tool } from "@/types/jarvis";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Tools — JARVIS" },
      { name: "description", content: "Enable or disable the tools JARVIS can call." },
      { property: "og:title", content: "Tools — JARVIS" },
      {
        property: "og:description",
        content: "Enable or disable the tools JARVIS can call.",
      },
    ],
  }),
  component: ToolsPage,
});

const defaultTools: Tool[] = [
  { id: "web_search", name: "Web Search", description: "Look up current information online.", enabled: true },
  { id: "calculator", name: "Calculator", description: "Evaluate expressions and unit maths.", enabled: true },
  { id: "weather", name: "Weather", description: "Forecasts and current conditions.", enabled: true },
  { id: "reminders", name: "Reminders", description: "Create and list time-based reminders.", enabled: false },
  { id: "calendar", name: "Calendar", description: "Read and create calendar events.", enabled: false },
  { id: "email", name: "Email", description: "Draft and summarise messages.", enabled: false },
  { id: "notes", name: "Notes", description: "Capture and retrieve short notes.", enabled: false },
  { id: "youtube", name: "YouTube", description: "Find and summarise videos.", enabled: false },
  { id: "spotify", name: "Spotify", description: "Control playback and playlists.", enabled: false },
];

function ToolsPage() {
  const [tools, setTools] = useState(defaultTools);

  return (
    <Page>
      <PageHeader
        title="Tools"
        description="Capabilities JARVIS may call through n8n. Toggling is local until the workflow backend is connected."
      />

      <ul className="divide-y divide-border border-y border-border">
        {tools.map((tool) => (
          <li key={tool.id} className="flex items-center gap-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">{tool.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{tool.description}</p>
            </div>
            <Switch
              checked={tool.enabled}
              aria-label={`Toggle ${tool.name}`}
              onCheckedChange={(checked) =>
                setTools((prev) =>
                  prev.map((t) => (t.id === tool.id ? { ...t, enabled: checked } : t)),
                )
              }
            />
          </li>
        ))}
      </ul>
    </Page>
  );
}
