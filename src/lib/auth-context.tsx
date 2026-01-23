'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'owner' | 'member' | 'qa';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from local storage on mount (simple persistence for demo)
  useEffect(() => {
    const storedUser = localStorage.getItem('octoops_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (role: UserRole) => {
    let mockUser: User;
    
    switch (role) {
      case 'owner':
        mockUser = {
          id: 'u1',
          name: 'Sarah Chen',
          email: 'sarah@octoops.dev',
          role: 'owner',
          avatar: '👩‍💼'
        };
        break;
      case 'qa':
        mockUser = {
          id: 'u3',
          name: 'Emma Wilson', // Using Emma as QA/Reviewer for demo
          email: 'emma@octoops.dev',
          role: 'qa',
          avatar: '👩‍🎨'
        };
        break;
      case 'member':
      default:
        mockUser = {
          id: 'u2',
          name: 'Mike Johnson',
          email: 'mike@octoops.dev',
          role: 'member',
          avatar: '👨‍💻'
        };
        break;
    }

    setUser(mockUser);
    localStorage.setItem('octoops_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('octoops_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
