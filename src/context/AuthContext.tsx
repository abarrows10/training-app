'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type UserRole = 'super_admin' | 'coach' | 'athlete';

interface UserProfile {
  email: string;
  role: UserRole;
  isAdmin?: boolean;
  coachId?: string;
  activeCoachId?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserEmail: (newEmail: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  setActiveCoachId: (coachId: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userProfile = userDoc.data() as UserProfile;
            setProfile(userProfile);
            setIsAdmin(!!userProfile.isAdmin);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      document.cookie = `authToken=${token}; path=/;`;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(result.user);
      
      const userProfile: UserProfile = {
        email,
        role,
        isAdmin: false
      };

      await setDoc(doc(db, 'users', result.user.uid), userProfile);
      
      if (role === 'coach') {
        await setDoc(doc(db, 'coaches', result.user.uid), {
          content: {
            drills: [],
            sequences: [],
            workouts: [],
            videos: [],
            assignments: []
          },
          athletes: {},
          invites: {}
        });
      }

      const token = await result.user.getIdToken();
      document.cookie = `authToken=${token}; path=/;`;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    if (!user) throw new Error('No user signed in');
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/login`
      });
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw error;
    }
  };

  const updateUserEmail = async (newEmail: string) => {
    if (!user) throw new Error('No user signed in');
    try {
      await updateEmail(user, newEmail);
      await setDoc(doc(db, 'users', user.uid), { email: newEmail }, { merge: true });
      await sendEmailVerification(user, {
        url: `${window.location.origin}/login`
      });
    } catch (error: any) {
      console.error('Email update error:', error);
      throw error;
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!user) throw new Error('No user signed in');
    try {
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Password update error:', error);
      throw error;
    }
  };

  const setActiveCoachId = async (coachId: string) => {
    if (!user || !isAdmin) throw new Error('Unauthorized');
    try {
      await setDoc(doc(db, 'users', user.uid), { activeCoachId: coachId }, { merge: true });
      setProfile(prev => prev ? { ...prev, activeCoachId: coachId } : null);
    } catch (error: any) {
      console.error('Set active coach error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile,
        loading, 
        signIn, 
        signUp,
        resetPassword,
        updateUserEmail,
        updateUserPassword,
        logout,
        isAdmin,
        setActiveCoachId,
        resendVerificationEmail
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}