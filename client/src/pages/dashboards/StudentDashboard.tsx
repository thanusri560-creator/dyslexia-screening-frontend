import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { screeningAPI, ScreeningResult } from '@/lib/api';
import { Play, TrendingUp, Calendar } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!user) return;
      try {
        const data = await screeningAPI.getHistory(user.id);
        setResults(data);
      } catch (error) {
        console.error('Failed to load results:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadResults();
  }, [user]);

  const latestResult = results[results.length - 1];

  const getWeakAreas = () => {
    if (!latestResult) return [];
    const areas = [
      { name: 'Reading Fluency', score: latestResult.details.readingTest },
      { name: 'Phonological Awareness', score: latestResult.details.phonologicalTasks },
      { name: 'Spelling', score: latestResult.details.spellingQuiz },
    ];
    return areas.sort((a, b) => a.score - b.score).slice(0, 2);
  };

  const weakAreas = getWeakAreas();

  return (
    <ProtectedRoute requiredRole={['student']}>
      <Layout>
        <div className="space-y-8">
          {/* Welcome Section */}
          <section className="space-y-4">
            <h1 className="text-4xl font-display font-bold text-foreground">
              Welcome, {user?.name}!
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your dyslexia screening progress and get personalized support recommendations.
            </p>
          </section>

          {/* Quick Actions */}
          <section className="grid md:grid-cols-2 gap-6">
            {/* Start Screening Card */}
            <div className="card-soft space-y-4 md:col-span-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">Ready to Screen?</h2>
                  <p className="text-muted-foreground">
                    Take a comprehensive dyslexia screening test. It takes about 15-20 minutes.
                  </p>
                </div>
                <div className="text-3xl">📝</div>
              </div>
              <Link href="/screening">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12">
                  <Play className="w-4 h-4" />
                  Start Screening
                </Button>
              </Link>
            </div>

            {/* Latest Result Card */}
            {latestResult && (
              <div className="card-soft space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Latest Result</h2>
                    <p className="text-sm text-muted-foreground">
                      {new Date(latestResult.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Risk Level:</span>
                    <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                      latestResult.riskLevel === 'low'
                        ? 'bg-green-100 text-green-700'
                        : latestResult.riskLevel === 'moderate'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {latestResult.riskLevel.charAt(0).toUpperCase() + latestResult.riskLevel.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Score:</span>
                    <span className="font-semibold text-foreground">{latestResult.score}%</span>
                  </div>
                </div>
                <Link href="/results">
                  <Button variant="outline" className="w-full h-10">
                    View Details
                  </Button>
                </Link>
              </div>
            )}
          </section>

          {/* Results History */}
          {results.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">Screening History</h2>
              <div className="space-y-3">
                {results.map((result) => (
                  <div key={result.id} className="card-soft flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {new Date(result.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">Score: {result.score}%</p>
                      </div>
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
                ))}
              </div>
            </section>
          )}

          {/* Weak Areas Analysis */}
          {latestResult && weakAreas.length > 0 && (
            <section className="card-soft space-y-4 border-l-4 border-accent">
              <h2 className="text-2xl font-semibold text-foreground">Areas for Improvement</h2>
              <div className="space-y-3">
                {weakAreas.map((area) => (
                  <div key={area.name} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="text-foreground font-medium">{area.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${area.score}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium min-w-12 text-right">{area.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                💡 Focus on these areas with targeted exercises and practice. Check recommendations for specific strategies.
              </p>
            </section>
          )}

          {/* Progress Section */}
          <section className="card-soft space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Your Progress</h2>
            </div>
            <Link href="/progress">
              <Button variant="outline" className="w-full h-10">
                View Detailed Progress
              </Button>
            </Link>
          </section>

          {/* Resources Section */}
          <section className="card-soft space-y-4">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Recommended Resources</h2>
            <Link href="/recommendations">
              <Button variant="outline" className="w-full h-10">
                View Personalized Recommendations
              </Button>
            </Link>
          </section>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
