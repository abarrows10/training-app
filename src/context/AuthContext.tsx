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
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

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
  viewMode: 'coach' | 'athlete';
  toggleViewMode: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'coach' | 'athlete'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('viewMode') as 'coach' | 'athlete' || 'coach';
    }
    return 'coach';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      if (user) {
        try {
          console.log('Fetching user doc for:', user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userProfile = userDoc.data() as UserProfile;
            console.log('User profile found:', userProfile);
            setProfile(userProfile);
            setIsAdmin(!!userProfile.isAdmin);
          } else {
            console.log('No user document exists');
            router.push('/login');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          router.push('/login');
        }
      } else {
        console.log('No user authenticated - redirecting to login');
        setProfile(null);
        setIsAdmin(false);
        router.push('/login');
      }
      setUser(user);
      setLoading(false);
    });
 
    return () => unsubscribe();
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting sign in...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', result);
      const token = await result.user.getIdToken();
      console.log('Token generated:', token);
      document.cookie = `authToken=${token}; path=/;`;
      console.log('Cookie set');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
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

      // Update toggleViewMode function
  const toggleViewMode = async () => {
  const newMode = viewMode === 'coach' ? 'athlete' : 'coach'
  setViewMode(newMode)
  
  // Update both localStorage and cookie
  if (typeof window !== 'undefined') {
    localStorage.setItem('viewMode', newMode)
    document.cookie = `viewMode=${newMode}; path=/;`
  }
  
  // Redirect based on new mode
  if (newMode === 'athlete') {
    router.push('/athlete/workouts')
  } else {
    router.push('/coach/exercises')
  }
}

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

  const updateUserEmail = async (newEmail: string) => {
    if (!user) throw new Error('No user signed in');
    try {
      await updateEmail(user, newEmail);
      await setDoc(doc(db, 'users', user.uid), { email: newEmail }, { merge: true });
      
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
        viewMode,
        toggleViewMode,
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