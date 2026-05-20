'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
// import { 
//   onAuthStateChanged, 
//   User as FirebaseUser,
//   signOut,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signInWithPhoneNumber,
//   RecaptchaVerifier,
//   ConfirmationResult
// } from 'firebase/auth';
// import { collection, doc, getDoc, getDocs, limit, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
// import { auth, db } from '../lib/firebase';
import { normalizeMobile, toIndianE164 } from '../lib/phone';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  uid?: string;
  username: string;
  email: string;
  name: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  status?: string;
  program?: string;
  label?: string;
  permissions?: any[];
  mobile?: string;
  dob?: string;
  educationLevel?: string;
  enrolledCourse?: string;
  batchNumber?: string;
  createdAt: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (identifier: string, pass: string) => Promise<void>;
  requestOtpForMobile: (mobile: string, containerId: string) => Promise<void>;
  verifyOtpSignIn: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setUser({ id: data.id, uid: data.uid, email: data.email });
      } else {
        setProfile(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setProfile(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const signIn = async (identifier: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setProfile(data.user);
      setUser({ id: data.user.id, uid: data.user.uid, email: data.user.email });
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestOtpForMobile = async (mobile: string, containerId: string) => {
    console.warn('requestOtpForMobile: Custom OTP implementation required');
    throw new Error('OTP login is not yet implemented in custom auth');
  };

  const verifyOtpSignIn = async (otp: string) => {
    console.warn('verifyOtpSignIn: Custom OTP implementation required');
    throw new Error('OTP verification is not yet implemented in custom auth');
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, requestOtpForMobile, verifyOtpSignIn, logout }}>
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
