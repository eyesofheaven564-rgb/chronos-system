import { N8N_WEBHOOK_URL, REQUEST_TIMEOUT_MS } from "@/config/jarvis";
import type { JarvisRequest, JarvisResponse } from "@/types/jarvis";

export class JarvisUnavailableError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "JarvisUnavailableError";
  }
}

export function isWebhookConfigured() {
  return N8N_WEBHOOK_URL !== "YOUR_N8N_WEBHOOK_URL" && /^https?:\/\//.test(N8N_WEBHOOK_URL);
}

/**
 * Sends a message to the n8n webhook.
 * Throws JarvisUnavailableError for every failure mode; the UI shows one
 * generic message while the console keeps the technical detail.
 */
export async function sendToJarvis(payload: JarvisRequest): Promise<JarvisResponse> {
  if (!isWebhookConfigured()) {
    console.warn(
      "[jarvis] N8N_WEBHOOK_URL is not configured — set it in src/config/jarvis.ts",
    );
    throw new JarvisUnavailableError("webhook_not_configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error("[jarvis] webhook responded with", res.status, await res.text());
      throw new JarvisUnavailableError(`http_${res.status}`);
    }

    const data = (await res.json()) as Partial<JarvisResponse>;
    if (typeof data?.reply !== "string") {
      console.error("[jarvis] unexpected webhook payload", data);
      throw new JarvisUnavailableError("invalid_payload");
    }

    return {
      reply: data.reply,
      status: data.status ?? "completed",
      tool: data.tool ?? null,
    };
  } catch (error) {
    if (error instanceof JarvisUnavailableError) throw error;
    if ((error as Error)?.name === "AbortError") {
      console.error("[jarvis] webhook request timed out after", REQUEST_TIMEOUT_MS, "ms");
      throw new JarvisUnavailableError("timeout");
    }
    console.error("[jarvis] webhook request failed", error);
    throw new JarvisUnavailableError("network_error");
  } finally {
    clearTimeout(timeout);
  }
}
