'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, RefreshCw } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function VerifyEmailPage() {
  const { user, profile, verificationEmailSent, sendVerificationEmail, isEmailVerified } = useAuth();
  const [error, setError] = useState<string>('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.emailVerified) {
      // Redirect based on user role
      if (profile?.role === 'coach' || profile?.role === 'super_admin') {
        router.push('/coach/exercises');
      } else {
        router.push('/athlete/workouts');
      }
    }
  }, [user, profile, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendDisabled && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    
    if (countdown === 0) {
      setResendDisabled(false);
      setCountdown(60);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendDisabled, countdown]);

  const handleResendEmail = async () => {
    try {
      setError('');
      await sendVerificationEmail();
      setResendDisabled(true);
    } catch (error: any) {
      setError(error.message || 'Failed to send verification email');
      setResendDisabled(false);
    }
  };

  // Update handleRefreshStatus function
const handleRefreshStatus = async () => {
    if (!user) return;
    
    try {
      await user.reload();
      const idTokenResult = await user.getIdTokenResult(true);
      
      console.log('Refresh status:', {
        email: user.email,
        emailVerified: user.emailVerified,
        token: idTokenResult
      });
  
      if (user.emailVerified) {
        // Force profile refresh
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userProfile = userDoc.data();
          if (userProfile.role === 'coach' || userProfile.role === 'super_admin') {
            router.push('/coach/exercises');
          } else {
            router.push('/athlete/workouts');
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
      setError('Failed to verify email status. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#18191A]">
      <div className="bg-[#242526] p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-[#3A3B3C] rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-[#00A3E0]" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center">
            Verify your email
          </h1>
          <p className="text-gray-400 text-center mt-2">
            We sent a verification link to:
          </p>
          <p className="text-white font-medium mt-1">
            {user?.email}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <button
            onClick={handleResendEmail}
            disabled={resendDisabled}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg font-medium
              ${resendDisabled 
                ? 'bg-[#3A3B3C] text-gray-400 cursor-not-allowed' 
                : 'bg-[#00A3E0] text-white hover:bg-[#0077A3]'} 
              transition-colors`}
          >
            {resendDisabled ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Resend available in {countdown}s
              </>
            ) : (
              'Resend verification email'
            )}
          </button>

          <button
            onClick={handleRefreshStatus}
            className="w-full p-3 border border-[#3A3B3C] rounded-lg text-white hover:bg-[#3A3B3C] transition-colors"
          >
            I've verified my email
          </button>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-400 text-center">
            Click the link in your email to verify your account. 
            {verificationEmailSent && " If you don't see it, check your spam folder."}
          </p>
        </div>
      </div>
    </div>
  );
}