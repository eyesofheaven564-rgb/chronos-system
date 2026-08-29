import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { STORAGE_KEYS, UNAVAILABLE_MESSAGE } from "@/config/jarvis";
import { JarvisUnavailableError, sendToJarvis } from "@/lib/jarvis-client";
import type {
  AssistantState,
  Conversation,
  Message,
  ToolExecution,
} from "@/types/jarvis";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("[jarvis] failed to persist", key, error);
  }
}

const toolLabels: Record<string, string> = {
  weather: "Using Weather",
  web_search: "Searching the web",
  search: "Searching the web",
  reminder: "Creating reminder",
  reminders: "Creating reminder",
  calendar: "Checking calendar",
  email: "Drafting email",
  notes: "Writing note",
  calculator: "Calculating",
};

export const toolLabel = (tool: string) =>
  toolLabels[tool.toLowerCase()] ?? `Using ${tool}`;

interface JarvisContextValue {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  executions: ToolExecution[];
  state: AssistantState;
  statusLabel: string;
  activity: string | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setState: (state: AssistantState, label?: string) => void;
  selectConversation: (id: string) => void;
  newConversation: () => string;
  deleteConversation: (id: string) => void;
  sendMessage: (text: string) => Promise<void>;
}

const JarvisContext = createContext<JarvisContextValue | null>(null);

export function JarvisProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [executions, setExecutions] = useState<ToolExecution[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [state, setStateRaw] = useState<AssistantState>("idle");
  const [statusLabel, setStatusLabel] = useState("Ready");
  const [activity, setActivity] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    const storedConversations = read<Conversation[]>(STORAGE_KEYS.conversations, []);
    const storedMessages = read<Message[]>(STORAGE_KEYS.messages, []);
    setConversations(storedConversations);
    setAllMessages(storedMessages);
    setActiveConversationId(storedConversations[0]?.id ?? null);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) write(STORAGE_KEYS.conversations, conversations);
  }, [conversations]);

  useEffect(() => {
    if (hydrated.current) write(STORAGE_KEYS.messages, allMessages);
  }, [allMessages]);

  const setState = useCallback((next: AssistantState, label?: string) => {
    setStateRaw(next);
    setStatusLabel(
      label ??
        {
          idle: "Ready",
          listening: "Listening",
          thinking: "Thinking",
          executing: "Executing",
          responding: "Responding",
        }[next],
    );
  }, []);

  const newConversation = useCallback(() => {
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: uid(),
      title: "New conversation",
      createdAt: now,
      updatedAt: now,
    };
    setConversations((prev) => [conversation, ...prev]);
    setActiveConversationId(conversation.id);
    return conversation.id;
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setActiveConversationId((current) => (current === id ? (next[0]?.id ?? null) : current));
      return next;
    });
    setAllMessages((prev) => prev.filter((m) => m.conversationId !== id));
  }, []);

  const appendMessage = useCallback((message: Message) => {
    setAllMessages((prev) => [...prev, message]);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content) return;

      let conversationId = activeConversationId;
      if (!conversationId) {
        conversationId = newConversation();
      }
      const cid = conversationId;
      const now = new Date().toISOString();

      appendMessage({
        id: uid(),
        conversationId: cid,
        role: "user",
        content,
        createdAt: now,
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === cid
            ? {
                ...c,
                updatedAt: now,
                title:
                  c.title === "New conversation"
                    ? content.slice(0, 42) + (content.length > 42 ? "…" : "")
                    : c.title,
              }
            : c,
        ),
      );

      setState("thinking");
      setActivity("Thinking");

      try {
        const response = await sendToJarvis({
          message: content,
          conversationId: cid,
          timestamp: now,
        });

        if (response.tool) {
          const execution: ToolExecution = {
            id: uid(),
            conversationId: cid,
            tool: response.tool,
            label: toolLabel(response.tool),
            status: "completed",
            startedAt: now,
            finishedAt: new Date().toISOString(),
          };
          setExecutions((prev) => [execution, ...prev].slice(0, 50));
          setState("executing", execution.label);
          setActivity(execution.label);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        setState("responding");
        setActivity("Finished");
        appendMessage({
          id: uid(),
          conversationId: cid,
          role: "jarvis",
          content: response.reply,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        if (!(error instanceof JarvisUnavailableError)) {
          console.error("[jarvis] unexpected send failure", error);
        }
        appendMessage({
          id: uid(),
          conversationId: cid,
          role: "system",
          content: UNAVAILABLE_MESSAGE,
          createdAt: new Date().toISOString(),
          error: true,
        });
      } finally {
        setTimeout(() => {
          setActivity(null);
          setState("idle");
        }, 700);
      }
    },
    [activeConversationId, appendMessage, newConversation, setState],
  );

  const messages = useMemo(
    () => allMessages.filter((m) => m.conversationId === activeConversationId),
    [allMessages, activeConversationId],
  );

  const value: JarvisContextValue = {
    conversations,
    activeConversationId,
    messages,
    executions,
    state,
    statusLabel,
    activity,
    sidebarOpen,
    setSidebarOpen,
    setState,
    selectConversation: setActiveConversationId,
    newConversation,
    deleteConversation,
    sendMessage,
  };

  return <JarvisContext.Provider value={value}>{children}</JarvisContext.Provider>;
}

export function useJarvis() {
  const ctx = useContext(JarvisContext);
  if (!ctx) throw new Error("useJarvis must be used inside JarvisProvider");
  return ctx;
}
