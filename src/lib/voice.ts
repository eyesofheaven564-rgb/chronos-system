/**
 * Voice abstraction.
 *
 * `transcribeAudio` is intentionally provider-agnostic: wire it up to a
 * server function (Whisper, Deepgram, ElevenLabs, …) later. No keys here.
 */

export class MicrophoneDeniedError extends Error {
  constructor() {
    super("microphone_permission_denied");
    this.name = "MicrophoneDeniedError";
  }
}

export class TranscriptionUnavailableError extends Error {
  constructor() {
    super("transcription_provider_not_configured");
    this.name = "TranscriptionUnavailableError";
  }
}

/** Placeholder — connect a speech-to-text provider through the backend. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function transcribeAudio(_audio: Blob): Promise<string> {
  console.warn("[jarvis] transcribeAudio() has no provider connected yet");
  throw new TranscriptionUnavailableError();
}

export interface Recorder {
  stop: () => Promise<Blob>;
  cancel: () => void;
}

/** Requests microphone permission and starts recording. */
export async function startRecording(): Promise<Recorder> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new MicrophoneDeniedError();
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (error) {
    console.error("[jarvis] microphone permission error", error);
    throw new MicrophoneDeniedError();
  }

  const recorder = new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };
  recorder.start();

  const release = () => stream.getTracks().forEach((track) => track.stop());

  return {
    stop: () =>
      new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          release();
          resolve(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
        };
        recorder.stop();
      }),
    cancel: () => {
      try {
        recorder.stop();
      } catch {
        /* already stopped */
      }
      release();
    },
  };
}

/** Text-to-speech placeholder — swap for a real provider later. */
export function speak(_text: string) {
  console.warn("[jarvis] speak() has no provider connected yet");
}
