import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PredictionResult {
  prediction: "Dyslexic" | "Non-Dyslexic";
  confidence: number | null;
  class_probabilities: number[] | null;
}

interface AudioPredictionResultProps {
  result: PredictionResult | null;
  isLoading: boolean;
  error: string | null;
  onReset: () => void;
}

export function AudioPredictionResult({
  result,
  isLoading,
  error,
  onReset,
}: AudioPredictionResultProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-secondary/35 p-8 space-y-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-foreground">
            Analyzing audio...
          </p>
          <p className="text-sm text-muted-foreground">
            Please wait while we process your audio
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-6 text-destructive mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Analysis Failed
            </h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={onReset} variant="secondary" className="mt-2">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const isDyslexic = result.prediction === "Dyslexic";

  return (
    <div
      className={`rounded-2xl border p-6 space-y-4 ${
        isDyslexic
          ? "border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/20"
          : "border-green-300/50 bg-green-50/50 dark:bg-green-950/20"
      }`}
    >
      <div className="flex items-start gap-4">
        {isDyslexic ? (
          <AlertCircle className="size-8 text-amber-600 dark:text-amber-400 mt-1" />
        ) : (
          <CheckCircle className="size-8 text-green-600 dark:text-green-400 mt-1" />
        )}

        <div className="space-y-3 flex-1">
          <div>
            <h3 className="text-2xl font-bold text-foreground">
              {result.prediction}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isDyslexic
                ? "The audio analysis indicates potential signs of dyslexia"
                : "The audio analysis shows no significant signs of dyslexia"}
            </p>
          </div>

          {result.confidence !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confidence Level</span>
                <span className="font-semibold text-foreground">
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-background/50 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isDyslexic ? "bg-amber-500" : "bg-green-500"
                  }`}
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
            </div>
          )}

          {result.class_probabilities && (
            <div className="rounded-lg bg-background/50 p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">
                Detailed Probabilities:
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Non-Dyslexic</span>
                  <span className="font-medium">
                    {(result.class_probabilities[0] * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dyslexic</span>
                  <span className="font-medium">
                    {(result.class_probabilities[1] * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> This is a screening tool and not a
              diagnosis. Please consult with a qualified professional for a
              comprehensive assessment.
            </p>
          </div>

          <Button onClick={onReset} variant="outline" className="mt-2">
            Test Another Audio
          </Button>
        </div>
      </div>
    </div>
  );
}
