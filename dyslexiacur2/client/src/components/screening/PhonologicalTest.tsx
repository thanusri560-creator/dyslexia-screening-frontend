import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { PhonologicalLevelContent } from "@/types/screening";

interface PhonologicalTestProps {
  data: PhonologicalLevelContent;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function PhonologicalTest({ data, onComplete, onBack }: PhonologicalTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const currentTask = data.sound_tasks[currentIndex];

  const handleSelect = (selected: string) => {
    if (selected === currentTask.answer) {
      setScore((prev) => prev + 1);
    }

    if (currentIndex < data.sound_tasks.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const finalScore = (score + (selected === currentTask.answer ? 1 : 0)) / data.sound_tasks.length;
      onComplete(finalScore);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Phonological Test</h3>
        <p className="text-muted-foreground">
          {currentTask.instruction}
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <p className="text-lg font-medium">
          Task {currentIndex + 1} of {data.sound_tasks.length}
        </p>

        <p className="text-xl font-semibold text-center py-4">
          {currentTask.word}
        </p>

        {currentTask.options ? (
          <div className="grid gap-3">
            {currentTask.options.map((option, idx) => (
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
        ) : (
          <p className="text-sm text-muted-foreground">
            Answer: {currentTask.answer}
          </p>
        )}
      </div>

      <Button onClick={onBack} variant="outline">
        Back
      </Button>
    </div>
  );
}
