import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TestTypeOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}

interface TestSelectionProps {
  options: TestTypeOption[];
  selectedTests: string[];
  onBack: () => void;
  onToggleTest: (testId: string) => void;
  onContinue: () => void;
}

export function TestSelection({
  options,
  selectedTests,
  onBack,
  onToggleTest,
  onContinue,
}: TestSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Select Tests</h2>
        <p className="text-muted-foreground">
          Choose which tests you'd like to include in the screening.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedTests.includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => onToggleTest(option.id)}
              className={`flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{option.icon}</span>
                  <h3 className="text-lg font-semibold text-foreground">
                    {option.label}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
              {isSelected && (
                <div className="flex size-6 items-center justify-center rounded-full bg-primary">
                  <Check className="size-4 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={onContinue} disabled={selectedTests.length === 0}>
          Continue ({selectedTests.length} selected)
        </Button>
      </div>
    </div>
  );
}
