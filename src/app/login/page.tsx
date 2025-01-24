'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Mode = 'signin' | 'signup' | 'reset';
type Role = 'coach' | 'athlete';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<Mode>('signin');
  const [role, setRole] = useState<Role>('athlete');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { signIn, signUp, resetPassword, user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      // Route based on user role
      const routeUser = () => {
        if (profile.isAdmin) {
          router.push('/coach/exercises');
        } else if (profile.role === 'coach') {
          router.push('/coach/exercises');
        } else {
          router.push('/athlete/workouts');
        }
      };
      routeUser();
    }
  }, [user, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters');
          return;
        }
        await signUp(email, password, role);
        setMessage('Account created! You can now sign in.');
        setMode('signin');
      } else if (mode === 'signin') {
        await signIn(email, password);
      } else if (mode === 'reset') {
        await resetPassword(email);
        setMessage('Password reset instructions sent to your email.');
        setMode('signin');
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 8 characters');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else {
        setError(error.message || (mode === 'signup' ? 'Error creating account' : 'Invalid email or password'));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#18191A]">
      <div className="bg-[#242526] p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Blakely & Baylor's Training
        </h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="block text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                required
              />
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-gray-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full p-3 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                >
                  <option value="athlete" className="bg-[#18191A]">Athlete</option>
                  <option value="coach" className="bg-[#18191A]">Coach</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-[#00A3E0] text-white p-3 rounded-lg hover:bg-[#0077A3] transition-colors font-semibold"
          >
            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2">
          {mode === 'signin' && (
            <>
              <button
                onClick={() => setMode('signup')}
                className="w-full text-[#00A3E0] hover:text-[#0077A3] transition-colors"
              >
                Need an account? Sign up
              </button>
              <button
                onClick={() => setMode('reset')}
                className="w-full text-[#00A3E0] hover:text-[#0077A3] transition-colors"
              >
                Forgot password?
              </button>
            </>
          )}
          {(mode === 'signup' || mode === 'reset') && (
            <button
              onClick={() => setMode('signin')}
              className="w-full text-[#00A3E0] hover:text-[#0077A3] transition-colors"
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}