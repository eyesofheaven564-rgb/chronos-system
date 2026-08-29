import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { Page, PageHeader } from "@/components/jarvis/app-shell";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { N8N_WEBHOOK_URL } from "@/config/jarvis";
import { isWebhookConfigured } from "@/lib/jarvis-client";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — JARVIS" },
      {
        name: "description",
        content: "Configure the JARVIS model, voice, appearance and backend connection.",
      },
      { property: "og:title", content: "Settings — JARVIS" },
      {
        property: "og:description",
        content: "Configure the JARVIS model, voice, appearance and backend connection.",
      },
    ],
  }),
  component: SettingsPage,
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border py-6 first:border-t-0">
      <h2 className="hud-label mb-4 text-muted-foreground">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="min-w-0">
        <p className="text-sm text-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const [model, setModel] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [tts, setTts] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <Page>
      <PageHeader
        title="Settings"
        description="Preferences are held locally. Credentials live server-side and are never stored in the browser."
      />

      <Section title="AI model">
        <Row label="Provider" hint="Requests are routed through the backend workflow.">
          <span className="text-sm text-primary">OpenRouter</span>
        </Row>
        <Row label="Model" hint="e.g. anthropic/claude-sonnet-4.5">
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="not configured"
            className="h-9 w-56 bg-transparent text-sm"
          />
        </Row>
        <p className="text-xs text-muted-foreground">
          API keys are configured in the backend only — never in this interface.
        </p>
      </Section>

      <Section title="Voice">
        <Row label="Speech-to-text" hint="Provider not connected yet.">
          <span className="hud-label text-muted-foreground">placeholder</span>
        </Row>
        <Row label="Text-to-speech" hint="Speak JARVIS responses aloud.">
          <Switch checked={tts} onCheckedChange={setTts} aria-label="Toggle text to speech" />
        </Row>
      </Section>

      <Section title="Appearance">
        <Row label="Theme">
          <span className="text-sm text-foreground/80">Midnight</span>
        </Row>
        <Row label="Reduced motion" hint="Minimise orb animation.">
          <Switch
            checked={reducedMotion}
            onCheckedChange={setReducedMotion}
            aria-label="Toggle reduced motion"
          />
        </Row>
      </Section>

      <Section title="Notifications">
        <Row label="System notifications" hint="Alert when a long task finishes.">
          <Switch
            checked={notifications}
            onCheckedChange={setNotifications}
            aria-label="Toggle notifications"
          />
        </Row>
      </Section>

      <Section title="Backend connection">
        <Row label="n8n webhook" hint={N8N_WEBHOOK_URL}>
          <span
            className={
              isWebhookConfigured() ? "hud-label text-primary" : "hud-label text-warn"
            }
          >
            {isWebhookConfigured() ? "connected" : "not configured"}
          </span>
        </Row>
      </Section>
    </Page>
  );
}
