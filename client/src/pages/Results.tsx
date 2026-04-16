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
        const result = await screeningAPI.getResults('session_1');
        const historyData = await screeningAPI.getHistory(user.id);
        setLatestResult(result);
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

  const chartData = [
    { name: 'Reading', value: latestResult.details.readingTest },
    { name: 'Phonological', value: latestResult.details.phonologicalTasks },
    { name: 'Spelling', value: latestResult.details.spellingQuiz },
  ];

  const progressData = history.map((r, i) => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: r.score,
  }));

  const riskDistribution = [
    { name: 'Low Risk', value: history.filter(r => r.riskLevel === 'low').length },
    { name: 'Moderate Risk', value: history.filter(r => r.riskLevel === 'moderate').length },
    { name: 'High Risk', value: history.filter(r => r.riskLevel === 'high').length },
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
                  Assessment completed on {new Date(latestResult.date).toLocaleDateString()}
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
          <section className={`card-soft border-2 ${riskLevelBg[latestResult.riskLevel]}`}>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Overall Risk Level</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                    style={{ backgroundColor: riskLevelColor[latestResult.riskLevel] }}
                  >
                    {latestResult.riskLevel === 'low' ? '✓' : latestResult.riskLevel === 'moderate' ? '!' : '⚠'}
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground capitalize">{latestResult.riskLevel}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                <p className="text-4xl font-bold text-foreground">{latestResult.score}%</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">What This Means</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {latestResult.riskLevel === 'low'
                    ? 'Your screening indicates a low risk of dyslexia.'
                    : latestResult.riskLevel === 'moderate'
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
              {aiSummary[latestResult.riskLevel as keyof typeof aiSummary]}
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
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Reading Test</p>
                <p className="text-3xl font-bold text-foreground">{latestResult.details.readingTest}%</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Phonological Tasks</p>
                <p className="text-3xl font-bold text-foreground">{latestResult.details.phonologicalTasks}%</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Spelling Quiz</p>
                <p className="text-3xl font-bold text-foreground">{latestResult.details.spellingQuiz}%</p>
              </div>
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
