import { ArrowUp, Mic, Square } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  MicrophoneDeniedError,
  startRecording,
  transcribeAudio,
  type Recorder,
} from "@/lib/voice";
import { useJarvis } from "@/state/jarvis-store";

export function Composer() {
  const { sendMessage, setState, state } = useJarvis();
  const [value, setValue] = useState("");
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<Recorder | null>(null);

  const submit = () => {
    if (!value.trim() || state === "thinking") return;
    const text = value;
    setValue("");
    void sendMessage(text);
  };

  const toggleMic = async () => {
    if (recording) {
      const recorder = recorderRef.current;
      recorderRef.current = null;
      setRecording(false);
      setState("thinking", "Transcribing");
      try {
        const audio = await recorder!.stop();
        const text = await transcribeAudio(audio);
        await sendMessage(text);
      } catch (error) {
        console.error("[jarvis] transcription failed", error);
        setState("idle");
        toast("Speech-to-text is not connected yet.");
      }
      return;
    }

    try {
      recorderRef.current = await startRecording();
      setRecording(true);
      setState("listening");
    } catch (error) {
      setState("idle");
      if (error instanceof MicrophoneDeniedError) {
        toast("Microphone access is required for voice input.");
      } else {
        console.error("[jarvis] recording failed", error);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border glass px-2 py-2">
      <button
        type="button"
        onClick={toggleMic}
        aria-label={recording ? "Stop listening" : "Start voice input"}
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors",
          "hover:text-foreground hover:border-primary/40",
          recording && "border-primary/60 text-primary glow-soft",
        )}
      >
        {recording ? <Square className="size-3.5" /> : <Mic className="size-4" />}
      </button>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={recording ? "Listening…" : "Ask JARVIS"}
        className="min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />

      <button
        type="button"
        onClick={submit}
        disabled={!value.trim()}
        aria-label="Send message"
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-all",
          "hover:text-foreground hover:border-primary/40",
          "disabled:pointer-events-none disabled:opacity-35",
          value.trim() && "border-primary/50 text-primary",
        )}
      >
        <ArrowUp className="size-4" />
      </button>
    </div>
  );
}
