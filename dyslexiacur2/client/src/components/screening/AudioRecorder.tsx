import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecordedAudioEntry } from "@/types/screening";

interface AudioRecorderProps {
  recordedAudio?: RecordedAudioEntry;
  onRecorded: (audio: RecordedAudioEntry) => void;
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function AudioRecorder({
  recordedAudio,
  onRecorded,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Ready to record");
  const [durationMs, setDurationMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const durationSeconds = Math.floor(durationMs / 1000);
  const statusLabel = isRecording
    ? `Recording... ${durationSeconds}s`
    : recordedAudio
      ? `Stopped (${Math.floor(recordedAudio.durationMs / 1000)}s)`
      : status;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      streamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      setDurationMs(0);
      setIsRecording(true);
      setStatus("Recording in progress");

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const nextDurationMs = Date.now() - startedAtRef.current;
        const audio = {
          blob,
          durationMs: nextDurationMs,
          url: URL.createObjectURL(blob),
        };

        setDurationMs(nextDurationMs);
        setStatus("Stopped");
        onRecorded(audio);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setIsPlaying(false);
      };

      mediaRecorder.start();
      timerRef.current = window.setInterval(() => {
        setDurationMs(Date.now() - startedAtRef.current);
      }, 250);
    } catch (error) {
      console.error("Failed to start recording", error);
      setStatus("Microphone access was not granted");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      return;
    }

    mediaRecorderRef.current.stop();
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const togglePlayback = async () => {
    const el = audioRef.current;
    if (!el) return;

    try {
      if (el.paused) {
        await el.play();
        setIsPlaying(true);
      } else {
        el.pause();
        setIsPlaying(false);
      }
    } catch {
      // Ignore autoplay issues; users can still use native controls if needed.
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-secondary/35 p-5 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Audio response
          </p>
          <p className="text-base text-foreground" aria-live="polite">
            {statusLabel}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end sm:flex-row">
          {recordedAudio ? (
            <Button type="button" variant="secondary" onClick={togglePlayback}>
              {isPlaying ? (
                <>
                  <Pause className="size-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Play
                </>
              )}
            </Button>
          ) : null}

          <Button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
          >
            {isRecording ? (
              <>
                <span className="relative mr-1">
                  <MicOff className="size-4" />
                </span>
                Stop recording
              </>
            ) : (
              <>
                <span className={recordedAudio ? "mr-1" : "mr-1"}>
                  <Mic className="size-4" />
                </span>
                {recordedAudio ? "Record again" : "Start recording"}
              </>
            )}
          </Button>
        </div>
      </div>

      {recordedAudio ? (
        <div className="rounded-xl bg-background/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Play className="size-4" />
              <span>Playback preview</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {Math.floor(recordedAudio.durationMs / 1000)}s
            </p>
          </div>

          <audio
            ref={audioRef}
            controls
            className="w-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={recordedAudio.url} type={recordedAudio.blob.type} />
          </audio>
        </div>
      ) : null}

      {isRecording ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex size-6 items-center justify-center">
              <span className="absolute inline-flex size-6 animate-ping rounded-full bg-red-500/25" />
              <span className="relative inline-flex size-6 items-center justify-center rounded-full bg-red-500/15">
                <Mic className="size-4 text-red-600" />
              </span>
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Recording...</p>
              <p className="text-sm text-muted-foreground">
                Reading aloud at your pace. {durationSeconds}s
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
