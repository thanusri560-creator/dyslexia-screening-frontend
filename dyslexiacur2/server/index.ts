import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
import cors from "cors";
import { connectToDatabase } from "./db.js";
import { User } from "./models/User.js";
import { ScreeningResult } from "./models/ScreeningResult.js";
import { authenticateToken, generateToken, AuthRequest } from "./auth.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Connect to MongoDB
  await connectToDatabase();

  // Middleware to parse JSON
  app.use(express.json());

  // Enable CORS for frontend
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  }));

  // ==================== AUTHENTICATION ROUTES ====================

  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, role, age, schoolName, grade } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        role: role || "student",
        age,
        schoolName,
        grade,
      });

      await user.save();

      // Generate JWT token
      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === 11000) {
        return res.status(400).json({ error: "Email already registered" });
      }
      res.status(500).json({ error: error.message || "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Generate JWT token
      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message || "Login failed" });
    }
  });

  // Get current user profile
  app.get("/api/auth/me", authenticateToken as any, async (req: AuthRequest, res) => {
    try {
      const user = await User.findById(req.user?.id).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true, user });
    } catch (error: any) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== SCREENING RESULTS ROUTES ====================

  // Save screening result
  app.post("/api/screening/results", authenticateToken as any, async (req: AuthRequest, res) => {
    try {
      const resultData = req.body;

      const screeningResult = new ScreeningResult({
        userId: req.user?.id,
        selectedTests: resultData.selectedTests || [],
        ageGroup: resultData.ageGroup,
        difficultyLevel: resultData.difficultyLevel,
        audioAnalysis: resultData.audioAnalysis || {
          riskLevel: "low",
          riskScore: 0,
          fluencyScore: 0,
        },
        testScores: resultData.testScores || {},
        overallScore: resultData.overallScore || 0,
        averageTestScore: resultData.averageTestScore || 0,
        totalTestsCompleted: resultData.totalTestsCompleted || 0,
        finalRiskLevel: resultData.finalRiskLevel || "low",
        recommendation: resultData.recommendation || "Continue regular practice",
        duration: resultData.duration || 0,
      });

      await screeningResult.save();

      res.status(201).json({
        success: true,
        result: screeningResult,
      });
    } catch (error: any) {
      console.error("Save result error:", error);
      res.status(500).json({ error: error.message || "Failed to save result" });
    }
  });

  // Get user's screening history
  app.get("/api/screening/history", authenticateToken as any, async (req: AuthRequest, res) => {
    try {
      const results = await ScreeningResult.getUserResults(req.user?.id, 20);
      res.json({ success: true, results });
    } catch (error: any) {
      console.error("Get history error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific result
  app.get("/api/screening/results/:id", authenticateToken as any, async (req: AuthRequest, res) => {
    try {
      const result = await ScreeningResult.findOne({
        _id: req.params.id,
        userId: req.user?.id,
      });

      if (!result) {
        return res.status(404).json({ error: "Result not found" });
      }

      res.json({ success: true, result });
    } catch (error: any) {
      console.error("Get result error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get statistics (for admin/teacher)
  app.get("/api/screening/statistics", authenticateToken as any, async (req: AuthRequest, res) => {
    try {
      // Only admins and teachers can view statistics
      if (req.user?.role !== "admin" && req.user?.role !== "teacher") {
        return res.status(403).json({ error: "Access denied" });
      }

      const stats = await ScreeningResult.getStatistics();
      res.json({ success: true, stats });
    } catch (error: any) {
      console.error("Get statistics error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== AUDIO PREDICTION ROUTE ====================

  // Audio prediction endpoint - handles multiple audio files
  app.post("/api/predict", upload.fields([
    { name: 'words_audio', maxCount: 1 },
    { name: 'sentences_audio', maxCount: 1 },
    { name: 'paragraph_audio', maxCount: 1 }
  ]), async (req, res) => {
    try {
      console.log('📥 Received prediction request');
      console.log('  Files:', req.files ? Object.keys(req.files).length : 0, 'files');
      console.log('  Body fields:', Object.keys(req.body).length, 'fields');
      
      const files = req.files as Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
      
      // Check if we have at least one audio file
      const hasFiles = files && (
        (Array.isArray(files) && files.length > 0) ||
        (!Array.isArray(files) && Object.keys(files).length > 0)
      );

      if (!hasFiles) {
        console.log('❌ No audio files provided');
        return res.status(400).json({ 
          success: false,
          error: "No audio files provided" 
        });
      }

      // Create form data to send to Python service
      const FormData = (await import("form-data")).default;
      const formData = new FormData();

      // Add audio files to form data
      if (!Array.isArray(files)) {
        // Add each audio file
        if (files.words_audio && files.words_audio[0]) {
          console.log('  ✓ Processing words_audio');
          const audioData = fs.readFileSync(files.words_audio[0].path);
          formData.append("words_audio", audioData, {
            filename: files.words_audio[0].originalname || "words.webm",
            contentType: files.words_audio[0].mimetype,
          });
        }
        if (files.sentences_audio && files.sentences_audio[0]) {
          console.log('  ✓ Processing sentences_audio');
          const audioData = fs.readFileSync(files.sentences_audio[0].path);
          formData.append("sentences_audio", audioData, {
            filename: files.sentences_audio[0].originalname || "sentences.webm",
            contentType: files.sentences_audio[0].mimetype,
          });
        }
        if (files.paragraph_audio && files.paragraph_audio[0]) {
          console.log('  ✓ Processing paragraph_audio');
          const audioData = fs.readFileSync(files.paragraph_audio[0].path);
          formData.append("paragraph_audio", audioData, {
            filename: files.paragraph_audio[0].originalname || "paragraph.webm",
            contentType: files.paragraph_audio[0].mimetype,
          });
        }
      }

      // Add text fields from request body
      if (req.body.expected_text_words) {
        formData.append("expected_text_words", req.body.expected_text_words);
      }
      if (req.body.expected_text_sentences) {
        formData.append("expected_text_sentences", req.body.expected_text_sentences);
      }
      if (req.body.expected_text_paragraph) {
        formData.append("expected_text_paragraph", req.body.expected_text_paragraph);
      }
      if (req.body.debug) {
        formData.append("debug", req.body.debug);
      }

      console.log('📤 Forwarding to Python ML service...');

      // Send to Python prediction service
      const response = await axios.post(
        "http://localhost:5000/predict",
        formData,
        {
          headers: formData.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      console.log('✓ Prediction successful:', response.data.success);

      // Clean up uploaded files
      if (!Array.isArray(files)) {
        const allFiles = [
          ...(files.words_audio || []),
          ...(files.sentences_audio || []),
          ...(files.paragraph_audio || [])
        ];
        allFiles.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      res.json(response.data);
    } catch (error: any) {
      console.error("❌ Prediction error:", error.message);
      if (error.response) {
        console.error("  Response status:", error.response.status);
        console.error("  Response data:", error.response.data);
      }
      if (error.stack) {
        console.error("  Stack:", error.stack);
      }
      
      // Clean up files if they exist
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (!Array.isArray(files)) {
          const allFiles = [
            ...(files.words_audio || []),
            ...(files.sentences_audio || []),
            ...(files.paragraph_audio || [])
          ];
          allFiles.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        }
      }

      res.status(500).json({ 
        success: false,
        error: error.response?.data?.error || error.message || "Failed to process audio" 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", async (_req, res) => {
    try {
      const response = await axios.get("http://localhost:5000/health");
      res.json(response.data);
    } catch {
      res.status(503).json({ status: "unhealthy" });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
