from __future__ import annotations

import argparse
import sys
from pathlib import Path

DEFAULT_AUDIO_EXTENSIONS = (".wav", ".wave")

# Ensure `app.*` imports work when this file is executed directly.
BACKEND_ROOT = Path(__file__).resolve().parents[2]  # backend-ai/
if str(BACKEND_ROOT) not in sys.path:
  sys.path.append(str(BACKEND_ROOT))

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import joblib

from app.ml.audio_processing import list_audio_files, extract_mfcc_features, features_to_fixed_vector, load_audio


def count_audio_files(
  category_dir: Path,
  extensions: tuple[str, ...] = DEFAULT_AUDIO_EXTENSIONS,
) -> int:
  """
  Count audio files in a category directory.

  Counts recursively; returns 0 if the directory doesn't exist.
  """
  if not category_dir.exists():
    return 0

  extensions_lower = {e.lower() for e in extensions}
  count = 0
  for path in category_dir.rglob("*"):
    if path.is_file() and path.suffix.lower() in extensions_lower:
      count += 1

  return count


def get_dataset_paths(dataset_root: Path) -> dict[str, Path]:
  return {
    "dyslexia": dataset_root / "dyslexia",
    "non_dyslexia": dataset_root / "non_dyslexia",
  }


def extract_feature_vector_for_file(audio_path: Path) -> np.ndarray:
  """
  Convert a single audio file into a fixed-length feature vector.
  """
  y, sr = load_audio(audio_path, sr=None, mono=True)
  mfcc = extract_mfcc_features(y=y, sample_rate=sr, n_mfcc=13)
  vec = features_to_fixed_vector(mfcc)
  return vec


def save_artifacts(
  model,
  scaler,
  models_dir: Path,
  model_filename: str = "dyslexia_model.pkl",
  scaler_filename: str = "scaler.pkl",
) -> None:
  models_dir.mkdir(parents=True, exist_ok=True)
  joblib.dump(model, models_dir / model_filename)
  joblib.dump(scaler, models_dir / scaler_filename)


def main(dataset_dir: Path) -> dict[str, int]:
  paths = get_dataset_paths(dataset_dir)

  dyslexia_count = count_audio_files(paths["dyslexia"])
  non_dyslexia_count = count_audio_files(paths["non_dyslexia"])

  total = dyslexia_count + non_dyslexia_count

  print(f"Dataset audio file counts:")
  print(f"- dyslexia: {dyslexia_count}")
  print(f"- non_dyslexia: {non_dyslexia_count}")
  print(f"- total: {total}")

  # Handle empty dataset safely: do not train when there's nothing to learn from.
  if total == 0:
    print(
      "No audio files found. Place .wav files under:\n"
      f"- {paths['dyslexia']}\n"
      f"- {paths['non_dyslexia']}\n"
      "Then re-run training."
    )
    return {"dyslexia": dyslexia_count, "non_dyslexia": non_dyslexia_count}

  if dyslexia_count == 0 or non_dyslexia_count == 0:
    print(
      "Warning: training dataset is imbalanced or missing one class.\n"
      "Training can still be implemented later, but you may want at least one file per class."
    )
    return {"dyslexia": dyslexia_count, "non_dyslexia": non_dyslexia_count}

  # Feature extraction + simple baseline model training.
  # Notes:
  # - This intentionally keeps the first iteration lightweight.
  # - Audio feature extraction uses MFCC mean vectors (length 13 by default).
  dyslexia_files = list_audio_files(paths["dyslexia"])
  non_dyslexia_files = list_audio_files(paths["non_dyslexia"])

  if not dyslexia_files or not non_dyslexia_files:
    print("No audio files discovered by feature extractor. Re-check dataset folder contents.")
    return {"dyslexia": dyslexia_count, "non_dyslexia": non_dyslexia_count}

  X: list[np.ndarray] = []
  y: list[int] = []

  for p in dyslexia_files:
    try:
      X.append(extract_feature_vector_for_file(p))
      y.append(1)
    except Exception as e:
      print(f"Failed extracting features for dyslexia file {p}: {e}")

  for p in non_dyslexia_files:
    try:
      X.append(extract_feature_vector_for_file(p))
      y.append(0)
    except Exception as e:
      print(f"Failed extracting features for non_dyslexia file {p}: {e}")

  if not X:
    print("No features could be extracted. Training skipped.")
    return {"dyslexia": dyslexia_count, "non_dyslexia": non_dyslexia_count}

  X_arr = np.stack(X, axis=0)
  y_arr = np.asarray(y, dtype=int)

  scaler = StandardScaler()
  X_scaled = scaler.fit_transform(X_arr)

  model = LogisticRegression(max_iter=1000)
  model.fit(X_scaled, y_arr)

  # Save artifacts for future API inference.
  # models dir lives next to this module.
  models_dir = Path(__file__).resolve().parent / "models"
  save_artifacts(model=model, scaler=scaler, models_dir=models_dir)

  print(f"Training complete. Saved model + scaler to: {models_dir}")

  return {"dyslexia": dyslexia_count, "non_dyslexia": non_dyslexia_count}


if __name__ == "__main__":
  parser = argparse.ArgumentParser(description="Train dyslexia audio detection model (placeholder).")
  parser.add_argument(
    "--dataset-dir",
    type=str,
    default=str(Path(__file__).resolve().parents[3] / "dataset"),
    help="Path to the dataset directory containing dyslexia/ and non_dyslexia/.",
  )
  args = parser.parse_args()

  main(dataset_dir=Path(args.dataset_dir))
