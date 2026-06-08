import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { SyllableLevelContent } from "@/types/screening";

interface SyllableTestProps {
  data: SyllableLevelContent;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function SyllableTest({ data, onComplete, onBack }: SyllableTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const currentWord = data.words[currentIndex];

  const handleSelect = (selected: number) => {
    if (selected === currentWord.syllable_count) {
      setScore((prev) => prev + 1);
    }

    if (currentIndex < data.words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const finalScore = (score + (selected === currentWord.syllable_count ? 1 : 0)) / data.words.length;
      onComplete(finalScore);
    }
  };

  const syllableOptions = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Syllable Test</h3>
        <p className="text-muted-foreground">
          How many syllables does this word have?
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <p className="text-lg font-medium">
          Word {currentIndex + 1} of {data.words.length}
        </p>

        <p className="text-3xl font-bold text-center py-6">
          {currentWord.word}
        </p>

        <div className="grid grid-cols-5 gap-3">
          {syllableOptions.map((num) => (
            <Button
              key={num}
              variant="outline"
              className="h-16 text-2xl font-bold"
              onClick={() => handleSelect(num)}
            >
              {num}
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
