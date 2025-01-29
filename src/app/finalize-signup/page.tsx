'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function FinalizeSignupPage() {
  const { completeSignInWithLink, isEmailLink } = useAuth();
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('emailForSignIn');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    const finalizeSignIn = async () => {
      if (!email) return;

      try {
        // Verify the link is valid
        if (!isEmailLink(window.location.href)) {
          setError('Invalid sign-in link');
          return;
        }

        await completeSignInWithLink(email);
        router.push('/verify-email');
      } catch (error: any) {
        console.error('Error completing sign-in:', error);
        setError(error.message || 'Failed to complete sign-in');
      }
    };

    finalizeSignIn();
  }, [email, completeSignInWithLink, isEmailLink, router]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailInput = (e.target as HTMLFormElement).email.value;
    setEmail(emailInput);
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#18191A]">
        <div className="bg-[#242526] p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6">Complete Sign In</h1>
          <p className="text-gray-400 mb-4">
            Please provide your email address to complete the sign-in process.
          </p>

          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full p-3 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3]"
            >
              Continue Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#18191A]">
      <div className="bg-[#242526] p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Completing Sign In</h1>
        
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <p className="text-gray-400">Please wait while we complete your sign in...</p>
        )}
      </div>
    </div>
  );
}