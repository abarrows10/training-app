'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('athlete');
  const [error, setError] = useState('');
  const router = useRouter();
  const { signIn, signUp, user, userRole } = useAuth();

  useEffect(() => {
    if (user && userRole) {
      if (userRole === 'coach') {
        router.push('/coach/exercises');
      } else {
        router.push('/athlete/workouts');
      }
    }
  }, [user, userRole, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        await signUp(email, password, role);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      setError(error.message || (isSignUp ? 'Error creating account' : 'Invalid email or password'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#18191A]">
      <div className="bg-[#242526] p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Blakely & Baylor's Training
        </h1>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4">
            {error}
          </div>
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

          {isSignUp && (
            <div>
              <label className="block text-gray-300 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
              >
                <option value="athlete" className="bg-[#18191A]">Athlete</option>
                <option value="coach" className="bg-[#18191A]">Coach</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#00A3E0] text-white p-3 rounded-lg hover:bg-[#0077A3] transition-colors font-semibold"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-4 text-[#00A3E0] hover:text-[#0077A3] transition-colors"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
      </div>
    </div>
  );
}