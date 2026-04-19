from __future__ import annotations

import math
import re
from dataclasses import dataclass
from typing import Any

import librosa
import numpy as np


_WORD_RE = re.compile(r"[A-Za-z]+(?:'[A-Za-z]+)?")


def count_words(text: str) -> int:
  if not text:
    return 0
  return len(_WORD_RE.findall(text))


def clamp01(x: float) -> float:
  if not math.isfinite(x):
    return 0.0
  return max(0.0, min(1.0, float(x)))


@dataclass(frozen=True)
class PauseDetectionConfig:
  top_db: float = 30.0
  frame_length: int = 2048
  hop_length: int = 512
  min_pause_sec: float = 0.25


def detect_pauses(
  y: np.ndarray,
  sr: int,
  config: PauseDetectionConfig = PauseDetectionConfig(),
) -> tuple[int, float]:
  """
  Detect pause segments using energy-based non-silent splitting.

  Returns:
    pauses_count: number of internal silence gaps >= min_pause_sec
    pause_duration_sec: total duration of counted pauses
  """
  if y.size == 0 or sr <= 0:
    return 0, 0.0

  non_silent_intervals = librosa.effects.split(
    y,
    top_db=config.top_db,
    frame_length=config.frame_length,
    hop_length=config.hop_length,
  )

  if non_silent_intervals.size == 0:
    return 0, 0.0

  duration_sec = float(len(y) / sr)
  if duration_sec <= config.min_pause_sec:
    return 0, 0.0

  min_pause_samples = int(config.min_pause_sec * sr)

  pauses_count = 0
  pause_duration_sec = 0.0

  # Count silence gaps between non-silent intervals; ignore leading/trailing silence.
  for i in range(len(non_silent_intervals) - 1):
    end_current = int(non_silent_intervals[i][1])
    start_next = int(non_silent_intervals[i + 1][0])
    gap = start_next - end_current

    if gap >= min_pause_samples:
      pauses_count += 1
      pause_duration_sec += float(gap / sr)

  # Safety clamp
  pause_duration_sec = float(max(0.0, min(duration_sec, pause_duration_sec)))
  return pauses_count, pause_duration_sec


@dataclass(frozen=True)
class SpeedConfig:
  # Default child reading speed range as requested: 120–150 wpm.
  min_wpm: int = 120
  max_wpm: int = 150

  def target_wpm(self) -> float:
    return float(self.min_wpm + self.max_wpm) / 2.0


def estimate_expected_reading_duration_seconds(words: int, config: SpeedConfig = SpeedConfig()) -> float:
  if words <= 0:
    return 0.0
  wpm = config.target_wpm()
  words_per_sec = wpm / 60.0
  return float(words) / max(1e-6, words_per_sec)


def risk_level_from_fluency_score(score_0_to_1: float) -> str:
  if score_0_to_1 <= 0.33:
    return "low"
  if score_0_to_1 <= 0.66:
    return "moderate"
  return "high"


def compute_fluency_risk_score(
  actual_duration_sec: float,
  expected_duration_sec: float,
  pauses_count: int,
  pause_duration_sec: float,
) -> float:
  """
  Temporary risk scoring (0..1) where:
  - slower-than-expected reading increases risk
  - more pauses / longer pauses increases risk
  """
  actual_duration_sec = max(0.0, float(actual_duration_sec))
  expected_duration_sec = max(0.0, float(expected_duration_sec))

  # Reading speed / time risk
  if expected_duration_sec <= 1e-6:
    time_risk = 0.0
  else:
    # Penalize being slower. If actual is faster, risk stays low.
    time_risk = max(0.0, (actual_duration_sec - expected_duration_sec) / expected_duration_sec)

  time_risk = clamp01(time_risk)  # 0..1 where >=100% slower saturates

  # Pause metrics
  duration_minutes = max(actual_duration_sec / 60.0, 1e-3)
  pause_rate_per_min = float(pauses_count) / duration_minutes

  # Empirical normalization (temporary):
  # - assume ~2 pauses/min is acceptable
  # - ~10 pauses/min is very risky
  freq_risk = (pause_rate_per_min - 2.0) / 8.0
  freq_risk = clamp01(freq_risk)

  # Longer silence ratio risk
  # - 0.25 of the recording being silence roughly saturates risk to 1
  silence_ratio = pause_duration_sec / max(actual_duration_sec, 1e-6)
  duration_risk = silence_ratio / 0.25
  duration_risk = clamp01(duration_risk)

  # Weighted combination as requested
  fluency_score = 0.6 * time_risk + 0.2 * freq_risk + 0.2 * duration_risk
  return clamp01(fluency_score)


def analyze_audio_rule_based(
  audio_path: str,
  expected_text: str | None = None,
) -> dict[str, Any]:
  """
  Temporary, rule-based dyslexia screening score from:
  - audio duration (reading duration)
  - expected duration based on word count
  - pause estimation from silence gaps
  """
  # Load audio
  y, sr = librosa.load(audio_path, sr=None, mono=True)
  actual_duration_sec = float(len(y) / max(1, sr))

  words_expected = count_words(expected_text or "")
  expected_duration_sec = estimate_expected_reading_duration_seconds(words_expected)

  # If expected text is missing/empty, neutralize the speed term by setting expected=actual.
  if words_expected <= 0 or expected_duration_sec <= 1e-6:
    expected_duration_sec = actual_duration_sec

  pauses_count, pause_duration_sec = detect_pauses(y=y, sr=sr)

  fluency_score = compute_fluency_risk_score(
    actual_duration_sec=actual_duration_sec,
    expected_duration_sec=expected_duration_sec,
    pauses_count=pauses_count,
    pause_duration_sec=pause_duration_sec,
  )

  risk_level = risk_level_from_fluency_score(fluency_score)

  return {
    "fluency_score": fluency_score,
    "risk_level": risk_level,
    "message": (
      "Preliminary screening result. "
      "This is a preliminary screening and not a medical diagnosis."
    ),
    # Extra fields for future ML integration/debugging.
    "metrics": {
      "words_expected": words_expected,
      "expected_duration_sec": expected_duration_sec,
      "reading_duration_sec": actual_duration_sec,
      "pauses_count": pauses_count,
      "pause_duration_sec": pause_duration_sec,
    },
  }

