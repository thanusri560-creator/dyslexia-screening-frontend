import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { recommendationsAPI } from '@/lib/api';
import { BookOpen, Lightbulb, Users, Download, ExternalLink } from 'lucide-react';

export default function Recommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user) return;
      try {
        const data = await recommendationsAPI.getRecommendations(user.id);
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecommendations();
  }, [user]);

  const categoryIcons: Record<string, React.ReactNode> = {
    Reading: <BookOpen className="w-6 h-6" />,
    Phonological: <Lightbulb className="w-6 h-6" />,
    Spelling: <BookOpen className="w-6 h-6" />,
    Support: <Users className="w-6 h-6" />,
  };

  const categoryColors: Record<string, string> = {
    Reading: 'bg-blue-100 text-blue-700',
    Phonological: 'bg-green-100 text-green-700',
    Spelling: 'bg-purple-100 text-purple-700',
    Support: 'bg-pink-100 text-pink-700',
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <section className="space-y-4">
            <h1 className="text-4xl font-display font-bold text-foreground">
              Personalized Recommendations
            </h1>
            <p className="text-lg text-muted-foreground">
              Based on your screening results, here are tailored strategies and resources to support your learning.
            </p>
          </section>

          {/* Introduction */}
          <section className="card-soft space-y-4">
            <h2 className="text-xl font-semibold text-foreground">How to Use These Recommendations</h2>
            <p className="text-muted-foreground leading-relaxed">
              These recommendations are personalized based on your assessment results. Each suggestion includes practical strategies and resources you can implement immediately. Remember, every learner is unique—feel free to adapt these recommendations to your specific needs.
            </p>
          </section>

          {/* Recommendations Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading recommendations...</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="card-soft text-center py-12">
              <p className="text-muted-foreground">No recommendations available yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.map((rec) => (
                <div key={rec.id} className="card-soft space-y-4 hover:shadow-md transition-shadow">
                  {/* Category Badge */}
                  <div className="flex items-start justify-between">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${categoryColors[rec.category] || 'bg-gray-100 text-gray-700'}`}>
                      {categoryIcons[rec.category]}
                      {rec.category}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{rec.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{rec.description}</p>
                  </div>

                  {/* Resources */}
                  {rec.resources && rec.resources.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Resources:</p>
                      <ul className="space-y-2">
                        {rec.resources.map((resource: string, idx: number) => (
                          <li key={idx} className="text-sm">
                            <a
                              href={resource}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              Learn more <ExternalLink className="w-3 h-3" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Implementation Tips */}
          <section className="card-soft space-y-4">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Implementation Tips</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Start Small</h3>
                    <p className="text-sm text-muted-foreground">
                      Don't try to implement everything at once. Pick one or two strategies and build from there.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Be Consistent</h3>
                    <p className="text-sm text-muted-foreground">
                      Regular practice is key. Set aside dedicated time each day for dyslexia support activities.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Track Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Keep notes on what works best for you. Retake the screening periodically to measure improvement.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Seek Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Don't hesitate to reach out to teachers, parents, or specialists for guidance and encouragement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Professional Support */}
          <section className="card-soft space-y-4 border-l-4 border-accent">
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Consider Professional Support</h2>
                <p className="text-muted-foreground mb-4">
                  While these recommendations are helpful, professional evaluation and support from dyslexia specialists can provide more targeted intervention. Consider consulting with:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li>• Educational Psychologists</li>
                  <li>• Dyslexia Specialists</li>
                  <li>• Speech-Language Pathologists</li>
                  <li>• Special Education Teachers</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <section className="flex gap-3">
            <Button className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Download className="w-4 h-4" />
              Download as PDF
            </Button>
            <Link href="/progress" className="flex-1">
              <Button variant="outline" className="w-full h-12">
                View Progress
              </Button>
            </Link>
          </section>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
