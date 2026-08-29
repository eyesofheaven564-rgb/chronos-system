import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { Message } from "@/types/jarvis";

export function MessageList({ messages }: { messages: Message[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <div className="max-h-[38vh] space-y-4 overflow-y-auto pr-1">
      {messages.map((message) => (
        <div key={message.id} className="animate-fade-up">
          {message.role === "user" ? (
            <div className="flex justify-end">
              <p className="max-w-[80%] rounded-md border border-border glass px-3 py-2 text-sm text-foreground">
                {message.content}
              </p>
            </div>
          ) : (
            <div className="flex gap-3">
              <span
                className={cn(
                  "hud-label mt-1 shrink-0",
                  message.error ? "text-destructive" : "text-primary",
                )}
              >
                {message.error ? "sys" : "jvs"}
              </span>
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  message.error ? "text-muted-foreground" : "text-foreground/90",
                )}
              >
                {message.content}
              </p>
            </div>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
