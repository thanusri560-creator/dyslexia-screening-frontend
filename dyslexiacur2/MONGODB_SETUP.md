# MongoDB Setup Guide

## Overview
The dyslexia screening application now uses MongoDB to store:
- ✅ User accounts and authentication
- ✅ Screening results for each user
- ✅ Complete assessment history

---

## Step 1: Install MongoDB

### **Option A: Install MongoDB Locally (Recommended for Development)**

**Windows:**
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install as Windows Service (recommended)
5. MongoDB will run on `mongodb://localhost:27017`

**Verify Installation:**
```bash
mongod --version
```

### **Option B: Use MongoDB Atlas (Cloud - Free)**

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (Free tier available)
4. Get your connection string
5. Update `.env` file with your Atlas URI

---

## Step 2: Configure Environment Variables

The `.env` file has been created with default settings:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/dyslexia-screening

# JWT Secret (Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=3001

# Python ML Service URL
ML_SERVICE_URL=http://localhost:5000
```

**For MongoDB Atlas**, update the URI:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dyslexia-screening?retryWrites=true&w=majority
```

---

## Step 3: Start MongoDB Service

### **Windows (if installed as service):**
MongoDB should start automatically. Verify it's running:
```bash
net start MongoDB
```

### **Manual Start:**
```bash
mongod
```

### **Check if MongoDB is Running:**
```bash
mongo --eval "db.runCommand({ ping: 1 })"
```

---

## Step 4: Install Dependencies

All dependencies are already installed:
- ✅ `mongoose` - MongoDB ODM
- ✅ `bcryptjs` - Password hashing
- ✅ `jsonwebtoken` - JWT authentication
- ✅ `dotenv` - Environment variables

If you need to reinstall:
```bash
npm install
```

---

## Step 5: Start the Application

The server will automatically connect to MongoDB on startup.

```bash
# Terminal 1: Start Python ML Service
cd server
python audio_prediction.py

# Terminal 2: Start Node.js Server
npm run dev
```

You should see:
```
✅ Connected to MongoDB successfully
Server running on http://localhost:3001/
```

---

## API Endpoints

### **Authentication**

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "age": 10,
  "schoolName": "ABC School",
  "grade": "5th"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "65f123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

### **Screening Results**

#### Save Result
```http
POST /api/screening/results
Authorization: Bearer <token>
Content-Type: application/json

{
  "selectedTests": ["reading", "spelling", "phonological"],
  "ageGroup": "8-10 years",
  "difficultyLevel": "moderate",
  "audioAnalysis": {
    "prediction": "Non-Dyslexic",
    "riskLevel": "low",
    "riskScore": 25.5,
    "fluencyScore": 74.5,
    "duration": 15.3,
    "pauseCount": 24
  },
  "testScores": {
    "reading": 0.65,
    "spelling": 0.80,
    "phonological": 0.70
  },
  "overallScore": 72,
  "averageTestScore": 75,
  "totalTestsCompleted": 3,
  "finalRiskLevel": "low",
  "recommendation": "Continue regular reading practice",
  "duration": 1200
}
```

#### Get User's History
```http
GET /api/screening/history
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "_id": "...",
      "userId": "...",
      "selectedTests": ["reading", "spelling"],
      "audioAnalysis": { ... },
      "testScores": { ... },
      "overallScore": 72,
      "finalRiskLevel": "low",
      "completedAt": "2026-04-20T15:30:00.000Z"
    }
  ]
}
```

#### Get Specific Result
```http
GET /api/screening/results/:id
Authorization: Bearer <token>
```

#### Get Statistics (Admin/Teacher Only)
```http
GET /api/screening/statistics
Authorization: Bearer <token>
```

---

## Database Structure

### **Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: "student" | "teacher" | "parent" | "admin",
  age: Number,
  schoolName: String,
  grade: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **ScreeningResults Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  selectedTests: [String],
  ageGroup: String,
  difficultyLevel: String,
  audioAnalysis: {
    prediction: String,
    riskLevel: String,
    riskScore: Number,
    fluencyScore: Number,
    confidence: Number,
    duration: Number,
    pauseCount: Number
  },
  testScores: {
    reading: Number,
    spelling: Number,
    phonological: Number,
    wordRecognition: Number,
    syllable: Number
  },
  overallScore: Number,
  averageTestScore: Number,
  totalTestsCompleted: Number,
  finalRiskLevel: String,
  recommendation: String,
  completedAt: Date,
  duration: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Features

✅ **Password Hashing**: bcrypt with salt rounds
✅ **JWT Authentication**: Token-based auth with 7-day expiry
✅ **Protected Routes**: Authentication required for sensitive endpoints
✅ **Role-Based Access**: Different permissions for student/teacher/admin
✅ **Data Isolation**: Users can only access their own results

---

## Testing the Integration

### **1. Test MongoDB Connection:**
```bash
# Start the server
npm run dev

# Look for: "✅ Connected to MongoDB successfully"
```

### **2. Test Registration:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### **3. Test Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response, then test saving a result.

---

## Troubleshooting

### **MongoDB Connection Error:**
```
❌ MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Make sure MongoDB is running: `net start MongoDB`
- Check if MongoDB is installed
- Verify the URI in `.env` file

### **Module Not Found Error:**
```
Error: Cannot find module 'mongoose'
```
**Solution:**
```bash
npm install
```

### **JWT Verification Failed:**
**Solution:**
- Make sure JWT_SECRET is set in `.env`
- Use the same secret for token generation and verification

---

## Next Steps

The backend is ready! Now you need to:

1. **Update Frontend** to use the new authentication API
2. **Store tokens** in localStorage/cookies
3. **Send results** to MongoDB after screening
4. **Display user-specific results** from database

---

**Date**: April 20, 2026  
**Status**: Backend MongoDB integration complete ✅  
**Frontend Integration**: Required (next phase)
