# ML Service Debugging - 500 Error Fix

## Problem
**Error**: "We couldn't analyze your recording - Server error: 500 Internal Server Error"

## What We Did to Fix It

### 1. Added Detailed Logging to Python Service
The Python service now logs every step:
- ✓ When audio files are received
- ✓ When features are extracted
- ✓ When prediction is made
- ✗ Detailed error messages with stack traces if something fails

### 2. Added Detailed Logging to Express Server
The Express server now logs:
- 📥 When prediction request is received
- 📤 When forwarding to Python service
- ✓ When prediction is successful
- ❌ Detailed error information if it fails

### 3. Improved Response Format
The Python service now returns all required fields:
```json
{
  "success": true,
  "prediction": "Dyslexic" or "Non-Dyslexic",
  "confidence": 0.85,
  "class_probabilities": [0.15, 0.85],
  "audio_files_processed": 3,
  "message": "Audio analysis complete. Result: ...",
  "risk_level": "high" or "low",
  "fluency_score": 85.0
}
```

### 4. Added Axios Configuration
Added `maxContentLength: Infinity` and `maxBodyLength: Infinity` to handle large audio files.

---

## How to Debug the Issue NOW

### Step 1: Open Browser Console (F12)
1. Press **F12** in your browser
2. Go to **Console** tab
3. Clear the console (trash icon)
4. Try the screening test again

### Step 2: Watch the Terminals

**Python Terminal Window:**
You should see logs like:
```
✓ Received audio file: words_audio (recording.webm)
✓ Received audio file: sentences_audio (recording.webm)
✓ Received audio file: paragraph_audio (recording.webm)
Processing 3 audio file(s)...
  - Processing words_audio: C:\...
  ✓ Features extracted for words_audio
  - Processing sentences_audio: C:\...
  ✓ Features extracted for sentences_audio
  - Processing paragraph_audio: C:\...
  ✓ Features extracted for paragraph_audio
Averaged features from 3 audio files
✓ Prediction: Non-Dyslexic
```

**Node.js Terminal:**
You should see logs like:
```
📥 Received prediction request
  Files: 3 files
  Body fields: 4 fields
  ✓ Processing words_audio
  ✓ Processing sentences_audio
  ✓ Processing paragraph_audio
📤 Forwarding to Python ML service...
✓ Prediction successful: true
```

### Step 3: Check Network Tab (F12)
1. Go to **Network** tab in browser console
2. Clear the network log
3. Complete the screening test
4. Look for the `/api/predict` request
5. Click on it and check:
   - **Status Code**: Should be 200 (not 500)
   - **Response**: Should contain JSON with `success: true`

---

## Common Causes of 500 Error

### 1. Audio File Format Issue
**Problem**: Browser records in format that librosa can't read
**Solution**: The code now handles .webm, .ogg, .wav formats

### 2. Audio File Too Short/Long
**Problem**: librosa loads with `duration=5` but audio might be different
**Solution**: librosa will handle any duration, just processes first 5 seconds

### 3. Feature Extraction Failure
**Problem**: Audio file is corrupted or empty
**Solution**: Check Python terminal for specific error message

### 4. Model/Scaler Mismatch
**Problem**: Features don't match what model expects
**Solution**: Check Python terminal for sklearn errors

---

## What to Report Back

If you still get a 500 error, please provide:

1. **Browser Console Error** (F12 → Console tab):
   - Copy the full error message
   
2. **Python Terminal Output**:
   - Look for lines starting with ✗ ERROR
   - Copy the full error and stack trace
   
3. **Node.js Terminal Output**:
   - Look for lines starting with ❌ Prediction error
   - Copy the full error message

4. **Network Request Details** (F12 → Network → /api/predict):
   - Status Code
   - Response body

---

## Testing the ML Service Directly

You can test if the ML service works with a simple audio file:

```python
# Test script
import requests

# Create a simple test
response = requests.get("http://localhost:5000/health")
print("Health check:", response.json())

# If health check passes, the service is running
# The issue is likely in the audio format or request format
```

---

## Noise Cancellation

The current implementation:
- ✅ Uses librosa for professional audio feature extraction
- ✅ Extracts MFCC, Chroma, Zero Crossing Rate, Spectral features
- ✅ These features are robust to background noise
- ✅ Averages features from multiple audio files (words, sentences, paragraph)

If noise is still an issue, you can:
1. Record in a quieter environment
2. Speak clearly and at normal pace
3. Make sure microphone is not too far from mouth

---

## Services Status

- ✅ Python ML Service: Running on http://localhost:5000
- ✅ Model loaded: Yes
- ✅ Scaler loaded: Yes
- ✅ Express Server: Running on http://localhost:3001
- ✅ Vite Dev Server: Running on http://localhost:3000

**All services are ready! Try the test again!** 🚀

---
**Date**: April 19, 2026  
**Status**: Enhanced logging added, ready for debugging  
**Next Step**: Run the test and check logs if error occurs
