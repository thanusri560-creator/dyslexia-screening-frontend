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

  // All test results
  allTestResults?: Record<string, any>;
  selectedTests?: string[];
  comprehensive_assessment?: {
    audio_analysis?: {
      risk_level?: string;
      risk_score?: number;
      fluency_score?: number;
    };
    test_performance?: {
      total_tests?: number;
      average_score?: number | null;
    };
  };
  analysis_details?: {
    ml_prediction?: string;
    ml_confidence?: number;
    dyslexic_probability?: number;
    pause_analysis?: {
      total_pauses: number;
      avg_pauses_per_file: number;
      pause_risk_score: number;
    };
    duration_analysis?: {
      total_duration: number;
      avg_duration_per_file: number;
      duration_risk_score: number;
    };
    combined_risk_score?: number;
  };
  recommendation?: string;
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
  allTestResults,
  selectedTests,
  comprehensive_assessment,
  analysis_details,
  recommendation,
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

  // Get test display names
  const getTestDisplayName = (testId: string) => {
    const names: Record<string, string> = {
      'reading': 'Reading Test',
      'spelling': 'Spelling Test',
      'phonological': 'Phonological Test',
      'word-recognition': 'Word Recognition Test',
      'syllable': 'Syllable Test'
    };
    return names[testId] || testId;
  };

  // Calculate overall score from all tests
  const calculateOverallScore = () => {
    if (!allTestResults || Object.keys(allTestResults).length === 0) return null;
    
    const scores = Object.values(allTestResults).map((result: any) => result.score);
    if (scores.length === 0) return null;
    
    const average = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
    return Math.round(average * 100);
  };

  const overallScore = calculateOverallScore();

  // Get comprehensive risk information
  const audioRiskLevel = comprehensive_assessment?.audio_analysis?.risk_level || riskLevel;
  const riskScore = comprehensive_assessment?.audio_analysis?.risk_score || 0;
  const testAvgScore = comprehensive_assessment?.test_performance?.average_score;
  const totalTests = comprehensive_assessment?.test_performance?.total_tests || 0;
  const hasAudioAnalysis = comprehensive_assessment?.audio_analysis !== null && comprehensive_assessment?.audio_analysis !== undefined;

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl text-display">VoxLexi Screening Result</CardTitle>
          {analysis_details?.ml_prediction && analysis_details.ml_prediction !== 'Not performed (no reading test)' && (
            <Badge className="rounded-xl border text-sm px-4 py-2 bg-secondary/50">
              ML: {analysis_details.ml_prediction}
            </Badge>
          )}
        </div>
        <CardDescription className="leading-7">{message}</CardDescription>
        {recommendation && (
          <p className="text-sm font-medium text-primary">{recommendation}</p>
        )}
        {analysis_details?.note && (
          <p className="text-xs text-muted-foreground italic">{analysis_details.note}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className={`rounded-2xl border p-5 ${riskTone(audioRiskLevel)}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Badge className={`rounded-xl border text-sm px-4 py-2 ${badgeClassName}`}>
                {audioRiskLevel.toUpperCase()} RISK
              </Badge>
              {riskScore > 0 && (
                <div className="text-sm text-muted-foreground">
                  Risk Score: {Math.round(riskScore)}%
                </div>
              )}
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {hasAudioAnalysis ? 'Fluency Score' : 'Test Score'}
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {Math.round(displayScore * 100) / 100}%
              </p>
            </div>
          </div>
          {!hasAudioAnalysis && (
            <p className="mt-3 text-xs text-muted-foreground italic">
              * Based on cognitive test performance only (no audio analysis)
            </p>
          )}

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

        {allTestResults && Object.keys(allTestResults).length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Assessment Test Results
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(allTestResults).map(([testId, result]: [string, any]) => (
                <div
                  key={testId}
                  className="rounded-xl border border-border bg-background/50 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    {getTestDisplayName(testId)}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {Math.round(result.score * 100)}%
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Score: {Math.round(result.score * 100)}/100
                  </p>
                </div>
              ))}
            </div>
            {overallScore !== null && (
              <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Average Test Score
                </p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {overallScore}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Across {Object.keys(allTestResults).length} test(s)
                </p>
              </div>
            )}
          </div>
        ) : null}

        {hasAudioAnalysis && analysis_details ? (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Detailed Audio Analysis
            </p>
            
            {/* ML Prediction Details */}
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">ML Model Prediction</h4>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Prediction</p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {analysis_details.ml_prediction}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {analysis_details.ml_confidence}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dyslexic Probability</p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {analysis_details.dyslexic_probability}%
                  </p>
                </div>
              </div>
            </div>

            {/* Pause Analysis */}
            {analysis_details.pause_analysis && (
              <div className="rounded-xl border border-border bg-background/50 p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">Pause Analysis</h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Pauses</p>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      {analysis_details.pause_analysis.total_pauses}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg per Recording</p>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      {analysis_details.pause_analysis.avg_pauses_per_file}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pause Risk Score</p>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      {analysis_details.pause_analysis.pause_risk_score}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Duration Analysis */}
            {analysis_details.duration_analysis && (
              <div className="rounded-xl border border-border bg-background/50 p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">Duration Analysis</h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Duration</p>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      {analysis_details.duration_analysis.total_duration}s
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg per Recording</p>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      {analysis_details.duration_analysis.avg_duration_per_file}s
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration Risk Score</p>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      {analysis_details.duration_analysis.duration_risk_score}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Combined Risk Score */}
            {analysis_details.combined_risk_score && (
              <div className="rounded-xl border-2 border-accent bg-accent/5 p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Combined Dyslexia Risk Score</h4>
                <p className="text-4xl font-bold text-accent">
                  {Math.round(analysis_details.combined_risk_score)}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on ML prediction (50%), pause patterns (30%), and duration (20%)
                </p>
              </div>
            )}
          </div>
        ) : null}

        <div className="grid gap-4 rounded-2xl bg-secondary/40 p-5 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background/50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Duration
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {hasAudioAnalysis ? `${displayDuration.toFixed(1)}s` : 'N/A'}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Pause count
            </p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {hasAudioAnalysis ? displayPauses : 'N/A'}
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

