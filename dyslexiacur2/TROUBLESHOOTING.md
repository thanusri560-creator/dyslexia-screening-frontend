# Dyslexia Screening - Troubleshooting Guide

## Current Status (as of April 19, 2026)

### ✅ Working Components:
1. **Python ML Service** (Port 5000) - ✅ Running and healthy
   - Model loaded: Yes
   - Scaler loaded: Yes
   - Endpoint: http://localhost:5000/health

2. **ML Model Files** - ✅ Present
   - dyslexia_model.pkl: ✅ Exists
   - scaler.pkl: ✅ Exists

### 🔧 Fixed Issues:
1. ✅ API endpoint corrected from `http://localhost:8000/api/v1/analyze-audio` to `/api/predict`
2. ✅ Express server port changed from 3000 to 3001 to avoid conflict with Vite
3. ✅ Vite proxy configuration added to forward `/api` requests to Express on port 3001

## How to Run the Application Correctly

### Option 1: Using the Batch File (Recommended)
```batch
.\start-services.bat
```
This will start:
- Python ML Service on port 5000
- Node.js Server on port 3000

### Option 2: Manual Start (Two Terminals)

**Terminal 1 - Python ML Service:**
```bash
cd server
python audio_prediction.py
```

**Terminal 2 - Frontend Development:**
```bash
npm run dev
```

## Testing the Application

### Step 1: Verify Services are Running
1. Check Python ML Service:
   - Open browser: http://localhost:5000/health
   - Expected response:
   ```json
   {
     "model_loaded": true,
     "scaler_loaded": true,
     "status": "healthy"
   }
   ```

2. Check Frontend:
   - Open browser: http://localhost:3000
   - You should see the dyslexia screening application

### Step 2: Complete a Screening Test

1. **Login** as a student user
2. **Navigate** to the Screening page
3. **Step 1 - Age Selection**: Select an age group (6-8, 9-12, or 13-15)
4. **Step 2 - Difficulty**: Select a difficulty level (Easy, Moderate, or Hard)
5. **Step 3 - Test Selection**: Make sure "Reading Test" is selected
6. **Step 4 - Reading Test**:
   - **Words**: You'll see words displayed one at a time
     - Example: "sun", "cat", "hop", "nest", "milk"
     - Record audio for each word
     - Click "Next" to proceed
   - **Sentences**: You'll see sentences displayed one at a time
     - Example: "The cat is on the mat."
     - Record audio for each sentence
     - Click "Next" to proceed
   - **Paragraph**: You'll see a full paragraph
     - Example: "Mia has a red bag. She puts a book and a pen in it..."
     - Record audio reading the paragraph
     - Click "Finish test"

### Step 3: Audio Analysis
After completing the reading test, the audio should be automatically analyzed.

**If you see "Analyzing your reading..."**:
- Wait for the analysis to complete
- This sends your audio to the ML model

**If you see an error**:
- Check that Python ML Service is running (http://localhost:5000/health)
- Check browser console for error messages (F12)
- Try recording again in a quieter space

## Common Issues and Solutions

### Issue 1: "No text to read" during the test
**Cause**: You haven't completed the setup steps
**Solution**: 
1. Make sure you select an age group
2. Select a difficulty level
3. Select at least the "Reading Test"
4. The text will appear automatically

### Issue 2: "Still asking to record audio at the end"
**Cause**: The test flow hasn't completed properly
**Solution**:
1. Complete ALL reading steps:
   - All words (5 words)
   - All sentences (3 sentences)
   - The paragraph (1 paragraph)
2. Click "Finish test" after recording the paragraph
3. The analysis should start automatically

### Issue 3: "Failed to analyze audio" error
**Possible causes**:
1. Python ML Service is not running
2. Port conflict
3. Audio file format issue

**Solutions**:
1. Verify Python service: http://localhost:5000/health
2. Restart both services
3. Try recording again (make sure to allow microphone access)

### Issue 4: Services won't start
**Python service fails**:
```bash
cd server
pip install -r requirements.txt
python audio_prediction.py
```

**Node.js fails**:
```bash
npm install
npm run dev
```

## Architecture Overview

```
User Browser (Port 3000)
    ↓
Vite Dev Server (Port 3000)
    ↓ (proxies /api requests)
Express Server (Port 3001)
    ↓ (forwards audio)
Python Flask ML Service (Port 5000)
    ↓
ML Model (dyslexia_model.pkl)
```

### Data Flow:
1. User records audio in browser
2. Audio sent to `/api/predict` (Vite proxies to Express on 3001)
3. Express forwards to Python on port 5000
4. Python extracts features using librosa
5. ML model predicts: "Dyslexic" or "Non-Dyslexic"
6. Result returned to frontend

## Quick Diagnostic Commands

### Check if services are running:
```powershell
# Check Python ML Service (Port 5000)
netstat -ano | findstr ":5000"

# Check Node.js Server (Port 3000)
netstat -ano | findstr ":3000"

# Check Express Server (Port 3001)
netstat -ano | findstr ":3001"
```

### Test ML Service:
```powershell
cd server
python test_ml.py
```

### Test API Endpoint:
```powershell
curl http://localhost:5000/health
```

## Need More Help?

If you're still experiencing issues:
1. Check browser console (F12) for JavaScript errors
2. Check terminal output for server errors
3. Verify all services are running on correct ports
4. Try restarting all services

## Files Modified

1. `client/src/pages/Screening.tsx`
   - Changed API endpoint from `http://localhost:8000/api/v1/analyze-audio` to `/api/predict`

2. `server/index.ts`
   - Changed Express server port from 3000 to 3001

3. `vite.config.ts`
   - Added proxy configuration for `/api` requests to forward to Express on port 3001

4. `server/test_ml.py` (NEW)
   - Diagnostic script to test ML service
