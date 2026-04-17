from __future__ import annotations

from pathlib import Path


def transcribe_audio(audio_path: str | Path) -> str:
  """
  Transcribe audio using Whisper if available.

  This function is intentionally lightweight and fault-tolerant:
  - If Whisper is unavailable, it returns an empty transcript.
  - If transcription fails, it returns an empty transcript.
  """
  path = str(audio_path)

  try:
    import whisper  # type: ignore
  except Exception:
    # Whisper not installed; keep pipeline working.
    print("Whisper not available. Skipping transcription.")
    return ""

  try:
    model = whisper.load_model("base")
    result = model.transcribe(path)
    text = (result or {}).get("text", "")
    return str(text).strip()
  except Exception as e:
    print(f"Whisper transcription failed: {e}")
    return ""

