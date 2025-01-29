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
  sendSignInLinkToEmail,
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
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  verificationEmailSent: boolean;
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
  createAthleteProfile: (coachId: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  isEmailVerified: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
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
          console.log('Auth state changed - User:', {
            email: user.email,
            emailVerified: user.emailVerified,
            metadata: user.metadata
          });
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userProfile = userDoc.data() as UserProfile;
            console.log('User profile found:', userProfile);
            
            // Update email verified status if needed
            if (userProfile.emailVerified !== user.emailVerified) {
              await setDoc(doc(db, 'users', user.uid), {
                ...userProfile,
                emailVerified: user.emailVerified
              }, { merge: true });
              userProfile.emailVerified = user.emailVerified;
            }
            
            setProfile(userProfile);
            setIsAdmin(!!userProfile.isAdmin);
            
            // Redirect unverified non-admin users
            if (!user.emailVerified && !userProfile.isAdmin) {
              const allowedPaths = ['/login', '/verify-email'];
              if (!allowedPaths.includes(window.location.pathname)) {
                router.push('/verify-email');
                return;
              }
            }
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
      
      // Check email verification for non-admin users
      if (!result.user.emailVerified && !isAdmin) {
        if (!verificationEmailSent) {
          await sendEmailVerification(result.user);
          setVerificationEmailSent(true);
        }
        router.push('/verify-email');
        return;
      }
      
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
      
      // Send verification email
      await sendEmailVerification(result.user);
      setVerificationEmailSent(true);
      
      const userProfile: UserProfile = {
        email,
        role,
        isAdmin: false,
        emailVerified: false
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
      
      router.push('/verify-email');
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    if (!user) throw new Error('Not authenticated');
    try {
      await sendEmailVerification(user);
      setVerificationEmailSent(true);
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  };

  const isEmailVerified = () => {
    return user?.emailVerified || false;
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

  const updateUserEmail = async (newEmail: string) => {
    if (!user) throw new Error('No user signed in');
    try {
      await updateEmail(user, newEmail);
      await setDoc(doc(db, 'users', user.uid), { email: newEmail }, { merge: true });
      
      // Reset verification status for new email
      if (user.emailVerified) {
        await sendEmailVerification(user);
        setVerificationEmailSent(true);
      }
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

  const createAthleteProfile = async (coachId: string) => {
    if (!user) throw new Error('Not authenticated');
    
    await setDoc(doc(db, 'users', user.uid), {
      role: 'athlete',
      coachId: coachId
    }, { merge: true });
    
    await setDoc(doc(db, `coaches/${coachId}/athletes/${user.uid}`), {
      name: user.displayName || user.email,
      email: user.email,
      joinedAt: new Date().toISOString()
    });
  };

  const toggleViewMode = async () => {
    const newMode = viewMode === 'coach' ? 'athlete' : 'coach';
    setViewMode(newMode);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('viewMode', newMode);
      document.cookie = `viewMode=${newMode}; path=/;`;
    }
    
    if (newMode === 'athlete') {
      router.push('/athlete/workouts');
    } else {
      router.push('/coach/exercises');
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
        verificationEmailSent,
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
        createAthleteProfile,
        sendVerificationEmail,
        isEmailVerified
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