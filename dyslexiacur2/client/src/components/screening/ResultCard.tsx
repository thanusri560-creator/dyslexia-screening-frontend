import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WordComparisonHighlight } from "./WordComparisonHighlight";
import type { WordComparisonItem } from "@/types/screening";

interface ResultCardProps {
  riskLevel: string;
  message: string;
  disclaimer?: string;
  source?: string;

  // Aggregated API fields (preferred)
  finalScore?: number;
  breakdown?: {
    words?: number | null;
    sentences?: number | null;
    paragraph?: number | null;
  };
  totalDuration?: number;
  totalPauses?: number;
  comparisonScore?: number;
  predictedText?: string;
  wordComparison?: WordComparisonItem[];

  // Legacy API fields (backward compatibility)
  fluencyScore?: number;
  duration?: number;
  pauseCount?: number;
}

function riskTone(riskLevel: string) {
  const normalized = riskLevel.trim().toLowerCase();
  if (normalized === "low") return "border-primary bg-primary/10";
  if (normalized === "moderate") return "border-accent bg-accent/10";
  if (normalized === "high") return "border-destructive bg-destructive/10";
  return "border-border bg-secondary/40";
}

export function ResultCard({
  riskLevel,
  message,
  disclaimer,
  source,
  finalScore,
  breakdown,
  totalDuration,
  totalPauses,
  comparisonScore,
  predictedText,
  wordComparison,
  fluencyScore,
  duration,
  pauseCount,
}: ResultCardProps) {
  const displayScore = typeof finalScore === "number" ? finalScore : fluencyScore ?? 0;
  const displayDuration = typeof totalDuration === "number" ? totalDuration : duration ?? 0;
  const displayPauses = typeof totalPauses === "number" ? totalPauses : pauseCount ?? 0;

  const normalized = riskLevel.trim().toLowerCase();
  const badgeClassName =
    normalized === "low"
      ? "border-primary bg-primary/15 text-primary"
      : normalized === "moderate"
        ? "border-accent bg-accent/15 text-accent"
        : normalized === "high"
          ? "border-destructive bg-destructive/10 text-destructive"
          : "border-border bg-secondary/40 text-foreground";

  const riskExplanation =
    normalized === "low"
      ? "Low risk based on reading speed and pause patterns. Keep practicing with short, supportive reading sessions."
      : normalized === "moderate"
        ? "Moderate risk signs were detected. Consider extra reading support and structured practice to build fluency."
        : "High risk signs were detected. A professional assessment is recommended for a more complete evaluation.";

  const suggestions =
    normalized === "low"
      ? [
          "Use a calm pace and take brief breaks every few minutes.",
          "Read the same short text multiple times to build confidence.",
          "Encourage word-by-word tracking (left-to-right) with clear spacing.",
        ]
      : normalized === "moderate"
        ? [
            "Practice with dyslexia-friendly materials (larger font + extra spacing).",
            "Try repeated reading: 2–3 rounds of the same words or sentences.",
            "Record short sessions and compare comfort level over time.",
          ]
        : [
            "Schedule a professional evaluation for guidance and next steps.",
            "Use multi-sensory reading strategies (say it, read it, trace it).",
            "Focus on accuracy first, then gradually increase speed.",
          ];

  const scorePercent = Math.max(0, Math.min(100, displayScore * 100));

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-3xl text-display">Screening Result</CardTitle>
        <CardDescription className="leading-7">{message}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className={`rounded-2xl border p-5 ${riskTone(riskLevel)}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Badge className={`rounded-xl border text-sm px-4 py-2 ${badgeClassName}`}>
                {riskLevel}
              </Badge>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Final score
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {Math.round(displayScore * 100) / 100}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Fluency progress
              </p>
              <p className="text-sm font-medium text-muted-foreground">{Math.round(scorePercent)}%</p>
            </div>
            <Progress value={scorePercent} className="h-3" />
          </div>
        </div>

        {breakdown ? (
          <div className="grid gap-4 rounded-2xl bg-secondary/40 p-5 sm:grid-cols-3">
            {(
              [
                ["words", "Words"],
                ["sentences", "Sentences"],
                ["paragraph", "Paragraph"],
              ] as const
            ).map(([key, label]) => {
              const value = breakdown[key] ?? null;
              if (value === null) return null;

              return (
                <div
                  key={key}
                  className="rounded-xl border border-border bg-background/50 p-4 text-center"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {Math.round(value * 100) / 100}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}

        {typeof comparisonScore === "number" ? (
          <div className="rounded-2xl border border-border bg-secondary/30 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Reading match score
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {Math.round(comparisonScore * 100)}%
            </p>
            {predictedText ? (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Transcript: {predictedText}
              </p>
            ) : null}
          </div>
        ) : null}

        {wordComparison && wordComparison.length > 0 ? (
          <WordComparisonHighlight items={wordComparison} />
        ) : null}

        <div className="grid gap-4 rounded-2xl bg-secondary/40 p-5 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background/50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Duration
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {displayDuration.toFixed(1)}s
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Pause count
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {displayPauses}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Explanation
          </p>
          <p className="text-base text-foreground leading-relaxed">{riskExplanation}</p>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Suggestions
          </p>
          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <ul className="space-y-2">
              {suggestions.map((s) => (
                <li key={s} className="text-sm text-muted-foreground leading-relaxed">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {source ? (
          <p className="text-sm text-muted-foreground">
            Source: <span className="font-medium text-foreground">{source}</span>
          </p>
        ) : null}

        {disclaimer ? (
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <p className="text-sm text-muted-foreground">{disclaimer}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

