import React, { useState } from 'react';
import { Link } from 'wouter';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { parentAPI } from '@/lib/api';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [childData, setChildData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const loadChildData = async () => {
      try {
        const data = await parentAPI.getChildResults('child_1');
        setChildData(data);
      } catch (error) {
        console.error('Failed to load child data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadChildData();
  }, []);

  const latestResult = childData?.latestResult;

  return (
    <ProtectedRoute requiredRole={['parent']}>
      <Layout>
        <div className="space-y-8">
          {/* Welcome Section */}
          <section className="space-y-4">
            <h1 className="text-4xl font-display font-bold text-foreground">
              Welcome, {user?.name}!
            </h1>
            <p className="text-lg text-muted-foreground">
              Monitor your child's dyslexia screening progress and access support resources.
            </p>
          </section>

          {/* Child Overview */}
          {childData && (
            <section className="grid md:grid-cols-2 gap-6">
              {/* Child Info Card */}
              <div className="card-soft space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-2">{childData.name}</h2>
                    <p className="text-muted-foreground">{childData.email}</p>
                  </div>
                  <div className="text-3xl">👧</div>
                </div>
              </div>

              {/* Latest Assessment Card */}
              {latestResult && (
                <div className="card-soft space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-2">Latest Assessment</h2>
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
                      <span className="text-muted-foreground">Overall Score:</span>
                      <span className="font-semibold text-foreground">{latestResult.score}%</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Assessment Details */}
          {latestResult && (
            <section className="card-soft space-y-4">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Assessment Breakdown</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Reading Test</p>
                  <p className="text-2xl font-bold text-foreground">{latestResult.details.readingTest}%</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Phonological Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{latestResult.details.phonologicalTasks}%</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Spelling Quiz</p>
                  <p className="text-2xl font-bold text-foreground">{latestResult.details.spellingQuiz}%</p>
                </div>
              </div>
            </section>
          )}

          {/* Assessment History */}
          {childData?.history && childData.history.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">Assessment History</h2>
              <div className="space-y-3">
                {childData.history.map((result: any) => (
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

          {/* Recommendations */}
          {childData?.recommendations && childData.recommendations.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-display font-semibold text-foreground">Recommended Support Strategies</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {childData.recommendations.map((rec: any) => (
                  <div key={rec.id} className="card-soft space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💡</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{rec.title}</h3>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Resources Section */}
          <section className="card-soft space-y-4 border-l-4 border-accent">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Need More Support?</h2>
                <p className="text-muted-foreground mb-4">
                  Access additional resources and connect with dyslexia specialists.
                </p>
                <Link href="/help">
                  <Button variant="outline" className="h-10">
                    View Resources
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
