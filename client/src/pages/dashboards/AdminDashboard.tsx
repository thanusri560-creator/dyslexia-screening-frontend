import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { Trash2, Users, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await adminAPI.getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const usersByRole = {
    student: users.filter(u => u.role === 'student').length,
    parent: users.filter(u => u.role === 'parent').length,
    teacher: users.filter(u => u.role === 'teacher').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  return (
    <ProtectedRoute requiredRole={['admin']}>
      <Layout>
        <div className="space-y-8">
          {/* Welcome Section */}
          <section className="space-y-4">
            <h1 className="text-4xl font-display font-bold text-foreground">
              Administration Panel
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage users and platform settings
            </p>
          </section>

          {/* Statistics */}
          <section className="grid md:grid-cols-4 gap-4">
            <div className="card-soft space-y-2">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <p className="text-3xl font-bold text-foreground">{users.length}</p>
            </div>
            <div className="card-soft space-y-2">
              <span className="text-sm text-muted-foreground">Students</span>
              <p className="text-3xl font-bold text-primary">{usersByRole.student}</p>
            </div>
            <div className="card-soft space-y-2">
              <span className="text-sm text-muted-foreground">Parents</span>
              <p className="text-3xl font-bold text-primary">{usersByRole.parent}</p>
            </div>
            <div className="card-soft space-y-2">
              <span className="text-sm text-muted-foreground">Teachers</span>
              <p className="text-3xl font-bold text-primary">{usersByRole.teacher}</p>
            </div>
          </section>

          {/* User Management */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-semibold text-foreground">User Management</h2>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Users className="w-4 h-4" />
                Add User
              </Button>
            </div>

            {isLoading ? (
              <div className="card-soft text-center py-12">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="card-soft text-center py-12">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Joined</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4 text-foreground">{u.name}</td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Platform Settings */}
          <section className="card-soft space-y-4">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Platform Settings</h2>
            <div className="space-y-3">
              <Button variant="outline" className="w-full h-12 justify-start">
                <Settings className="w-4 h-4 mr-2" />
                System Configuration
              </Button>
              <Button variant="outline" className="w-full h-12 justify-start">
                📊 Analytics & Reports
              </Button>
              <Button variant="outline" className="w-full h-12 justify-start">
                🔒 Security Settings
              </Button>
              <Button variant="outline" className="w-full h-12 justify-start">
                📧 Email Templates
              </Button>
            </div>
          </section>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
