from flask import Flask, request, jsonify
from flask_cors import CORS
import librosa
import numpy as np
import pickle
import joblib
import os
import tempfile

app = Flask(__name__)
CORS(app)

# Load the model and scaler
model_path = os.path.join(os.path.dirname(__file__), '..', 'dyslexia_model.pkl')
scaler_path = os.path.join(os.path.dirname(__file__), '..', 'scaler.pkl')

print(f"Loading model from: {os.path.abspath(model_path)}")
print(f"Loading scaler from: {os.path.abspath(scaler_path)}")

try:
    # Try joblib first (common for scikit-learn), then fall back to pickle
    try:
        model = joblib.load(model_path)
        print("✓ Model loaded successfully (joblib)")
    except:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        print("✓ Model loaded successfully (pickle)")
except Exception as e:
    print(f"✗ Error loading model: {e}")
    model = None

try:
    # Try joblib first, then fall back to pickle
    try:
        scaler = joblib.load(scaler_path)
        print("✓ Scaler loaded successfully (joblib)")
    except:
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
        print("✓ Scaler loaded successfully (pickle)")
except Exception as e:
    print(f"✗ Error loading scaler: {e}")
    scaler = None

def extract_features(file_path):
    """Extract audio features using librosa"""
    try:
        y, sr = librosa.load(file_path, duration=5)
        
        # Calculate duration
        duration = len(y) / sr
        
        # Detect pauses (silence threshold)
        silence_threshold = 0.05
        frame_length = 2048
        hop_length = 512
        rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
        silence_frames = rms < silence_threshold
        pause_count = 0
        in_pause = False
        
        for is_silent in silence_frames:
            if is_silent and not in_pause:
                pause_count += 1
                in_pause = True
            elif not is_silent:
                in_pause = False
        
        # Extract features
        mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13).T, axis=0)
        chroma = np.mean(librosa.feature.chroma_stft(y=y, sr=sr).T, axis=0)
        zcr = np.mean(librosa.feature.zero_crossing_rate(y).T, axis=0)
        spec_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr).T, axis=0)
        spec_rolloff = np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr).T, axis=0)
        
        # Combine all features
        features = np.hstack([mfcc, chroma, zcr, spec_centroid, spec_rolloff])
        return features, duration, pause_count
    except Exception as e:
        raise Exception(f"Error extracting features: {str(e)}")

@app.route('/predict', methods=['POST'])
def predict():
    """Predict dyslexia from uploaded audio file(s)"""
    try:
        if model is None or scaler is None:
            return jsonify({
                'error': 'ML model or scaler not loaded properly. Please check server logs.',
                'success': False
            }), 500
        
        # Check for audio files - can be single 'audio' or multiple fields
        audio_files = []
        
        # Try multiple audio fields first
        for field_name in ['words_audio', 'sentences_audio', 'paragraph_audio']:
            if field_name in request.files:
                file = request.files[field_name]
                if file and file.filename != '':
                    audio_files.append((field_name, file))
                    print(f"✓ Received audio file: {field_name} ({file.filename})")
        
        # Fall back to single 'audio' field if no multiple files found
        if not audio_files and 'audio' in request.files:
            file = request.files['audio']
            if file and file.filename != '':
                audio_files.append(('audio', file))
                print(f"✓ Received audio file: audio ({file.filename})")
        
        if not audio_files:
            print("✗ No audio files provided")
            return jsonify({
                'error': 'No audio file provided',
                'success': False
            }), 400
        
        print(f"Processing {len(audio_files)} audio file(s)...")
        
        # Process all audio files and combine features
        all_features = []
        total_duration = 0.0
        total_pauses = 0
        
        for field_name, audio_file in audio_files:
            # Save the uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_file:
                audio_file.save(tmp_file.name)
                tmp_path = tmp_file.name
            
            print(f"  - Processing {field_name}: {tmp_path}")
            
            try:
                # Extract features
                features, duration, pause_count = extract_features(tmp_path)
                all_features.append(features)
                total_duration += duration
                total_pauses += pause_count
                print(f"  ✓ Features extracted for {field_name} (duration: {duration:.2f}s, pauses: {pause_count})")
            except Exception as e:
                print(f"  ✗ Error processing {field_name}: {str(e)}")
                raise
            finally:
                # Clean up temporary file
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
        
        # Combine features from all audio files
        if len(all_features) == 1:
            features = all_features[0]
            print("Using single audio file features")
        else:
            # Average features from multiple audio files
            features = np.mean(all_features, axis=0)
            print(f"Averaged features from {len(all_features)} audio files")
        
        # Reshape features for scaler and model (1 sample)
        features = features.reshape(1, -1)
        
        # Apply scaler
        scaled_features = scaler.transform(features)
        
        # Make prediction
        prediction = model.predict(scaled_features)
        prediction_proba = model.predict_proba(scaled_features) if hasattr(model, 'predict_proba') else None
        
        # Interpret result
        result = "Dyslexic" if prediction[0] == 1 else "Non-Dyslexic"
        
        print(f"✓ Prediction: {result}")
        
        # Calculate dyslexia risk level based on multiple factors
        # Factor 1: ML prediction confidence
        ml_confidence = float(max(prediction_proba[0])) if prediction_proba is not None else 0.5
        ml_dyslexic_prob = float(prediction_proba[0][1]) if prediction_proba is not None else 0.5
        
        # Factor 2: Pause analysis (more pauses = higher risk)
        avg_pauses_per_file = total_pauses / len(audio_files) if len(audio_files) > 0 else 0
        pause_risk = min(1.0, avg_pauses_per_file / 10.0)  # Normalize: 10+ pauses = high risk
        
        # Factor 3: Duration analysis (very short or very long = potential issues)
        avg_duration = total_duration / len(audio_files) if len(audio_files) > 0 else 0
        # Expected: 3-5 seconds per file. Too fast (<2s) or too slow (>6s) indicates issues
        if avg_duration < 2.0:
            duration_risk = 0.7  # Too fast, possible avoidance
        elif avg_duration > 6.0:
            duration_risk = 0.6  # Too slow, reading difficulty
        else:
            duration_risk = 0.3  # Normal range
        
        # Combined risk score (weighted average)
        combined_risk_score = (
            ml_dyslexic_prob * 0.5 +  # 50% weight to ML prediction
            pause_risk * 0.3 +         # 30% weight to pause patterns
            duration_risk * 0.2        # 20% weight to duration
        )
        
        # Determine risk level
        if combined_risk_score >= 0.6:
            risk_level = 'high'
            risk_message = f'High risk of dyslexia detected. Professional evaluation is strongly recommended.'
        elif combined_risk_score >= 0.35:
            risk_level = 'moderate'
            risk_message = f'Moderate risk indicators found. Consider further assessment and monitoring.'
        else:
            risk_level = 'low'
            risk_message = f'Low risk of dyslexia. Reading patterns appear typical.'
        
        print(f"✓ Risk Level: {risk_level} (score: {combined_risk_score:.2f})")
        print(f"  - ML dyslexic probability: {ml_dyslexic_prob:.2f}")
        print(f"  - Pause risk: {pause_risk:.2f} (avg {avg_pauses_per_file:.1f} pauses/file)")
        print(f"  - Duration risk: {duration_risk:.2f} (avg {avg_duration:.1f}s/file)")
        
        response_data = {
            'success': True,
            'prediction': result,
            'risk_level': risk_level,
            'risk_score': round(combined_risk_score * 100, 1),
            'confidence': ml_confidence,
            'class_probabilities': prediction_proba[0].tolist() if prediction_proba is not None else None,
            'audio_files_processed': len(audio_files),
            'message': risk_message,
            'analysis_details': {
                'ml_prediction': result,
                'ml_confidence': round(ml_confidence * 100, 1),
                'dyslexic_probability': round(ml_dyslexic_prob * 100, 1),
                'pause_analysis': {
                    'total_pauses': total_pauses,
                    'avg_pauses_per_file': round(avg_pauses_per_file, 1),
                    'pause_risk_score': round(pause_risk * 100, 1)
                },
                'duration_analysis': {
                    'total_duration': round(total_duration, 2),
                    'avg_duration_per_file': round(avg_duration, 2),
                    'duration_risk_score': round(duration_risk * 100, 1)
                },
                'combined_risk_score': round(combined_risk_score * 100, 1)
            },
            'details': {
                'duration': round(total_duration, 2),
                'pause_count': total_pauses,
                'total_duration': round(total_duration, 2),
                'total_pauses': total_pauses
            },
            'fluency_score': round((1.0 - combined_risk_score) * 100, 1),
            'recommendation': 'Seek professional evaluation' if risk_level == 'high' else ('Monitor and consider assessment' if risk_level == 'moderate' else 'Continue regular reading practice')
        }
        
        return jsonify(response_data), 200
                
    except Exception as e:
        print(f"✗ ERROR in predict: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'success': False,
            'details': traceback.format_exc()
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model_loaded': model is not None, 'scaler_loaded': scaler is not None})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
