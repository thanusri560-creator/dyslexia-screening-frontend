import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

const steps: { step: Step; label: string }[] = [
  { step: 1, label: "Words" },
  { step: 2, label: "Sentences" },
  { step: 3, label: "Paragraph" },
  { step: 4, label: "Result" },
];

function stepToProgress(activeStep: Step) {
  // 4 steps => 25% increments.
  return (activeStep / steps.length) * 100;
}

export function ScreeningStepIndicator({ activeStep }: { activeStep: Step }) {
  const progressValue = stepToProgress(activeStep);

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-border/70 bg-card px-5 py-4 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Progress
            </p>
            <p className="mt-2 text-base text-foreground">
              Step {activeStep} of 4
            </p>
          </div>
          <p className="text-sm font-medium text-muted-foreground">{Math.round(progressValue)}%</p>
        </div>

        <div className="mt-3">
          <Progress value={progressValue} className="h-3" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {steps.map(({ step, label }) => {
            const isActive = step === activeStep;
            const isComplete = step < activeStep;

            return (
              <div
                key={step}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-center transition-colors",
                  isActive
                    ? "border-primary bg-primary/15"
                    : isComplete
                      ? "border-primary/60 bg-secondary/50"
                      : "border-border bg-background",
                )}
              >
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Step {step}
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

