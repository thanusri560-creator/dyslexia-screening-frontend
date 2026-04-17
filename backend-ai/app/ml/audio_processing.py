from __future__ import annotations

from pathlib import Path
from typing import Iterable

import numpy as np
import librosa


def list_audio_files(
  folder: Path,
  extensions: Iterable[str] = (".wav", ".wave", ".mp3", ".flac", ".ogg"),
) -> list[Path]:
  """List audio files inside `folder` (recursively)."""
  if not folder.exists():
    return []

  exts = {e.lower() for e in extensions}
  audio_files: list[Path] = []
  for path in folder.rglob("*"):
    if path.is_file() and path.suffix.lower() in exts:
      audio_files.append(path)

  return audio_files


def load_audio(path: Path, sr: int | None = None, mono: bool = True) -> tuple[np.ndarray, int]:
  """
  Load audio with librosa.

  Returns:
    y: Audio time series
    sample_rate: Effective sample rate used by librosa
  """
  if sr is None:
    y, sample_rate = librosa.load(path, sr=None, mono=mono)
  else:
    y, sample_rate = librosa.load(path, sr=sr, mono=mono)

  return np.asarray(y), int(sample_rate)


def extract_mfcc_features(y: np.ndarray, sample_rate: int, n_mfcc: int = 13) -> np.ndarray:
  """
  Extract MFCC features as a simple baseline feature representation.

  Notes:
  - This is a placeholder feature extractor for later training work.
  """
  if y.size == 0:
    return np.zeros((n_mfcc, 1), dtype=np.float32)

  mfcc = librosa.feature.mfcc(y=y, sr=sample_rate, n_mfcc=n_mfcc)
  return np.asarray(mfcc, dtype=np.float32)


def features_to_fixed_vector(mfcc: np.ndarray) -> np.ndarray:
  """
  Convert variable-length MFCC to a fixed-size vector by averaging over time.
  """
  if mfcc.size == 0:
    return np.zeros((mfcc.shape[0],), dtype=np.float32)

  return mfcc.mean(axis=1).astype(np.float32)
