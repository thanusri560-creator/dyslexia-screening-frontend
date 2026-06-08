import { Button } from "@/components/ui/button";
import type { RecordedAudioEntry } from "@/types/screening";
import { AudioRecorder } from "./AudioRecorder";

interface WordTestProps {
  words: string[];
  currentIndex: number;
  recordedAudio?: RecordedAudioEntry;
  onBack: () => void;
  onNext: () => void;
  onRecord: (audio: RecordedAudioEntry) => void;
}

export function WordTest({
  words,
  currentIndex,
  recordedAudio,
  onBack,
  onNext,
  onRecord,
}: WordTestProps) {
  const currentWord = words[currentIndex];
  const wordNumber = currentIndex + 1;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border/70 bg-card px-6 py-10 text-center shadow-sm sm:px-10">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
            Word {wordNumber} of {words.length}
          </p>
          <p className="text-lg text-muted-foreground">
            Read this word aloud
          </p>
        </div>

        <p className="mt-8 text-foreground text-dyslexia-friendly leading-relaxed">
          <span className="inline-block rounded-2xl border border-primary/20 bg-primary/10 px-6 py-5 text-5xl font-semibold tracking-[0.06em] shadow-sm sm:text-6xl">
            {currentWord}
          </span>
        </p>
      </div>

      <AudioRecorder recordedAudio={recordedAudio} onRecorded={onRecord} />

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="button" size="lg" onClick={onNext}>
          {currentIndex === words.length - 1 ? "Continue to sentences" : "Next"}
        </Button>
      </div>
    </div>
  );
}
