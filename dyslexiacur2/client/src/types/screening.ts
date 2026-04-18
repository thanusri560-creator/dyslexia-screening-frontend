export type DifficultyLevel = "easy" | "moderate" | "hard";

export type TestSection = "words" | "sentences" | "paragraph";

export type TestType = "reading" | "spelling" | "phonological" | "word-recognition" | "syllable";

export interface ScreeningLevelContent {
  words: string[];
  sentences: string[];
  paragraph: string;
}

export interface SpellingLevelContent {
  words: string[];
  word_options?: string[][]; // Multiple choice options for each word
}

export interface PhonologicalLevelContent {
  sound_tasks: {
    instruction: string;
    word: string;
    answer: string;
    options?: string[];
  }[];
}

export interface WordRecognitionLevelContent {
  word_pairs: {
    target: string;
    distractors: string[];
  }[];
}

export interface SyllableLevelContent {
  words: {
    word: string;
    syllable_count: number;
  }[];
}

export interface ScreeningLevelData {
  reading: ScreeningLevelContent;
  spelling: SpellingLevelContent;
  phonological: PhonologicalLevelContent;
  word_recognition: WordRecognitionLevelContent;
  syllable: SyllableLevelContent;
}

export interface ScreeningAgeGroup {
  age_range: string;
  levels: Record<DifficultyLevel, ScreeningLevelData>;
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
