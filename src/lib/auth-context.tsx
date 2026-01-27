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
  login: (identifier: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from local storage on mount (simple persistence for demo)
  useEffect(() => {
    const storedUser = localStorage.getItem('octoops_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string) => {
    try {
        const { auth } = await import('./api');
        const res = await auth.login(identifier);
        
        if (res.data?.user) {
            const loggedUser = {
                ...res.data.user,
                id: res.data.user._id // Map _id to id for frontend consistency
            };
            setUser(loggedUser);
            localStorage.setItem('octoops_user', JSON.stringify(loggedUser));
            return true;
        }
        throw new Error('Invalid response from server');
    } catch (err) {
        console.error("Login verification failed:", err);
        throw err; // Propagate error to caller
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('octoops_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
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
