'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Menu, Dumbbell, PlaySquare, Calendar, Users, Video, Tag, ChartNoAxesCombined, User, Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import CoachLayout from '../coach/layout';
import AthleteLayout from '../athlete/layout';

export default function AccountPage() {
  const { user, profile, updateUserEmail, updateUserPassword, logout } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const Layout = profile?.role === 'coach' || profile?.role === 'super_admin' ? CoachLayout : AthleteLayout;

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await updateUserEmail(newEmail);
      setMessage('Email updated successfully');
      setNewEmail('');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await updateUserPassword(newPassword);
      setMessage('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <Layout>
      <div className="flex-1 p-4 md:p-8 mt-12 lg:mt-0">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-[#242526] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">Account Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm">Email</label>
                <p className="text-white">{user?.email}</p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm">Role</label>
                <p className="text-white">{profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Unknown'}</p>
              </div>

              {profile?.role === 'athlete' && profile.coachId && (
                <div>
                  <label className="block text-gray-300 text-sm">Coach</label>
                  <p className="text-white">{profile.coachId}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#242526] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">Update Email</h2>
            
            <form onSubmit={handleEmailUpdate} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">New Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-3 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
              >
                Update Email
              </button>
            </form>
          </div>

          <div className="bg-[#242526] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">Update Password</h2>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="mt-4 bg-green-500/10 text-green-500 border-green-500/20">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </Layout>
  );
}