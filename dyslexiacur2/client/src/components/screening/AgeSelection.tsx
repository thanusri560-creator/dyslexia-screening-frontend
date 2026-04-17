import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScreeningAgeGroup } from "@/types/screening";

interface AgeSelectionProps {
  ageGroups: ScreeningAgeGroup[];
  selectedAgeGroup: string | null;
  onSelect: (ageRange: string) => void;
  onContinue: () => void;
}

export function AgeSelection({
  ageGroups,
  selectedAgeGroup,
  onSelect,
  onContinue,
}: AgeSelectionProps) {
  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl text-display">Select age group</CardTitle>
        <CardDescription className="text-base leading-7">
          Choose the learner&apos;s age range to load the appropriate screening content.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {ageGroups.map((group) => {
            const isSelected = selectedAgeGroup === group.age_range;

            return (
              <button
                key={group.age_range}
                type="button"
                onClick={() => onSelect(group.age_range)}
                className={[
                  "rounded-2xl border p-6 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-primary bg-primary/15"
                    : "border-border bg-background hover:border-primary/60 hover:bg-secondary/40",
                ].join(" ")}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Age group
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">
                  {group.age_range}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            size="lg"
            onClick={onContinue}
            disabled={!selectedAgeGroup}
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
