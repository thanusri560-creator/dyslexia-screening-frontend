export type DifficultyLevel = "easy" | "moderate" | "hard";

export type TestSection = "words" | "sentences" | "paragraph";

export interface ScreeningLevelContent {
  words: string[];
  sentences: string[];
  paragraph: string;
}

export interface ScreeningAgeGroup {
  age_range: string;
  levels: Record<DifficultyLevel, ScreeningLevelContent>;
}

export interface ScreeningData {
  age_groups: ScreeningAgeGroup[];
}

export interface RecordedAudioEntry {
  blob: Blob;
  url: string;
  durationMs: number;
}

export type RecordedAudioMap = Partial<Record<TestSection, RecordedAudioEntry>>;

export interface WordComparisonItem {
  word: string;
  status: "correct" | "wrong" | "missing";
  expected?: string | null;
  predicted?: string | null;
}
