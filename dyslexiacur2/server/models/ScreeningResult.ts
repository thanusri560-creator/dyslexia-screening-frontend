import mongoose from 'mongoose';

export interface IScreeningResult {
  _id: string;
  userId: mongoose.Types.ObjectId;
  // Test selections
  selectedTests: string[];
  ageGroup?: string;
  difficultyLevel?: string;
  
  // Audio analysis results
  audioAnalysis: {
    prediction?: string;
    riskLevel: string;
    riskScore: number;
    fluencyScore: number;
    confidence?: number;
    dyslexicProbability?: number;
    duration?: number;
    pauseCount?: number;
    totalDuration?: number;
    totalPauses?: number;
  };
  
  // Individual test scores
  testScores: {
    reading?: number;
    spelling?: number;
    phonological?: number;
    wordRecognition?: number;
    syllable?: number;
  };
  
  // Overall assessment
  overallScore: number;
  averageTestScore: number;
  totalTestsCompleted: number;
  
  // Risk assessment
  finalRiskLevel: string;
  recommendation: string;
  
  // Metadata
  completedAt: Date;
  duration: number; // Total time in seconds
  
  createdAt: Date;
  updatedAt: Date;
}

const screeningResultSchema = new mongoose.Schema<IScreeningResult>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  selectedTests: [{
    type: String,
    required: true,
  }],
  ageGroup: {
    type: String,
  },
  difficultyLevel: {
    type: String,
    enum: ['easy', 'moderate', 'hard'],
  },
  audioAnalysis: {
    prediction: String,
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
    },
    fluencyScore: {
      type: Number,
      required: true,
    },
    confidence: Number,
    dyslexicProbability: Number,
    duration: Number,
    pauseCount: Number,
    totalDuration: Number,
    totalPauses: Number,
  },
  testScores: {
    reading: Number,
    spelling: Number,
    phonological: Number,
    wordRecognition: Number,
    syllable: Number,
  },
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  averageTestScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  totalTestsCompleted: {
    type: Number,
    required: true,
    min: 1,
  },
  finalRiskLevel: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    required: true,
  },
  recommendation: {
    type: String,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
screeningResultSchema.index({ userId: 1, createdAt: -1 });
screeningResultSchema.index({ finalRiskLevel: 1 });

// Static method to get user's results
screeningResultSchema.statics.getUserResults = async function(userId: string, limit = 10) {
  return await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email role');
};

// Static method to get statistics
screeningResultSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$finalRiskLevel',
        count: { $sum: 1 },
        avgScore: { $avg: '$overallScore' },
      }
    }
  ]);
  return stats;
};

export const ScreeningResult = mongoose.model<IScreeningResult>('ScreeningResult', screeningResultSchema);
