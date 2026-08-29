/**
 * Backend configuration.
 * Replace N8N_WEBHOOK_URL with the real n8n production webhook URL.
 * Never put API keys in this file — the frontend is public.
 */
export const N8N_WEBHOOK_URL = "https://automation.winstreet.co.in/webhook-test/jarvis";

/** Milliseconds before a webhook call is treated as timed out. */
export const REQUEST_TIMEOUT_MS = 30_000;

export const STORAGE_KEYS = {
  conversations: "jarvis.conversations",
  messages: "jarvis.messages",
  settings: "jarvis.settings",
  tools: "jarvis.tools",
} as const;

export const UNAVAILABLE_MESSAGE = "JARVIS is currently unavailable.";
