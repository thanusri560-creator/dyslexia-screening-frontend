# Test script to verify ML model is working
import requests

print("Testing Python ML Service...")
print("=" * 50)

# Test 1: Health check
try:
    response = requests.get("http://localhost:5000/health")
    print(f"\n✓ Health Check: {response.status_code}")
    print(f"  Response: {response.json()}")
except Exception as e:
    print(f"\n✗ Health Check Failed: {e}")

# Test 2: Check if model files exist
import os
model_path = os.path.join(os.path.dirname(__file__), '..', 'dyslexia_model.pkl')
scaler_path = os.path.join(os.path.dirname(__file__), '..', 'scaler.pkl')

print(f"\n✓ Model file exists: {os.path.exists(model_path)}")
print(f"✓ Scaler file exists: {os.path.exists(scaler_path)}")

print("\n" + "=" * 50)
print("ML Service test complete!")
