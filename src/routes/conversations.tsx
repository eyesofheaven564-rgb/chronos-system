import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { Page, PageHeader } from "@/components/jarvis/app-shell";
import { useJarvis } from "@/state/jarvis-store";

export const Route = createFileRoute("/conversations")({
  head: () => ({
    meta: [
      { title: "Conversations — JARVIS" },
      { name: "description", content: "Browse and resume your JARVIS conversations." },
      { property: "og:title", content: "Conversations — JARVIS" },
      {
        property: "og:description",
        content: "Browse and resume your JARVIS conversations.",
      },
    ],
  }),
  component: Conversations,
});

function Conversations() {
  const { conversations, selectConversation, deleteConversation, activeConversationId } =
    useJarvis();
  const navigate = useNavigate();

  return (
    <Page>
      <PageHeader
        title="Conversations"
        description="Sessions are stored locally for now. Ready to move to cloud storage later."
      />

      {conversations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No conversations yet.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {conversations.map((conversation) => (
            <li key={conversation.id} className="flex items-center gap-4 py-3">
              <button
                type="button"
                onClick={() => {
                  selectConversation(conversation.id);
                  void navigate({ to: "/" });
                }}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm text-foreground">{conversation.title}</p>
                <p className="hud-label mt-1 text-muted-foreground">
                  {new Date(conversation.updatedAt).toLocaleString()}
                  {conversation.id === activeConversationId ? " · active" : ""}
                </p>
              </button>
              <button
                type="button"
                aria-label="Delete conversation"
                onClick={() => deleteConversation(conversation.id)}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
