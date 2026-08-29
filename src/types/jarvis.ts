export type AssistantState =
  | "idle"
  | "listening"
  | "thinking"
  | "executing"
  | "responding";

export type MessageRole = "user" | "jarvis" | "system";

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type ToolExecutionStatus = "running" | "completed" | "failed";

export interface ToolExecution {
  id: string;
  conversationId: string;
  messageId?: string;
  tool: string;
  label: string;
  status: ToolExecutionStatus;
  startedAt: string;
  finishedAt?: string;
}

export interface Memory {
  id: string;
  content: string;
  kind: "preference" | "fact" | "project" | "tool";
  createdAt: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

/** Payload sent to the n8n webhook. */
export interface JarvisRequest {
  message: string;
  conversationId: string;
  timestamp: string;
}

/** Expected response from the n8n webhook. */
export interface JarvisResponse {
  reply: string;
  status: "completed" | "failed" | string;
  tool: string | null;
}
