import { useState } from "react";
import { AudioRecorder } from "./AudioRecorder";
import { AudioPredictionResult } from "./AudioPredictionResult";
import { audioPredictionAPI } from "@/lib/api";
import type { RecordedAudioEntry } from "@/types/screening";

export function AudioTestWithPrediction() {
  const [recordedAudio, setRecordedAudio] = useState<RecordedAudioEntry | undefined>();
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{
    prediction: "Dyslexic" | "Non-Dyslexic";
    confidence: number | null;
    class_probabilities: number[] | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecorded = (audio: RecordedAudioEntry) => {
    setRecordedAudio(audio);
    setError(null);
    setPredictionResult(null);
  };

  const handlePredict = async () => {
    if (!recordedAudio) return;

    setIsPredicting(true);
    setError(null);
    setPredictionResult(null);

    try {
      const result = await audioPredictionAPI.predictFromAudio(recordedAudio.blob);
      setPredictionResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze audio");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleReset = () => {
    setRecordedAudio(undefined);
    setPredictionResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Audio Test</h3>
        <p className="text-muted-foreground">
          Record yourself reading the text above. Our AI will analyze your audio
          to screen for potential signs of dyslexia.
        </p>
      </div>

      <AudioRecorder recordedAudio={recordedAudio} onRecorded={handleRecorded} />

      {recordedAudio && !predictionResult && !isPredicting && (
        <div className="flex gap-3">
          <button
            onClick={handlePredict}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Analyze Audio
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
          >
            Record Again
          </button>
        </div>
      )}

      <AudioPredictionResult
        result={predictionResult}
        isLoading={isPredicting}
        error={error}
        onReset={handleReset}
      />
    </div>
  );
}
