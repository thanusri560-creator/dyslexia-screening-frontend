# Quick Start Guide - Dyslexia Screening Application

## 🚀 Start the Application

### Option 1: One-Click Start (Recommended)
```powershell
.\start-services.bat
```

### Option 2: Manual Start
**Terminal 1 - Python ML Service:**
```powershell
cd server
python audio_prediction.py
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

## ✅ Verify Everything is Running

1. **ML Service**: http://localhost:5000/health
   - Should show: `{"model_loaded": true, "scaler_loaded": true, "status": "healthy"}`

2. **Frontend**: http://localhost:3000
   - Should show the dyslexia screening app

## 📋 Take the Screening Test

1. **Login** as a student
2. **Click** "Screening" or go to screening page
3. **Select Age Group**: 6-8, 9-12, or 13-15
4. **Select Difficulty**: Easy, Moderate, or Hard
5. **Select Tests**: Make sure "Reading Test" is checked
6. **Complete Reading Test**:
   - 📖 Read 5 words aloud (record each)
   - 📝 Read 3 sentences aloud (record each)
   - 📄 Read 1 paragraph aloud (record)
7. **Click** "Finish test"
8. **Wait** for analysis (5-10 seconds)
9. **View** your results!

## 🔧 Troubleshooting

### No text showing?
✅ Make sure you completed steps 3-5 above (age, difficulty, test selection)

### Still asking to record at the end?
✅ Make sure you clicked "Finish test" after recording the paragraph

### Analysis failed?
✅ Check ML service: http://localhost:5000/health
✅ Restart both services
✅ Try recording again

### Services won't start?
✅ Run: `pip install -r requirements.txt` (in server folder)
✅ Run: `npm install` (in root folder)

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Vite (Frontend) | 3000 | http://localhost:3000 |
| Express (API) | 3001 | http://localhost:3001 |
| Python (ML) | 5000 | http://localhost:5000 |

## 🧪 Quick Tests

**Test ML Service:**
```powershell
cd server
python test_ml.py
```

**Check Ports:**
```powershell
netstat -ano | findstr ":5000"  # ML Service
netstat -ano | findstr ":3000"  # Frontend
netstat -ano | findstr ":3001"  # API Server
```

## 📁 Important Files

- `client/src/pages/Screening.tsx` - Main screening page
- `client/src/data/screeningData.json` - Test content (words, sentences, paragraphs)
- `server/audio_prediction.py` - ML model service
- `dyslexia_model.pkl` - Trained ML model
- `scaler.pkl` - Feature scaler

## 🆘 Still Having Issues?

1. Check `TROUBLESHOOTING.md` for detailed help
2. Check `FIXES_SUMMARY.md` for what was fixed
3. Open browser console (F12) and check for errors
4. Check terminal output for error messages

---
**Last Updated**: April 19, 2026  
**Status**: All fixes applied ✅
