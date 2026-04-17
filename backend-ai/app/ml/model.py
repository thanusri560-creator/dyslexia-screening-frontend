from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np

from app.ml.audio_processing import (
  extract_mfcc_features,
  features_to_fixed_vector,
  load_audio,
)
from app.ml.rule_based_scoring import analyze_audio_rule_based, detect_pauses
from app.ml.speech_to_text import transcribe_audio
from app.ml.text_comparison import compare_word_sequences


MODELS_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODELS_DIR / "dyslexia_model.pkl"
SCALER_PATH = MODELS_DIR / "scaler.pkl"

_ml_loaded: bool = False
_ml_available: bool = False
_warned_missing: bool = False
_ml_model: Any = None
_ml_scaler: Any = None


def _attach_word_level_analysis(
  base_result: dict[str, Any],
  audio_path: Path,
  expected_text: str | None,
) -> dict[str, Any]:
  if not expected_text or not expected_text.strip():
    return base_result

  predicted_text = transcribe_audio(audio_path)
  comparison = compare_word_sequences(expected_text=expected_text, predicted_text=predicted_text)

  enriched = dict(base_result)
  enriched["predicted_text"] = comparison["predicted_text"]
  enriched["word_comparison"] = comparison["word_comparison"]
  enriched["comparison_score"] = float(comparison["comparison_score"])
  return enriched


def _risk_level_from_probability(probability: float) -> str:
  if probability < 0.34:
    return "low"
  if probability < 0.67:
    return "moderate"
  return "high"


def _rule_based_score(y: np.ndarray, sr: int) -> float:
  """
  Deprecated: rule-based logic is now implemented in `rule_based_scoring.py`.
  Kept only for backward compatibility in case any older call sites remain.
  """
  # Neutral placeholder (0..1). Prefer using `analyze_audio_rule_based()`.
  _ = (y, sr)
  return 0.0


def _compute_feature_vector(y: np.ndarray, sr: int) -> np.ndarray:
  mfcc = extract_mfcc_features(y=y, sample_rate=sr, n_mfcc=13)
  return features_to_fixed_vector(mfcc)


def _try_load_ml_artifacts() -> None:
  global _ml_loaded, _ml_available, _ml_model, _ml_scaler, _warned_missing
  if _ml_loaded:
    return

  _ml_loaded = True
  try:
    if not (MODEL_PATH.exists() and SCALER_PATH.exists()):
      if not _warned_missing:
        print("Model not found. Using rule-based system.")
        _warned_missing = True
      _ml_available = False
      return

    _ml_scaler = joblib.load(SCALER_PATH)
    _ml_model = joblib.load(MODEL_PATH)
    _ml_available = True
  except Exception as e:
    # If artifact loading fails for any reason, fallback gracefully.
    print(f"Failed to load ML artifacts: {e}. Using rule-based system.")
    _ml_available = False


def predict_dyslexia_from_audio_file(
  audio_path: str | Path,
  expected_text: str | None = None,
) -> dict[str, Any]:
  """
  Predict dyslexia risk from an audio file.

  Fallback logic:
  - If model artifacts exist and load successfully -> ML prediction
  - Otherwise -> rule-based scoring
  """
  _try_load_ml_artifacts()
  path = Path(audio_path)

  try:
    y, sr = load_audio(path, sr=None, mono=True)
  except Exception:
    # If audio cannot be loaded, still return a safe response.
    return _attach_word_level_analysis({
      "prediction": "non_dyslexia",
      "probability": 0.0,
      "risk_level": "low",
      "source": "rule_based",
      "fluency_score": 0.0,
      "details": {"duration": 0.0, "pause_count": 0},
      "message": (
        "Preliminary screening result. "
        "This is a preliminary screening and not a medical diagnosis."
      ),
    }, path, expected_text)

  # Compute details for both rule-based and ML paths.
  actual_duration_sec = float(len(y) / max(1, sr))
  pauses_count, _pause_duration_sec = detect_pauses(y=y, sr=sr)

  if not _ml_available or _ml_model is None or _ml_scaler is None:
    # Rule-based fallback (temporary, expected-text-aware).
    try:
      rule_based = analyze_audio_rule_based(str(path), expected_text=expected_text)
      fluency_score = float(rule_based["fluency_score"])
      prediction = "dyslexia" if fluency_score >= 0.5 else "non_dyslexia"
      return _attach_word_level_analysis({
        "prediction": prediction,
        "probability": fluency_score,
        "risk_level": rule_based["risk_level"],
        "source": "rule_based",
        "fluency_score": fluency_score,
        "details": {"duration": actual_duration_sec, "pause_count": pauses_count},
        "message": rule_based["message"],
      }, path, expected_text)
    except Exception:
      return _attach_word_level_analysis({
        "prediction": "non_dyslexia",
        "probability": 0.0,
        "risk_level": "low",
        "source": "rule_based",
        "fluency_score": 0.0,
        "details": {"duration": actual_duration_sec, "pause_count": pauses_count},
        "message": (
          "Preliminary screening result. "
          "This is a preliminary screening and not a medical diagnosis."
        ),
      }, path, expected_text)

  try:
    feature_vec = _compute_feature_vector(y=y, sr=sr)
    X = np.asarray(feature_vec, dtype=np.float32).reshape(1, -1)
    X_scaled = _ml_scaler.transform(X)

    proba = _ml_model.predict_proba(X_scaled)[0]
    # Assume binary classification with class label `1` for dyslexia.
    if hasattr(_ml_model, "classes_") and 1 in list(_ml_model.classes_):
      class_index = list(_ml_model.classes_).index(1)
    else:
      class_index = -1  # fallback to last column

    prob = float(proba[class_index])
    prob = max(0.0, min(1.0, prob))

    prediction = "dyslexia" if prob >= 0.5 else "non_dyslexia"
    return _attach_word_level_analysis({
      "prediction": prediction,
      "probability": prob,
      "risk_level": _risk_level_from_probability(prob),
      "source": "ml_model",
      "fluency_score": prob,
      "details": {"duration": actual_duration_sec, "pause_count": pauses_count},
      "message": (
        "Preliminary screening result. "
        "This is a preliminary screening and not a medical diagnosis."
      ),
    }, path, expected_text)
  except Exception as e:
    # ML inference failed; fallback to rule-based scoring.
    print(f"ML inference failed: {e}. Using rule-based scoring.")
    try:
      rule_based = analyze_audio_rule_based(str(path), expected_text=expected_text)
      fluency_score = float(rule_based["fluency_score"])
      prediction = "dyslexia" if fluency_score >= 0.5 else "non_dyslexia"
      return _attach_word_level_analysis({
        "prediction": prediction,
        "probability": fluency_score,
        "risk_level": rule_based["risk_level"],
        "source": "rule_based",
        "fluency_score": fluency_score,
        "details": {"duration": actual_duration_sec, "pause_count": pauses_count},
        "message": rule_based["message"],
      }, path, expected_text)
    except Exception:
      return _attach_word_level_analysis({
        "prediction": "non_dyslexia",
        "probability": 0.0,
        "risk_level": "low",
        "source": "rule_based",
        "fluency_score": 0.0,
        "details": {"duration": actual_duration_sec, "pause_count": pauses_count},
        "message": (
          "Preliminary screening result. "
          "This is a preliminary screening and not a medical diagnosis."
        ),
      }, path, expected_text)
