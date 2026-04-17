/**
 * API Service - Placeholder for Backend Integration
 * 
 * This file contains placeholder functions for API calls that will be integrated
 * with the backend. All functions are currently mocked with sample data.
 * 
 * When backend is ready, replace these with actual API calls using fetch or axios.
 */

export interface ScreeningResult {
  id: string;
  studentId: string;
  date: string;
  riskLevel: 'low' | 'moderate' | 'high';
  score: number;
  details: {
    readingTest: number;
    phonologicalTasks: number;
    spellingQuiz: number;
  };
}

export interface StudentProgress {
  studentId: string;
  screeningResults: ScreeningResult[];
  improvementTrend: number; // percentage
}

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  resources: string[];
}

// Screening API
export const screeningAPI = {
  // Start a new screening session
  startScreening: async (studentId: string) => {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/screening/start', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ studentId }),
    // });
    return {
      sessionId: 'session_' + Math.random().toString(36).substr(2, 9),
      studentId,
      startedAt: new Date().toISOString(),
    };
  },

  // Submit screening answers
  submitAnswers: async (sessionId: string, answers: Record<string, any>) => {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/screening/submit', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ sessionId, answers }),
    // });
    return {
      sessionId,
      submitted: true,
      processingStatus: 'pending',
    };
  },

  // Get screening results
  getResults: async (sessionId: string): Promise<ScreeningResult> => {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/screening/results/${sessionId}`);
    return {
      id: sessionId,
      studentId: 'student_1',
      date: new Date().toISOString(),
      riskLevel: 'moderate',
      score: 65,
      details: {
        readingTest: 70,
        phonologicalTasks: 60,
        spellingQuiz: 65,
      },
    };
  },

  // Get student's screening history
  getHistory: async (studentId: string): Promise<ScreeningResult[]> => {
    // TODO: Replace with actual API call
    return [
      {
        id: 'result_1',
        studentId,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        riskLevel: 'high',
        score: 45,
        details: {
          readingTest: 40,
          phonologicalTasks: 45,
          spellingQuiz: 50,
        },
      },
      {
        id: 'result_2',
        studentId,
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        riskLevel: 'moderate',
        score: 60,
        details: {
          readingTest: 65,
          phonologicalTasks: 55,
          spellingQuiz: 60,
        },
      },
      {
        id: 'result_3',
        studentId,
        date: new Date().toISOString(),
        riskLevel: 'moderate',
        score: 65,
        details: {
          readingTest: 70,
          phonologicalTasks: 60,
          spellingQuiz: 65,
        },
      },
    ];
  },
};

// Recommendations API
export const recommendationsAPI = {
  // Get personalized recommendations
  getRecommendations: async (studentId: string): Promise<Recommendation[]> => {
    // TODO: Replace with actual API call
    return [
      {
        id: 'rec_1',
        category: 'Reading',
        title: 'Dyslexia-Friendly Reading Materials',
        description: 'Use books with dyslexia-friendly fonts and increased spacing.',
        resources: ['https://example.com/dyslexia-fonts', 'https://example.com/reading-guide'],
      },
      {
        id: 'rec_2',
        category: 'Phonological',
        title: 'Phonological Awareness Exercises',
        description: 'Practice sound recognition and phoneme manipulation exercises.',
        resources: ['https://example.com/phonological-exercises'],
      },
      {
        id: 'rec_3',
        category: 'Spelling',
        title: 'Multi-Sensory Spelling Techniques',
        description: 'Use multi-sensory approaches like tracing letters while saying sounds.',
        resources: ['https://example.com/spelling-techniques'],
      },
      {
        id: 'rec_4',
        category: 'Support',
        title: 'Professional Support Resources',
        description: 'Connect with dyslexia specialists and educational therapists.',
        resources: ['https://example.com/specialists'],
      },
    ];
  },
};

// Progress API
export const progressAPI = {
  // Get student progress over time
  getProgress: async (studentId: string): Promise<StudentProgress> => {
    // TODO: Replace with actual API call
    const results = await screeningAPI.getHistory(studentId);
    return {
      studentId,
      screeningResults: results,
      improvementTrend: 15, // 15% improvement
    };
  },
};

// Teacher API
export const teacherAPI = {
  // Get list of students (for teacher dashboard)
  getStudents: async (teacherId: string) => {
    // TODO: Replace with actual API call
    return [
      {
        id: 'student_1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        lastScreening: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        riskLevel: 'moderate',
      },
      {
        id: 'student_2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        lastScreening: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        riskLevel: 'low',
      },
      {
        id: 'student_3',
        name: 'Carol White',
        email: 'carol@example.com',
        lastScreening: new Date().toISOString(),
        riskLevel: 'high',
      },
    ];
  },

  // Get student details for teacher
  getStudentDetails: async (studentId: string) => {
    // TODO: Replace with actual API call
    return {
      id: studentId,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      grade: '3rd Grade',
      screeningResults: await screeningAPI.getHistory(studentId),
      recommendations: await recommendationsAPI.getRecommendations(studentId),
    };
  },
};

// Parent API
export const parentAPI = {
  // Get child's screening results
  getChildResults: async (childId: string) => {
    // TODO: Replace with actual API call
    return {
      childId,
      name: 'Alice Johnson',
      latestResult: await screeningAPI.getResults('session_1'),
      history: await screeningAPI.getHistory(childId),
      recommendations: await recommendationsAPI.getRecommendations(childId),
    };
  },
};

// Admin API
export const adminAPI = {
  // Get all users (mock)
  getUsers: async () => {
    // TODO: Replace with actual API call
    return [
      {
        id: 'user_1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'user_2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'parent',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'user_3',
        name: 'Mr. Wilson',
        email: 'wilson@example.com',
        role: 'teacher',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },

  // Delete user (mock)
  deleteUser: async (userId: string) => {
    // TODO: Replace with actual API call
    return { success: true, userId };
  },
};
