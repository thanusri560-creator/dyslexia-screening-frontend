from __future__ import annotations

import logging
import os
import re
from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.ml.model import predict_dyslexia_from_audio_file


LOGGER = logging.getLogger("dyslexia-detection-api")
if not LOGGER.handlers:
    logging.basicConfig(level=logging.INFO)


def create_app() -> FastAPI:
    app = FastAPI(title="Dyslexia Detection API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    _word_re = re.compile(r"[A-Za-z]+(?:'[A-Za-z]+)?")

    def title_case_risk_level(risk_level: str | None) -> str:
        if not risk_level:
            return "Low"
        normalized = str(risk_level).strip().lower()
        if normalized == "low":
            return "Low"
        if normalized == "moderate":
            return "Moderate"
        if normalized == "high":
            return "High"
        # Fallback: best-effort title case.
        return str(risk_level).strip().title()

    async def analyze_upload(
        file: UploadFile,
        expected_text: str | None,
        debug: bool,
    ) -> dict:
        processing_steps: list[str] = []

        def step(name: str) -> None:
            processing_steps.append(name)
            LOGGER.info("%s", name)
            if debug:
                print(f"[DEBUG] {name}")

        if not file:
            raise HTTPException(status_code=400, detail="No file provided.")
        if not file.filename:
            raise HTTPException(status_code=400, detail="File name is missing.")

        suffix = Path(file.filename).suffix.lower()
        allowed_suffixes = {".wav", ".webm", ".ogg", ".mp3", ".flac"}
        if suffix not in allowed_suffixes:
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload a supported audio file (.wav/.webm/.ogg/.mp3/.flac).",
            )

        LOGGER.info("Received file: %s", file.filename)
        if debug:
            print(f"[DEBUG] filename={file.filename}")

        contents = await file.read()
        file_size_bytes = len(contents)
        LOGGER.info("File size: %d bytes", file_size_bytes)
        if debug:
            print(f"[DEBUG] size_bytes={file_size_bytes}")

        if file_size_bytes <= 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # Basic frontend integration aid: log expected text word count.
        if debug and expected_text:
            expected_words = len(_word_re.findall(expected_text))
            print(f"[DEBUG] expected_text_words={expected_words}")

        tmp_path: str | None = None
        try:
            step("validate_audio_tempfile")
            with NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(contents)
                tmp_path = tmp.name

            step("run_prediction_ml_or_rule_based")
            result = predict_dyslexia_from_audio_file(
                tmp_path,
                expected_text=expected_text,
            )

            source = result.get("source", "rule_based")
            risk_level_title = title_case_risk_level(result.get("risk_level"))
            details = result.get("details") or {"duration": 0.0, "pause_count": 0}

            if debug:
                print(f"[DEBUG] source={source}")
                print(f"[DEBUG] fluency_score={result.get('fluency_score')}")
                print(f"[DEBUG] details={details}")

            LOGGER.info("Prediction source: %s", source)
            return {
                "success": True,
                "source": source,
                "fluency_score": float(result.get("fluency_score", result.get("probability", 0.0))),
                "risk_level": risk_level_title,
                "details": {
                    "duration": float(details.get("duration", 0.0)),
                    "pause_count": int(details.get("pause_count", 0)),
                },
                "message": "Preliminary screening result",
                "disclaimer": "This is a preliminary screening and not a medical diagnosis.",
                "predicted_text": result.get("predicted_text", ""),
                "word_comparison": result.get("word_comparison", []),
                "comparison_score": float(result.get("comparison_score", 0.0)),
                # Backward-compatible fields (helps frontend integration).
                "prediction": result.get("prediction", "non_dyslexia"),
                "probability": float(result.get("probability", 0.0)),
            }
        except HTTPException:
            # Re-raise validation errors without wrapping.
            raise
        except Exception as e:
            LOGGER.exception("Analyze audio failed: %s", e)
            err_msg = str(e) if debug else "Failed to analyze audio."
            return {"success": False, "error": err_msg}
        finally:
            if tmp_path:
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass

    @app.post("/api/v1/analyze-audio")
    async def analyze_audio_api(
        file: UploadFile | None = File(None),
        words_audio: UploadFile | None = File(None),
        sentences_audio: UploadFile | None = File(None),
        paragraph_audio: UploadFile | None = File(None),
        expected_text: str | None = Form(None),
        expected_text_words: str | None = Form(None),
        expected_text_sentences: str | None = Form(None),
        expected_text_paragraph: str | None = Form(None),
        debug: bool = Form(False),
    ):
        try:
            any_agg_audio = any([words_audio, sentences_audio, paragraph_audio])
            if not any_agg_audio:
                # Legacy mode: analyze a single uploaded audio using `file`.
                if not file:
                    return {
                        "success": False,
                        "error": "No audio file provided. Provide `file` or one of `words_audio` / `sentences_audio` / `paragraph_audio`.",
                    }
                return await analyze_upload(file=file, expected_text=expected_text, debug=debug)

            # Aggregation mode: analyze each provided section and combine scores.
            sections = [
                ("words", words_audio, expected_text_words),
                ("sentences", sentences_audio, expected_text_sentences),
                ("paragraph", paragraph_audio, expected_text_paragraph),
            ]

            weights = {"words": 0.2, "sentences": 0.3, "paragraph": 0.5}
            section_scores: dict[str, float] = {}
            section_details: dict[str, dict[str, float | int]] = {}
            section_word_comparisons: dict[str, list[dict[str, object]]] = {}
            section_predicted_text: dict[str, str] = {}
            sources_used: set[str] = set()

            total_duration = 0.0
            total_pauses = 0

            processed_any = False

            for section_name, upload, section_expected_text in sections:
                if not upload:
                    continue

                processed_any = True
                if not upload.filename:
                    raise HTTPException(status_code=400, detail=f"Missing filename for {section_name}_audio.")

                suffix = Path(upload.filename).suffix.lower()
                allowed_suffixes = {".wav", ".webm", ".ogg", ".mp3", ".flac"}
                if suffix not in allowed_suffixes:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid file type for {section_name}_audio. Please upload a supported audio file.",
                    )

                # Read and validate size
                contents = await upload.read()
                file_size_bytes = len(contents)
                if debug:
                    print(f"[DEBUG] {section_name}_audio filename={upload.filename} size_bytes={file_size_bytes}")
                if file_size_bytes <= 0:
                    raise HTTPException(status_code=400, detail=f"Uploaded {section_name}_audio is empty.")

                tmp_path: str | None = None
                try:
                    with NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                        tmp.write(contents)
                        tmp_path = tmp.name

                    # Choose expected text fallback:
                    expected_for_rule = section_expected_text or expected_text
                    result = predict_dyslexia_from_audio_file(tmp_path, expected_text=expected_for_rule)

                    # Extract score/metrics
                    fluency_score = float(result.get("fluency_score", result.get("probability", 0.0)))
                    details = result.get("details") or {}
                    duration_sec = float(details.get("duration", 0.0))
                    pause_count = int(details.get("pause_count", 0))

                    section_scores[section_name] = fluency_score
                    section_details[section_name] = {"duration": duration_sec, "pause_count": pause_count}
                    section_word_comparisons[section_name] = list(result.get("word_comparison", []))
                    section_predicted_text[section_name] = str(result.get("predicted_text", ""))
                    sources_used.add(str(result.get("source", "rule_based")))

                    total_duration += duration_sec
                    total_pauses += pause_count

                    if debug:
                        print(f"[DEBUG] {section_name} score={fluency_score} duration={duration_sec} pauses={pause_count}")
                finally:
                    if tmp_path:
                        try:
                            os.remove(tmp_path)
                        except OSError:
                            pass

            if not processed_any:
                return {"success": False, "error": "No audio provided for aggregation."}

            # Weighted aggregation (normalize weights across available sections)
            available_sections = [s for s, _u, _e in sections if s in section_scores]
            sum_w = sum(weights[s] for s in available_sections) if available_sections else 0.0
            if sum_w <= 0:
                final_score = 0.0
            else:
                final_score = 0.0
                for s in available_sections:
                    w = weights[s] / sum_w
                    final_score += w * section_scores[s]

            # Map score -> risk level
            if final_score <= 0.33:
                risk_level = "Low"
            elif final_score <= 0.66:
                risk_level = "Moderate"
            else:
                risk_level = "High"

            # Decide source
            source = "ml_model" if sources_used and all(src == "ml_model" for src in sources_used) else "rule_based"

            breakdown = {
                "words": section_scores.get("words"),
                "sentences": section_scores.get("sentences"),
                "paragraph": section_scores.get("paragraph"),
            }

            # Prefer paragraph-level comparison for display, then sentences, then words.
            primary_section = (
                "paragraph" if "paragraph" in section_scores
                else "sentences" if "sentences" in section_scores
                else "words"
            )
            primary_word_comparison = section_word_comparisons.get(primary_section, [])
            primary_predicted_text = section_predicted_text.get(primary_section, "")
            primary_comparison_score = 0.0
            if primary_word_comparison:
                correct = sum(1 for x in primary_word_comparison if x.get("status") == "correct")
                primary_comparison_score = correct / max(1, len(primary_word_comparison))

            # Return new aggregated contract + keep some legacy fields.
            return {
                "success": True,
                "source": source,
                "final_score": float(final_score),
                "risk_level": risk_level,
                "breakdown": breakdown,
                "details": {
                    "total_duration": float(total_duration),
                    "total_pauses": int(total_pauses),
                    # legacy-compatible keys:
                    "duration": float(total_duration),
                    "pause_count": int(total_pauses),
                },
                "message": "Aggregated screening result",
                "disclaimer": "This is a preliminary screening and not a medical diagnosis.",
                "predicted_text": primary_predicted_text,
                "word_comparison": primary_word_comparison,
                "comparison_score": float(primary_comparison_score),
                # Backward-compatible numeric fields:
                "fluency_score": float(final_score),
                "prediction": "dyslexia" if final_score >= 0.5 else "non_dyslexia",
                "probability": float(final_score),
            }
        except HTTPException as e:
            return {"success": False, "error": e.detail}
        except Exception as e:
            LOGGER.exception("Aggregation analyze audio failed: %s", e)
            return {"success": False, "error": str(e) if debug else "Failed to analyze audio."}

    # Shorthand route for integration/testing (same response shape).
    @app.post("/analyze-audio")
    async def analyze_audio(
        file: UploadFile | None = File(None),
        words_audio: UploadFile | None = File(None),
        sentences_audio: UploadFile | None = File(None),
        paragraph_audio: UploadFile | None = File(None),
        expected_text: str | None = Form(None),
        expected_text_words: str | None = Form(None),
        expected_text_sentences: str | None = Form(None),
        expected_text_paragraph: str | None = Form(None),
        debug: bool = Form(False),
    ):
        return await analyze_audio_api(
            file=file,
            words_audio=words_audio,
            sentences_audio=sentences_audio,
            paragraph_audio=paragraph_audio,
            expected_text=expected_text,
            expected_text_words=expected_text_words,
            expected_text_sentences=expected_text_sentences,
            expected_text_paragraph=expected_text_paragraph,
            debug=debug,
        )

    return app


app = create_app()
