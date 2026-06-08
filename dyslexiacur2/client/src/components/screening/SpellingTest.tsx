import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { SpellingLevelContent } from "@/types/screening";

interface SpellingTestProps {
  data: SpellingLevelContent;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function SpellingTest({ data, onComplete, onBack }: SpellingTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const currentWord = data.words[currentIndex];
  const options = data.word_options?.[currentIndex] || [currentWord];

  const handleSelect = (selected: string) => {
    if (selected === currentWord) {
      setScore((prev) => prev + 1);
    }

    if (currentIndex < data.words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const finalScore = (score + (selected === currentWord ? 1 : 0)) / data.words.length;
      onComplete(finalScore);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Spelling Test</h3>
        <p className="text-muted-foreground">
          Select the correct spelling of the word you hear.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <p className="text-lg font-medium">
          Word {currentIndex + 1} of {data.words.length}
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
