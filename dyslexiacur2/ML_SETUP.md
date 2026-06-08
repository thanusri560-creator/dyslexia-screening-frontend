# Dyslexia Detection ML Model Integration

This guide explains how to set up and run the dyslexia detection ML model integration.

## Overview

The integration consists of:
1. **Python ML Service** - Handles audio feature extraction and prediction
2. **Node.js/Express Server** - Proxies requests from frontend to Python service
3. **React Frontend** - Records audio and displays prediction results

## Setup Instructions

### 1. Install Python Dependencies

Navigate to the `server` directory and install Python dependencies:

```bash
cd server
pip install -r requirements.txt
```

**Required packages:**
- flask - Web framework
- flask-cors - CORS support
- librosa - Audio feature extraction
- numpy - Numerical operations
- scikit-learn - ML model and scaler

### 2. Install Node.js Dependencies

The required packages (multer, form-data) have been added to package.json. Install them:

```bash
npm install --legacy-peer-deps
# or
pnpm install
```

### 3. Verify Model Files

Ensure the following files exist in the project root:
- `dyslexia_model.pkl` - Trained ML model
- `scaler.pkl` - Feature scaler

### 4. Start the Services

You need to run both services:

**Terminal 1 - Python ML Service:**
```bash
cd server
python audio_prediction.py
```
This starts the Python service on `http://localhost:5000`

**Terminal 2 - Node.js Server:**
```bash
npm run dev
```
This starts the development server on `http://localhost:3000`

## How It Works

### Audio Flow:
1. User records audio using the AudioRecorder component
2. Audio is sent to `/api/predict` endpoint on Node.js server
3. Node.js proxies the audio to Python service at `http://localhost:5000/predict`
4. Python service:
   - Extracts audio features using librosa:
     - MFCC (13 coefficients)
     - Chroma features
     - Zero Crossing Rate
     - Spectral Centroid
     - Spectral Rolloff
   - Applies scaler to normalize features
   - Runs prediction using the trained model
   - Returns prediction result with confidence scores
5. Frontend displays the result (Dyslexic or Non-Dyslexic)

### Feature Extraction:
```python
def extract_features(file_path):
    y, sr = librosa.load(file_path, duration=5)
    
    mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13).T, axis=0)
    chroma = np.mean(librosa.feature.chroma_stft(y=y, sr=sr).T, axis=0)
    zcr = np.mean(librosa.feature.zero_crossing_rate(y).T, axis=0)
    spec_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr).T, axis=0)
    spec_rolloff = np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr).T, axis=0)
    
    return np.hstack([mfcc, chroma, zcr, spec_centroid, spec_rolloff])
```

## API Endpoints

### Python Service (Port 5000)

**POST /predict**
- Accepts audio file upload
- Returns prediction result with confidence

**GET /health**
- Health check endpoint
- Returns model and scaler status

### Node.js Server (Port 3000)

**POST /api/predict**
- Proxies to Python service
- Handles file upload and cleanup

**GET /api/health**
- Proxies to Python health check

## Frontend Components

- `AudioTestWithPrediction.tsx` - Main component integrating recorder and prediction
- `AudioPredictionResult.tsx` - Displays prediction results with confidence scores
- `AudioRecorder.tsx` - Existing audio recording component

## Testing

1. Start both services (Python and Node.js)
2. Navigate to the screening page
3. Complete the screening tests
4. Record audio when prompted
5. Click "Analyze Audio"
6. View the prediction result

## Troubleshooting

### Python service won't start
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check if model files exist in the correct location
- Verify port 5000 is not in use

### Prediction fails
- Check if Python service is running on port 5000
- Verify the audio file format (should be webm, wav, or ogg)
- Check console logs for error messages
- Ensure model and scaler files are compatible

### Model files not found
- Ensure `dyslexia_model.pkl` and `scaler.pkl` are in the project root
- Check file permissions

## Notes

- The model expects audio files of approximately 5 seconds duration
- Features are extracted and normalized before prediction
- The prediction returns both the class (Dyslexic/Non-Dyslexic) and confidence scores
- This is a screening tool, not a diagnostic tool
