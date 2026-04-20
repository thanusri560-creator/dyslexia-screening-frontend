import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Type } from "lucide-react";
import { useLocation } from "wouter";
import { AgeSelection } from "@/components/screening/AgeSelection";
import { DifficultySelection } from "@/components/screening/DifficultySelection";
import { TestSelection } from "@/components/screening/TestSelection";
import { TestFlow } from "@/components/screening/TestFlow";
import { SpellingTest } from "@/components/screening/SpellingTest";
import { PhonologicalTest } from "@/components/screening/PhonologicalTest";
import { WordRecognitionTest } from "@/components/screening/WordRecognitionTest";
import { SyllableTest } from "@/components/screening/SyllableTest";
import { ResultCard } from "@/components/screening/ResultCard";
import { ScreeningStepIndicator } from "@/components/screening/ScreeningStepIndicator";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import screeningDataJson from "@/data/screeningData.json";
import { Loader2 } from "lucide-react";
import type {
  DifficultyLevel,
  RecordedAudioEntry,
  RecordedAudioMap,
  ScreeningData,
  TestSection,
  TestType,
} from "@/types/screening";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Switch } from "@/components/ui/switch";

const screeningData = screeningDataJson as ScreeningData;

const difficultyOptions: {
  value: DifficultyLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "easy",
    label: "Easy",
    description: "Short, more familiar reading items for a gentle start.",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Balanced reading content with slightly longer vocabulary and sentences.",
  },
  {
    value: "hard",
    label: "Hard",
    description: "More advanced vocabulary, sentence structure, and paragraph complexity.",
  },
];

export default function Screening() {
  const [, setLocation] = useLocation();
  const { settings, updateSettings } = useAccessibility();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);
  const [selectedTests, setSelectedTests] = useState<TestType[]>(["reading"]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<RecordedAudioMap>({});
  const recordedAudioRef = useRef<RecordedAudioMap>({});
  const [testScores, setTestScores] = useState<Record<string, number>>({});
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const analysisTriggeredRef = useRef(false);

  const selectedAgeData = useMemo(
    () =>
      screeningData.age_groups.find(
        (group) => group.age_range === selectedAgeGroup,
      ) ?? null,
    [selectedAgeGroup],
  );

  const selectedLevelData = selectedAgeData && selectedDifficulty
    ? selectedAgeData.levels[selectedDifficulty]
    : null;

  const selectedContent = selectedLevelData?.reading || null;

  const testTypeOptions: { id: TestType; label: string; description: string; icon: string }[] = [
    {
      id: "reading",
      label: "Reading Test",
      description: "Read words, sentences, and paragraphs aloud",
      icon: "📖",
    },
    {
      id: "spelling",
      label: "Spelling Test",
      description: "Spell words and phrases correctly",
      icon: "✍️",
    },
    {
      id: "phonological",
      label: "Phonological Test",
      description: "Identify and manipulate sounds in words",
      icon: "🔊",
    },
    {
      id: "word-recognition",
      label: "Word Recognition Test",
      description: "Recognize and differentiate similar words",
      icon: "👁️",
    },
    {
      id: "syllable",
      label: "Syllable Test",
      description: "Count and segment syllables in words",
      icon: "🎵",
    },
  ];

  useEffect(() => {
    recordedAudioRef.current = recordedAudio;
  }, [recordedAudio]);

  useEffect(() => {
    return () => {
      Object.values(recordedAudioRef.current).forEach((audio) => {
        if (audio) {
          URL.revokeObjectURL(audio.url);
        }
      });
    };
  }, []);

  const resetTest = () => {
    Object.values(recordedAudioRef.current).forEach((audio) => {
      if (audio) {
        URL.revokeObjectURL(audio.url);
      }
    });
    setSelectedAgeGroup(null);
    setSelectedDifficulty(null);
    setSelectedTests(["reading"]);
    setCurrentTestIndex(0);
    setCurrentStep(0);
    setCurrentIndex(0);
    setRecordedAudio({});
    setTestScores({});
    analysisTriggeredRef.current = false;
    setAnalysisError(null);
    setAnalysisResult(null);
    setAnalysisLoading(false);
  };

  useEffect(() => {
    if (currentStep !== 6) return;
    if (analysisTriggeredRef.current) return;
    if (!selectedContent) return;

    analysisTriggeredRef.current = true;
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    const runAnalysis = async () => {
      const formData = new FormData();
      let anyAudio = false;

      const appendAudio = (key: "words" | "sentences" | "paragraph") => {
        const entry = recordedAudio[key];
        if (!entry) return;

        anyAudio = true;

        const mimeType = entry.blob.type || "audio/webm";
        const ext =
          mimeType.includes("webm")
            ? "webm"
            : mimeType.includes("ogg")
              ? "ogg"
              : mimeType.includes("wav")
                ? "wav"
                : "webm";

        const audioFile = new File([entry.blob], `recording.${ext}`, { type: mimeType });

        const backendFieldName =
          key === "words"
            ? "words_audio"
            : key === "sentences"
              ? "sentences_audio"
              : "paragraph_audio";

        formData.append(backendFieldName, audioFile);
      };

      appendAudio("words");
      appendAudio("sentences");
      appendAudio("paragraph");

      if (!anyAudio) {
        setAnalysisError("No recorded audio found. Please complete the test again.");
        setAnalysisLoading(false);
        return;
      }

      // Expected text per section (used by rule-based scoring to estimate expected duration).
      if (recordedAudio.words) {
        formData.append("expected_text_words", selectedContent.words.join(" "));
      }
      if (recordedAudio.sentences) {
        formData.append("expected_text_sentences", selectedContent.sentences.join(" "));
      }
      if (recordedAudio.paragraph) {
        formData.append("expected_text_paragraph", selectedContent.paragraph);
      }

      formData.append("debug", "false");

      try {
        const response = await fetch("http://localhost:8000/api/v1/analyze-audio", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!data?.success) {
          throw new Error(data?.error || "Backend returned an error.");
        }

        setAnalysisResult(data);
      } catch (e: any) {
        setAnalysisError(e?.message || "Failed to analyze audio. Check backend availability.");
      } finally {
        setAnalysisLoading(false);
      }
    };

    void runAnalysis();
  }, [currentStep, recordedAudio, selectedContent]);

  const handleRecord =
    (section: TestSection) => (audio: RecordedAudioEntry) => {
      setRecordedAudio((previous) => {
        const existingAudio = previous[section];
        if (existingAudio) {
          URL.revokeObjectURL(existingAudio.url);
        }

        return {
          ...previous,
          [section]: audio,
        };
      });
    };

  const handleAdvance = () => {
    if (!selectedContent) {
      return;
    }

    if (currentStep === 3) {
      if (currentIndex < selectedContent.words.length - 1) {
        setCurrentIndex((previous) => previous + 1);
        return;
      }

      setCurrentStep(4);
      setCurrentIndex(0);
      return;
    }

    if (currentStep === 4) {
      if (currentIndex < selectedContent.sentences.length - 1) {
        setCurrentIndex((previous) => previous + 1);
        return;
      }

      setCurrentStep(5);
      setCurrentIndex(0);
    }
  };

  const handleBack = () => {
    if (!selectedContent) {
      return;
    }

    if (currentStep === 3) {
      if (currentIndex > 0) {
        setCurrentIndex((previous) => previous - 1);
        return;
      }

      setCurrentStep(2);
      return;
    }

    if (currentStep === 4) {
      if (currentIndex > 0) {
        setCurrentIndex((previous) => previous - 1);
        return;
      }

      setCurrentStep(3);
      setCurrentIndex(selectedContent.words.length - 1);
      return;
    }

    if (currentStep === 5) {
      setCurrentStep(4);
      setCurrentIndex(selectedContent.sentences.length - 1);
    }
  };

  const handleTestComplete = (score: number) => {
    const currentTest = selectedTests[currentTestIndex];
    setTestScores((prev) => ({
      ...prev,
      [currentTest]: score,
    }));

    // Move to next test or finish all tests
    if (currentTestIndex < selectedTests.length - 1) {
      setCurrentTestIndex((prev) => prev + 1);
      // Reset to step 3 for next test (will be handled by rendering logic)
      setCurrentStep(3);
      setCurrentIndex(0);
    } else {
      // All tests completed
      setCurrentStep(6);
    }
  };

  return (
    <ProtectedRoute requiredRole={["student"]}>
      <Layout>
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-end">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Type className="size-4 text-primary" />
                Dyslexia-friendly font
                <Switch
                  checked={settings.dyslexiaFont}
                  onCheckedChange={(checked) => updateSettings({ dyslexiaFont: checked })}
                  aria-label="Toggle dyslexia-friendly font"
                />
              </label>
            </div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">
              Dynamic screening flow
            </p>
            <h1 className="text-display text-4xl text-foreground sm:text-5xl">
              Dyslexia screening test
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground">
              Move through age selection, difficulty selection, and three reading tasks.
              Each section supports audio capture in the UI and is ready for later backend integration.
            </p>
          </div>

          {currentStep === 0 ? (
            <AgeSelection
              ageGroups={screeningData.age_groups}
              selectedAgeGroup={selectedAgeGroup}
              onSelect={(ageRange) => {
                setSelectedAgeGroup(ageRange);
                setSelectedDifficulty(null);
              }}
              onContinue={() => {
                if (selectedAgeGroup) {
                  setCurrentStep(1);
                }
              }}
            />
          ) : null}

          {currentStep === 1 ? (
            <DifficultySelection
              options={difficultyOptions}
              selectedDifficulty={selectedDifficulty}
              onBack={() => setCurrentStep(0)}
              onSelect={setSelectedDifficulty}
              onContinue={() => {
                if (selectedDifficulty) {
                  setCurrentStep(2);
                }
              }}
            />
          ) : null}

          {currentStep === 2 ? (
            <TestSelection
              options={testTypeOptions}
              selectedTests={selectedTests}
              onBack={() => setCurrentStep(1)}
              onToggleTest={(testId: TestType) => {
                setSelectedTests((prev) =>
                  prev.includes(testId)
                    ? prev.filter((id) => id !== testId)
                    : [...prev, testId]
                );
              }}
              onContinue={() => {
                if (selectedTests.length > 0) {
                  setCurrentStep(3);
                  setCurrentIndex(0);
                }
              }}
            />
          ) : null}

          {selectedContent && currentStep >= 3 && currentStep <= 5 ? (
            <>
              {/* Show current test indicator */}
              <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                      Test {currentTestIndex + 1} of {selectedTests.length}
                    </p>
                    <h2 className="mt-2 text-3xl text-display">
                      {selectedTests[currentTestIndex] === "reading"
                        ? "Reading Test"
                        : selectedTests[currentTestIndex] === "spelling"
                          ? "Spelling Test"
                          : selectedTests[currentTestIndex] === "phonological"
                            ? "Phonological Test"
                            : selectedTests[currentTestIndex] === "word-recognition"
                              ? "Word Recognition Test"
                              : "Syllable Test"}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Render current test */}
              {selectedTests[currentTestIndex] === "reading" ? (
                <TestFlow
                  content={selectedContent}
                  currentStep={currentStep}
                  currentIndex={currentIndex}
                  recordedAudio={recordedAudio}
                  onBack={handleBack}
                  onNext={handleAdvance}
                  onComplete={() => handleTestComplete(0.5)}
                  onRecord={handleRecord}
                />
              ) : selectedTests[currentTestIndex] === "spelling" && selectedLevelData ? (
                <SpellingTest
                  data={selectedLevelData.spelling}
                  onComplete={handleTestComplete}
                  onBack={() => setCurrentStep(2)}
                />
              ) : selectedTests[currentTestIndex] === "phonological" && selectedLevelData ? (
                <PhonologicalTest
                  data={selectedLevelData.phonological}
                  onComplete={handleTestComplete}
                  onBack={() => setCurrentStep(2)}
                />
              ) : selectedTests[currentTestIndex] === "word-recognition" && selectedLevelData ? (
                <WordRecognitionTest
                  data={selectedLevelData.word_recognition}
                  onComplete={handleTestComplete}
                  onBack={() => setCurrentStep(2)}
                />
              ) : selectedTests[currentTestIndex] === "syllable" && selectedLevelData ? (
                <SyllableTest
                  data={selectedLevelData.syllable}
                  onComplete={handleTestComplete}
                  onBack={() => setCurrentStep(2)}
                />
              ) : null}
            </>
          ) : null}

          {currentStep === 6 ? (
            <div className="space-y-6">
              <ScreeningStepIndicator activeStep={4} />
              <Card className="border-border/80 shadow-md">
                <CardHeader className="items-center text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/15">
                    <CheckCircle2 className="size-8 text-primary" />
                  </div>
                  <CardTitle className="text-3xl text-display">
                    Your test is completed
                  </CardTitle>
                  <CardDescription className="max-w-xl text-base leading-7">
                    We&apos;re analyzing your recording to generate a preliminary screening result.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {analysisLoading ? (
                    <div className="flex items-center justify-center gap-3 py-6">
                      <Loader2 className="size-6 animate-spin text-primary" />
                      <p className="text-base text-muted-foreground">
                        Analyzing your reading...
                        <span className="block text-sm text-muted-foreground/80 mt-1 animate-pulse">
                          Please wait
                        </span>
                      </p>
                    </div>
                  ) : null}

                  {analysisError ? (
                    <div className="rounded-2xl border border-destructive/35 bg-destructive/5 p-4">
                      <p className="text-sm font-semibold text-foreground">We couldn&apos;t analyze your recording</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {analysisError}
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground/90">
                        Tip: try recording again in a quieter space.
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {analysisResult && analysisResult.success ? (
                <ResultCard
                  riskLevel={analysisResult.risk_level}
                  message={analysisResult.message}
                  source={analysisResult.source}
                  disclaimer={analysisResult.disclaimer}
                  finalScore={analysisResult.final_score ?? analysisResult.fluency_score}
                  breakdown={analysisResult.breakdown}
                  totalDuration={analysisResult.details?.total_duration ?? analysisResult.details?.duration ?? 0}
                  totalPauses={analysisResult.details?.total_pauses ?? analysisResult.details?.pause_count ?? 0}
                  comparisonScore={analysisResult.comparison_score}
                  predictedText={analysisResult.predicted_text}
                  wordComparison={analysisResult.word_comparison}
                  fluencyScore={analysisResult.fluency_score}
                  duration={analysisResult.details?.duration ?? 0}
                  pauseCount={analysisResult.details?.pause_count ?? 0}
                />
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" size="lg" onClick={resetTest} disabled={analysisLoading}>
                  Start again
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => setLocation("/student-dashboard")}
                  disabled={analysisLoading}
                >
                  Back to dashboard
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
