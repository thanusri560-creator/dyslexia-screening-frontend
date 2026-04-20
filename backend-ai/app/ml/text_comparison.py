from __future__ import annotations

import re
from typing import Any


_TOKEN_RE = re.compile(r"[A-Za-z]+(?:'[A-Za-z]+)?")


def tokenize_words(text: str) -> list[str]:
  if not text:
    return []
  return _TOKEN_RE.findall(text)


def _norm(word: str) -> str:
  return word.strip().lower()


def compare_word_sequences(expected_text: str, predicted_text: str) -> dict[str, Any]:
  """
  Simple sequence-based comparison between expected and predicted words.

  Output items are anchored on expected words with status:
  - correct
  - wrong
  - missing
  """
  expected = tokenize_words(expected_text)
  predicted = tokenize_words(predicted_text)

  items: list[dict[str, Any]] = []
  i = 0
  j = 0

  while i < len(expected):
    expected_word = expected[i]
    expected_norm = _norm(expected_word)

    if j >= len(predicted):
      items.append(
        {
          "word": expected_word,
          "status": "missing",
          "expected": expected_word,
          "predicted": None,
        }
      )
      i += 1
      continue

    predicted_word = predicted[j]
    predicted_norm = _norm(predicted_word)

    if expected_norm == predicted_norm:
      items.append(
        {
          "word": expected_word,
          "status": "correct",
          "expected": expected_word,
          "predicted": predicted_word,
        }
      )
      i += 1
      j += 1
      continue

    # If next expected matches current predicted, current expected is likely missing.
    if i + 1 < len(expected) and _norm(expected[i + 1]) == predicted_norm:
      items.append(
        {
          "word": expected_word,
          "status": "missing",
          "expected": expected_word,
          "predicted": None,
        }
      )
      i += 1
      continue

    # If current expected matches next predicted, current predicted is likely wrong/substituted.
    if j + 1 < len(predicted) and expected_norm == _norm(predicted[j + 1]):
      items.append(
        {
          "word": expected_word,
          "status": "wrong",
          "expected": expected_word,
          "predicted": predicted_word,
        }
      )
      i += 1
      j += 1
      continue

    # Default mismatch.
    items.append(
      {
        "word": expected_word,
        "status": "wrong",
        "expected": expected_word,
        "predicted": predicted_word,
      }
    )
    i += 1
    j += 1

  correct_count = sum(1 for x in items if x["status"] == "correct")
  total = max(len(items), 1)
  comparison_score = correct_count / total

  return {
    "predicted_text": " ".join(predicted),
    "word_comparison": items,
    "comparison_score": comparison_score,
  }

