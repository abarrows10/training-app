'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Menu, Dumbbell, PlaySquare, Calendar, Users, Video, Tag, ChartNoAxesCombined, User, Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountManagement() {
  const { user, profile, updateUserEmail, updateUserPassword, logout } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

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

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleDisplay = () => {
    if (profile?.isAdmin) return 'Super Admin';
    return profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Unknown';
  };

  const getNavItems = () => {
    if (profile?.role === 'coach') {
      return [
        { href: '/account', label: 'Account', icon: User },
  { 
    href: '#', // No direct link, just a menu trigger
    label: 'Exercises', 
    icon: Dumbbell,
    subItems: [
      { href: '/coach/exercises', label: 'Exercise Library', icon: Dumbbell },
      { href: '/coach/categories', label: 'Categories', icon: Tag }
    ]
  },
  { href: '/coach/sequences', label: 'Sequences', icon: PlaySquare },
  { href: '/coach/workouts', label: 'Workouts', icon: Calendar },
  { href: '/coach/assignments', label: 'Assignments', icon: Calendar },
  { href: '/coach/athletes', label: 'Athletes', icon: Users },
  { href: '/coach/videos', label: 'Videos', icon: PlaySquare },
  { href: '/coach/video-analysis', label: 'Video Analysis', icon: Video },
  { href: '/coach/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
];
    } else {
      return [
        { href: '/account', label: 'Account', icon: User },
        { href: '/athlete/workouts', label: 'My Workouts', icon: Dumbbell }
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex bg-[#18191A] relative">
      <button
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#242526] text-white hover:bg-[#3A3B3C] transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isNavOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsNavOpen(false)}
        />
      )}

      <nav className={`
        fixed lg:static w-72 bg-[#242526] min-h-screen p-6 z-40
        transition-transform duration-300 ease-in-out
        ${isNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Link 
          href="/" 
          className="block text-xl font-bold mb-12 text-white hover:text-[#00A3E0] transition-colors flex items-center gap-3"
          onClick={() => setIsNavOpen(false)}
        >
          <Home className="w-7 h-7" />
          Blakely & Baylor's Training
        </Link>

        <div className="space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsNavOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#3A3B3C] hover:text-white transition-colors"
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-[#3A3B3C] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 mt-12 lg:mt-0">
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
                <p className="text-white">{getRoleDisplay()}</p>
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
      </main>
    </div>
  );
}