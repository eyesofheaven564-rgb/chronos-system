import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeader } from "@/components/jarvis/app-shell";

export const Route = createFileRoute("/automations")({
  head: () => ({
    meta: [
      { title: "Automations — JARVIS" },
      {
        name: "description",
        content: "Scheduled and triggered routines JARVIS will run through n8n.",
      },
      { property: "og:title", content: "Automations — JARVIS" },
      {
        property: "og:description",
        content: "Scheduled and triggered routines JARVIS will run through n8n.",
      },
    ],
  }),
  component: Automations,
});

function Automations() {
  return (
    <Page>
      <PageHeader
        title="Automations"
        description="Routines will be defined in n8n and listed here once the workflow backend is connected."
      />
      <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center">
        <p className="hud-label text-muted-foreground">no automations connected</p>
      </div>
    </Page>
  );
}
