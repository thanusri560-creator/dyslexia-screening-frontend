import type {
  RecordedAudioEntry,
  RecordedAudioMap,
  ScreeningLevelContent,
} from "@/types/screening";
import { ScreeningStepIndicator } from "./ScreeningStepIndicator";
import { ParagraphTest } from "./ParagraphTest";
import { SentenceTest } from "./SentenceTest";
import { WordTest } from "./WordTest";

interface TestFlowProps {
  content: ScreeningLevelContent;
  currentStep: number;
  currentIndex: number;
  recordedAudio: RecordedAudioMap;
  onBack: () => void;
  onNext: () => void;
  onComplete: () => void;
  onRecord: (
    section: "words" | "sentences" | "paragraph",
  ) => (audio: RecordedAudioEntry) => void;
}

export function TestFlow({
  content,
  currentStep,
  currentIndex,
  recordedAudio,
  onBack,
  onNext,
  onComplete,
  onRecord,
}: TestFlowProps) {
  const activeStep: 1 | 2 | 3 = currentStep === 3 ? 1 : currentStep === 4 ? 2 : 3;

  const currentQuestionTotal =
    currentStep === 3
      ? content.words.length
      : currentStep === 4
        ? content.sentences.length
        : 1;

  const questionLabel =
    currentStep === 5
      ? "Paragraph 1 of 1"
      : `Item ${currentIndex + 1} of ${currentQuestionTotal}`;

  return (
    <div className="space-y-8">
      <ScreeningStepIndicator activeStep={activeStep} />

      <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              Reading assessment
            </p>
            <h2 className="mt-2 text-3xl text-display">Listen and read</h2>
          </div>
          <p className="text-base text-muted-foreground">{questionLabel}</p>
        </div>
      </div>

      {currentStep === 3 ? (
        <WordTest
          words={content.words}
          currentIndex={currentIndex}
          recordedAudio={recordedAudio.words}
          onBack={onBack}
          onNext={onNext}
          onRecord={onRecord("words")}
        />
      ) : null}

      {currentStep === 4 ? (
        <SentenceTest
          sentences={content.sentences}
          currentIndex={currentIndex}
          recordedAudio={recordedAudio.sentences}
          onBack={onBack}
          onNext={onNext}
          onRecord={onRecord("sentences")}
        />
      ) : null}

      {currentStep === 5 ? (
        <ParagraphTest
          paragraph={content.paragraph}
          recordedAudio={recordedAudio.paragraph}
          onBack={onBack}
          onComplete={onComplete}
          onRecord={onRecord("paragraph")}
        />
      ) : null}
    </div>
  );
}
