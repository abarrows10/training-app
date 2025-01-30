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
  isSignInWithEmailLink,
  signInWithEmailLink,
  ActionCodeSettings,
  UserCredential
} from 'firebase/auth';
import { auth, db, getActionCodeSettings } from '@/firebase/config';
import { doc, getDoc, setDoc,updateDoc, collection } from 'firebase/firestore';
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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, inviteId?: string) => Promise<void>;
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
  checkEmailVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const router = useRouter();
  // Add after the router declaration
const fetchAndUpdateProfile = async (uid: string, emailVerified: boolean) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  
  if (userDoc.exists()) {
    const userProfile = userDoc.data() as UserProfile;
    
    // Update Firestore if verification status changed
    if (userProfile.emailVerified !== emailVerified) {
      await setDoc(doc(db, 'users', uid), {
        ...userProfile,
        emailVerified
      }, { merge: true });
      
      userProfile.emailVerified = emailVerified;
    }
    
    setProfile(userProfile);
    setIsAdmin(!!userProfile.isAdmin);
    return userProfile;
  }
  return null;
};
  const [viewMode, setViewMode] = useState<'coach' | 'athlete'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('viewMode') as 'coach' | 'athlete' || 'coach';
    }
    return 'coach';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userProfile = userDoc.data() as UserProfile;
            setProfile(userProfile);
            setIsAdmin(!!userProfile.isAdmin);

            // Route based on user role
            if (userProfile.role === 'coach' || userProfile.role === 'super_admin') {
              router.push('/coach/exercises');
            } else {
              router.push('/athlete/workouts');
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          router.push('/login');
        }
      } else {
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
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      document.cookie = `authToken=${token}; path=/;`;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: UserRole, inviteId?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(result.user);
      
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

      // Handle invitation if present
      if (inviteId) {
        const inviteDoc = await getDoc(doc(db, 'coaches/invitations', inviteId));
        if (inviteDoc.exists()) {
          const invite = inviteDoc.data();
          await createAthleteProfile(invite.coachId);
          await updateDoc(doc(db, 'coaches/invitations', inviteId), {
            status: 'accepted',
            acceptedAt: new Date().toISOString()
          });
        }
      }

      const token = await result.user.getIdToken();
      document.cookie = `authToken=${token}; path=/;`;
    } catch (error: any) {
      console.error('Sign up error:', error);
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
      
      // Send new verification email
      await sendEmailVerification(user);
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

  const sendVerificationEmail = async () => {
    if (!user) throw new Error('No user signed in');
    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error('Error sending verification:', error);
      throw error;
    }
  };

  const checkEmailVerification = async () => {
    if (!user) return;
    try {
      await user.reload();
      if (user.emailVerified) {
        await setDoc(doc(db, 'users', user.uid), { emailVerified: true }, { merge: true });
      }
    } catch (error) {
      console.error('Error checking verification:', error);
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
        createAthleteProfile,
        sendVerificationEmail,
        checkEmailVerification
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