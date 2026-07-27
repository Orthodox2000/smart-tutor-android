'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, setAuthToken, getAuthToken } from '../lib/api';

export type UserRole = 'student' | 'educator' | 'admin' | 'parent';

export interface UserProfile {
  id: string;
  uid?: string;
  username: string;
  email: string;
  name: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  label?: string;
  status?: 'active' | 'pending' | 'rejected';
  verified?: boolean;
  permissions?: any[];
  mobile?: string;
  dob?: string;
  educationLevel?: string;
  enrolledCourse?: string;
  batchNumber?: string;
  program?: string;
  createdAt: string;
  assignedFacultyIds?: string[];
  linkedStudentId?: string;
  linkedStudentMobile?: string;
  parentMobile?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (identifier: string, pass: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await apiFetch<{ user: UserProfile | null }>('/auth/session');
      if (data.user) {
        setProfile(data.user);
        setUser({ id: data.user.id, uid: data.user.uid, email: data.user.email });
      } else {
        setProfile(null);
        setUser(null);
      }
    } catch {
      setProfile(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const signIn = async (identifier: string, pass: string, role?: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<{ user: UserProfile; token?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login: identifier, password: pass, role: role || 'student' },
        ),
      });

      if (data.token) {
        setAuthToken(data.token);
      }

      setProfile(data.user);
      setUser({ id: data.user.id, uid: data.user.uid, email: data.user.email });
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
    } finally {
      setAuthToken(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
