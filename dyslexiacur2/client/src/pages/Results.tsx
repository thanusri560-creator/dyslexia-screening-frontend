import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { screeningAPI } from '@/lib/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Share2, AlertCircle } from 'lucide-react';

export default function Results() {
  const { user } = useAuth();
  const [latestResult, setLatestResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No auth token found');
          setIsLoading(false);
          return;
        }

        // Fetch user's screening history from backend
        const response = await fetch('http://localhost:3001/api/screening/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load results');
        }

        const historyData = data.results || [];
        
        if (historyData.length > 0) {
          // Get the most recent result
          setLatestResult(historyData[0]);
        } else {
          setLatestResult(null);
        }
        
        setHistory(historyData);
      } catch (error) {
        console.error('Failed to load results:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadResults();
  }, [user]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading results...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!latestResult) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No results available</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const riskLevelColor: Record<string, string> = {
    low: '#10b981',
    moderate: '#f59e0b',
    high: '#ef4444',
  };

  const riskLevelBg: Record<string, string> = {
    low: 'bg-green-50 border-green-200',
    moderate: 'bg-yellow-50 border-yellow-200',
    high: 'bg-red-50 border-red-200',
  };

  // Map backend data structure to chart data
  const chartData = [];
  if (latestResult.testScores) {
    if (latestResult.testScores.reading) {
      chartData.push({ name: 'Reading', value: latestResult.testScores.reading });
    }
    if (latestResult.testScores.phonological) {
      chartData.push({ name: 'Phonological', value: latestResult.testScores.phonological });
    }
    if (latestResult.testScores.spelling) {
      chartData.push({ name: 'Spelling', value: latestResult.testScores.spelling });
    }
    if (latestResult.testScores.wordRecognition) {
      chartData.push({ name: 'Word Recognition', value: latestResult.testScores.wordRecognition });
    }
    if (latestResult.testScores.syllable) {
      chartData.push({ name: 'Syllable', value: latestResult.testScores.syllable });
    }
  }

  const progressData = history.map((r) => ({
    date: new Date(r.createdAt || r.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: r.overallScore || 0,
  }));

  const riskDistribution = [
    { name: 'Low Risk', value: history.filter(r => r.finalRiskLevel === 'low').length },
    { name: 'Moderate Risk', value: history.filter(r => r.finalRiskLevel === 'moderate').length },
    { name: 'High Risk', value: history.filter(r => r.finalRiskLevel === 'high').length },
  ];

  const aiSummary = {
    low: 'Your assessment results suggest typical reading development. Continue with regular reading practice and maintain strong literacy habits. No immediate intervention appears necessary at this time.',
    moderate: 'Your results indicate some characteristics associated with dyslexia. We recommend a comprehensive evaluation by a qualified dyslexia specialist or educational psychologist. Early intervention can significantly improve reading outcomes.',
    high: 'Your assessment shows multiple indicators of dyslexia. Professional evaluation is strongly recommended. With appropriate intervention and support, individuals with dyslexia can develop strong reading and writing skills.',
  };

  const handleDownloadPDF = () => {
    // Placeholder for PDF generation
    alert('PDF download feature will be available soon. This will generate a comprehensive report with your results.');
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-display font-bold text-foreground">Your Results</h1>
                <p className="text-muted-foreground mt-2">
                  Assessment completed on {new Date(latestResult.createdAt || latestResult.completedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </section>

          {/* Risk Level Summary */}
          <section className={`card-soft border-2 ${riskLevelBg[latestResult.finalRiskLevel]}`}>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Overall Risk Level</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                    style={{ backgroundColor: riskLevelColor[latestResult.finalRiskLevel] }}
                  >
                    {latestResult.finalRiskLevel === 'low' ? '✓' : latestResult.finalRiskLevel === 'moderate' ? '!' : '⚠'}
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground capitalize">{latestResult.finalRiskLevel}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                <p className="text-4xl font-bold text-foreground">{latestResult.overallScore}%</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">What This Means</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {latestResult.finalRiskLevel === 'low'
                    ? 'Your screening indicates a low risk of dyslexia.'
                    : latestResult.finalRiskLevel === 'moderate'
                    ? 'Your screening suggests moderate dyslexia characteristics. Consider professional evaluation.'
                    : 'Your screening indicates high dyslexia risk. Professional evaluation is recommended.'}
                </p>
              </div>
            </div>
          </section>

          {/* AI-Generated Summary */}
          <section className="card-soft bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-primary space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span>🧠</span> AI Assessment Summary
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {latestResult.recommendation || 'Continue regular practice and maintain strong literacy habits.'}
            </p>
          </section>

          {/* Detailed Breakdown */}
          <section className="card-soft space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Assessment Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5ddd4" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#A8D5BA" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid md:grid-cols-3 gap-4">
              {latestResult.testScores && (
                <>
                  {latestResult.testScores.reading && (
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Reading Test</p>
                      <p className="text-3xl font-bold text-foreground">{latestResult.testScores.reading}%</p>
                    </div>
                  )}
                  {latestResult.testScores.spelling && (
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Spelling Quiz</p>
                      <p className="text-3xl font-bold text-foreground">{latestResult.testScores.spelling}%</p>
                    </div>
                  )}
                  {latestResult.testScores.phonological && (
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Phonological Tasks</p>
                      <p className="text-3xl font-bold text-foreground">{latestResult.testScores.phonological}%</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Progress Over Time */}
          {history.length > 1 && (
            <section className="card-soft space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">Progress Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5ddd4" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#A8D5BA" strokeWidth={2} dot={{ fill: '#A8D5BA' }} />
                </LineChart>
              </ResponsiveContainer>
            </section>
          )}

          {/* Risk Distribution */}
          {history.length > 1 && (
            <section className="card-soft space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">Assessment History Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </section>
          )}

          {/* Recommendations */}
          <section className="card-soft space-y-4 border-l-4 border-accent">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Next Steps</h2>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Review personalized recommendations for your situation</li>
                  <li>• Consider professional evaluation with a dyslexia specialist</li>
                  <li>• Explore support resources and intervention strategies</li>
                  <li>• Schedule follow-up screening in 4-6 weeks to track progress</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <section className="flex gap-3">
            <Link href="/recommendations" className="flex-1">
              <Button className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                View Recommendations
              </Button>
            </Link>
            <Link href="/student-dashboard" className="flex-1">
              <Button variant="outline" className="w-full h-12">
                Back to Dashboard
              </Button>
            </Link>
          </section>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
