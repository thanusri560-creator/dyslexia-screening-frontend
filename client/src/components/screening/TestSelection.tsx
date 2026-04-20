import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TestType } from "@/types/screening";

interface TestOption {
  id: TestType;
  label: string;
  description: string;
  icon: string;
}

interface TestSelectionProps {
  options: TestOption[];
  selectedTests: TestType[];
  onBack: () => void;
  onToggleTest: (testId: TestType) => void;
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
      <Card className="border-border/80 shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-display">Select Tests</CardTitle>
          <CardDescription className="text-base">
            Choose which screening tests you would like to complete. You can select multiple tests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {options.map((option) => {
            const isSelected = selectedTests.includes(option.id);
            return (
              <div
                key={option.id}
                className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border/70 bg-card"
                }`}
                onClick={() => onToggleTest(option.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {isSelected ? (
                      <CheckCircle2 className="size-5 text-primary" />
                    ) : (
                      <Circle className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{option.icon}</span>
                      <h3 className="font-semibold text-lg">{option.label}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={onContinue}
          disabled={selectedTests.length === 0}
        >
          Continue with {selectedTests.length} test{selectedTests.length !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}
