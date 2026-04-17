import { Button } from "@/components/ui/button";
import type { RecordedAudioEntry } from "@/types/screening";
import { AudioRecorder } from "./AudioRecorder";

interface ParagraphTestProps {
  paragraph: string;
  recordedAudio?: RecordedAudioEntry;
  onBack: () => void;
  onComplete: () => void;
  onRecord: (audio: RecordedAudioEntry) => void;
}

export function ParagraphTest({
  paragraph,
  recordedAudio,
  onBack,
  onComplete,
  onRecord,
}: ParagraphTestProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border/70 bg-card px-6 py-10 text-center shadow-sm sm:px-10">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
            Paragraph
          </p>
          <p className="text-lg text-muted-foreground">Read the full paragraph aloud</p>
        </div>

        <p className="mt-8 text-foreground text-dyslexia-friendly leading-loose sm:text-3xl">
          <span className="inline-block rounded-2xl border border-primary/20 bg-primary/10 px-6 py-6 text-2xl shadow-sm sm:text-3xl">
            {paragraph}
          </span>
        </p>
      </div>

      <AudioRecorder recordedAudio={recordedAudio} onRecorded={onRecord} />

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="button" size="lg" onClick={onComplete}>
          Finish test
        </Button>
      </div>
    </div>
  );
}
