import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { WordRecognitionLevelContent } from "@/types/screening";

interface WordRecognitionTestProps {
  data: WordRecognitionLevelContent;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function WordRecognitionTest({ data, onComplete, onBack }: WordRecognitionTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const currentPair = data.word_pairs[currentIndex];
  const options = [currentPair.target, ...currentPair.distractors];

  const handleSelect = (selected: string) => {
    if (selected === currentPair.target) {
      setScore((prev) => prev + 1);
    }

    if (currentIndex < data.word_pairs.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const finalScore = (score + (selected === currentPair.target ? 1 : 0)) / data.word_pairs.length;
      onComplete(finalScore);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Word Recognition Test</h3>
        <p className="text-muted-foreground">
          Select the correct word from the options below.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <p className="text-lg font-medium">
          Question {currentIndex + 1} of {data.word_pairs.length}
        </p>

        <div className="grid gap-3">
          {options.map((option, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="justify-start text-left h-auto py-3 px-4"
              onClick={() => handleSelect(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      <Button onClick={onBack} variant="outline">
        Back
      </Button>
    </div>
  );
}
