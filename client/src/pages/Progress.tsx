import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { progressAPI, screeningAPI } from '@/lib/api';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Award } from 'lucide-react';

export default function Progress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      try {
        const progressData = await progressAPI.getProgress(user.id);
        const historyData = await screeningAPI.getHistory(user.id);
        setProgress(progressData);
        setHistory(historyData);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProgress();
  }, [user]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading progress data...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const chartData = history.map((r) => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: r.score,
    reading: r.details.readingTest,
    phonological: r.details.phonologicalTasks,
    spelling: r.details.spellingQuiz,
  }));

  const averageScore = history.length > 0 ? Math.round(history.reduce((sum, r) => sum + r.score, 0) / history.length) : 0;
  const latestScore = history.length > 0 ? history[history.length - 1].score : 0;
  const improvement = history.length > 1 ? latestScore - history[0].score : 0;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <section className="space-y-4">
            <h1 className="text-4xl font-display font-bold text-foreground">Your Progress</h1>
            <p className="text-lg text-muted-foreground">
              Track your improvement over time and celebrate your achievements.
            </p>
          </section>

          {/* Statistics */}
          <section className="grid md:grid-cols-4 gap-4">
            <div className="card-soft space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Latest Score</span>
                <Award className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{latestScore}%</p>
            </div>

            <div className="card-soft space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{averageScore}%</p>
            </div>

            <div className="card-soft space-y-2">
              <span className="text-sm text-muted-foreground">Total Screenings</span>
              <p className="text-3xl font-bold text-foreground">{history.length}</p>
            </div>

            <div className={`card-soft space-y-2 ${improvement >= 0 ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
              <span className="text-sm text-muted-foreground">Overall Improvement</span>
              <p className={`text-3xl font-bold ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {improvement >= 0 ? '+' : ''}{improvement}%
              </p>
            </div>
          </section>

          {/* Overall Score Trend */}
          <section className="card-soft space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Score Trend</h2>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A8D5BA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A8D5BA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5ddd4" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#A8D5BA"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </section>

          {/* Component Breakdown */}
          {chartData.length > 0 && (
            <section className="card-soft space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">Component Performance</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5ddd4" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="reading" stroke="#3b82f6" strokeWidth={2} name="Reading" />
                  <Line type="monotone" dataKey="phonological" stroke="#10b981" strokeWidth={2} name="Phonological" />
                  <Line type="monotone" dataKey="spelling" stroke="#f59e0b" strokeWidth={2} name="Spelling" />
                </LineChart>
              </ResponsiveContainer>
            </section>
          )}

          {/* Detailed History */}
          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">Assessment History</h2>
            {history.length === 0 ? (
              <div className="card-soft text-center py-12">
                <p className="text-muted-foreground">No assessments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((result, index) => (
                  <div key={result.id} className="card-soft">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {new Date(result.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                            <span>Reading: {result.details.readingTest}%</span>
                            <span>Phonological: {result.details.phonologicalTasks}%</span>
                            <span>Spelling: {result.details.spellingQuiz}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">{result.score}%</p>
                          {index > 0 && (
                            <p className={`text-xs font-medium ${
                              result.score >= history[index - 1].score
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {result.score >= history[index - 1].score ? '↑' : '↓'} {Math.abs(result.score - history[index - 1].score)}%
                            </p>
                          )}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          result.riskLevel === 'low'
                            ? 'bg-green-100 text-green-700'
                            : result.riskLevel === 'moderate'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Insights */}
          <section className="card-soft space-y-4">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Key Insights</h2>
            <div className="space-y-3 text-muted-foreground text-sm">
              {improvement > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <p>Great work! You've shown an improvement of <strong>{improvement}%</strong> since your first assessment.</p>
                </div>
              )}
              {improvement < 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-yellow-600 font-bold">!</span>
                  <p>Your latest score is slightly lower. Consider reviewing your support strategies and reaching out for help.</p>
                </div>
              )}
              {history.length >= 3 && (
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">→</span>
                  <p>You've completed <strong>{history.length} assessments</strong>. Consistent practice is key to improvement.</p>
                </div>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <section className="flex gap-3">
            <Link href="/screening" className="flex-1">
              <Button className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                Take Another Screening
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
