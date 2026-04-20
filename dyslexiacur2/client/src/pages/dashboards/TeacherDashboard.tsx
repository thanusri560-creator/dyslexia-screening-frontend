import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { teacherAPI } from '@/lib/api';
import { Users, TrendingUp, AlertCircle } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      if (!user) return;
      try {
        const data = await teacherAPI.getStudents(user.id);
        setStudents(data);
      } catch (error) {
        console.error('Failed to load students:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStudents();
  }, [user]);

  const highRiskCount = students.filter(s => s.riskLevel === 'high').length;
  const moderateRiskCount = students.filter(s => s.riskLevel === 'moderate').length;

  return (
    <ProtectedRoute requiredRole={['teacher']}>
      <Layout>
        <div className="space-y-8">
          {/* Welcome Section */}
          <section className="space-y-4">
            <h1 className="text-4xl font-display font-bold text-foreground">
              Welcome, {user?.name}!
            </h1>
            <p className="text-lg text-muted-foreground">
              Monitor your students' dyslexia screening results and provide targeted support.
            </p>
          </section>

          {/* Statistics */}
          <section className="grid md:grid-cols-3 gap-6">
            <div className="card-soft space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Students</span>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{students.length}</p>
            </div>

            <div className="card-soft space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">High Risk</span>
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">{highRiskCount}</p>
            </div>

            <div className="card-soft space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Moderate Risk</span>
                <TrendingUp className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">{moderateRiskCount}</p>
            </div>
          </section>

          {/* Students List */}
          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">Your Students</h2>
            {students.length === 0 ? (
              <div className="card-soft text-center py-12">
                <p className="text-muted-foreground mb-4">No students assigned yet</p>
                <Button variant="outline">Add Students</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="card-soft">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{student.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{student.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Last screening: {new Date(student.lastScreening).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          student.riskLevel === 'low'
                            ? 'bg-green-100 text-green-700'
                            : student.riskLevel === 'moderate'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {student.riskLevel.charAt(0).toUpperCase() + student.riskLevel.slice(1)}
                        </div>
                        <Button variant="ghost" size="sm" className="h-9">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Resources for Teachers */}
          <section className="card-soft space-y-4">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Teacher Resources</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/help">
                <Button variant="outline" className="w-full h-12">
                  📚 Dyslexia Information
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-12">
                🎓 Classroom Strategies
              </Button>
              <Button variant="outline" className="w-full h-12">
                👥 Parent Communication
              </Button>
              <Button variant="outline" className="w-full h-12">
                📖 Support Materials
              </Button>
            </div>
          </section>

          {/* Recommendations Section */}
          <section className="card-soft space-y-4 border-l-4 border-accent">
            <h2 className="text-xl font-semibold text-foreground mb-3">Quick Tips</h2>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• Use dyslexia-friendly fonts in classroom materials</li>
              <li>• Provide extra time for reading and writing tasks</li>
              <li>• Use multi-sensory learning approaches</li>
              <li>• Encourage students to use assistive technology</li>
              <li>• Communicate regularly with parents about progress</li>
            </ul>
          </section>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
