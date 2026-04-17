import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DifficultyLevel } from "@/types/screening";

interface DifficultyOption {
  value: DifficultyLevel;
  label: string;
  description: string;
}

interface DifficultySelectionProps {
  options: DifficultyOption[];
  selectedDifficulty: DifficultyLevel | null;
  onBack: () => void;
  onSelect: (difficulty: DifficultyLevel) => void;
  onContinue: () => void;
}

export function DifficultySelection({
  options,
  selectedDifficulty,
  onBack,
  onSelect,
  onContinue,
}: DifficultySelectionProps) {
  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl text-display">Select difficulty</CardTitle>
        <CardDescription className="text-base leading-7">
          Pick the reading difficulty level for this screening session.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {options.map((option) => {
            const isSelected = selectedDifficulty === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={[
                  "rounded-2xl border p-6 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-primary bg-primary/15"
                    : "border-border bg-background hover:border-primary/60 hover:bg-secondary/40",
                ].join(" ")}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Difficulty
                </p>
                <p className="mt-3 text-2xl font-semibold capitalize text-foreground">
                  {option.label}
                </p>
                <p className="mt-3 text-base text-muted-foreground">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={onContinue}
            disabled={!selectedDifficulty}
          >
            Start test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
