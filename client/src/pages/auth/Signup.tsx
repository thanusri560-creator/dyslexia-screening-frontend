import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Signup() {
  const [, setLocation] = useLocation();
  const { signup, isLoading } = useAuth();
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await signup(name, email, password, role);
      setLocation('/dashboard');
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🧠</div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join our community of learners and supporters</p>
        </div>

        {/* Role Selection Step */}
        {step === 'role' && (
          <div className="space-y-4">
            <p className="text-center text-foreground font-medium mb-6">Who are you?</p>

            <div className="grid gap-3">
              <RoleCard
                role="student"
                title="Student"
                description="I want to take a dyslexia screening"
                icon="👨‍🎓"
                onClick={() => handleRoleSelect('student')}
              />
              <RoleCard
                role="parent"
                title="Parent"
                description="I want to monitor my child's progress"
                icon="👨‍👩‍👧"
                onClick={() => handleRoleSelect('parent')}
              />
              <RoleCard
                role="teacher"
                title="Teacher"
                description="I want to support my students"
                icon="👨‍🏫"
                onClick={() => handleRoleSelect('teacher')}
              />
              <RoleCard
                role="admin"
                title="Administrator"
                description="I manage the platform"
                icon="⚙️"
                onClick={() => handleRoleSelect('admin')}
              />
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-3">Already have an account?</p>
              <Button
                variant="outline"
                onClick={() => setLocation('/login')}
                className="w-full h-12 text-base"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}

        {/* Details Step */}
        {step === 'details' && (
          <div className="card-soft space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Display */}
              <div className="p-3 bg-secondary rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Signing up as</p>
                <p className="font-semibold text-foreground capitalize">{role}</p>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-base"
                  disabled={isLoading}
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base"
                  disabled={isLoading}
                />
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 text-base"
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => {
                setStep('role');
                setError('');
              }}
              className="w-full"
            >
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface RoleCardProps {
  role: UserRole;
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ title, description, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="card-soft hover:shadow-md hover:border-primary transition-all text-left group"
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
};
