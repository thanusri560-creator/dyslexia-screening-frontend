import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser);
        setUser(user);
        
        // Verify token is still valid by fetching user profile
        fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            // Update user info from server
            const updatedUser: User = {
              id: data.user._id || data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              createdAt: data.user.createdAt,
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        })
        .catch(err => {
          console.error('Token verification failed:', err);
          // Token is invalid, clear storage
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        });
      } catch (e) {
        console.error('Failed to load user:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call actual backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        createdAt: new Date().toISOString(),
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // Call actual backend API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      
      const data = await response.json();
      console.log('Signup response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        createdAt: new Date().toISOString(),
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
