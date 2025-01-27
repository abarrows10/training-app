"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Home, Menu, X, User, LogOut, ListPlus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ViewToggle from '@/components/ui/ViewToggle';

export default function AthleteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();
  
  const navItems = [
    { href: '/account', label: 'Account', icon: User },
    { href: '/athlete/workouts', label: 'My Workouts', icon: ListPlus },
  ];

  const closeNav = () => {
    setIsNavOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#18191A] relative">
      <button
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="xl:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#242526] text-white hover:bg-[#3A3B3C] transition-colors"
        aria-label="Toggle menu"
      >
        {isNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isNavOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 xl:hidden"
          onClick={closeNav}
        ></div>
      )}

      <nav className={`
        fixed xl:static w-72 bg-[#242526] min-h-screen z-40
        transition-transform duration-300 ease-in-out
        ${isNavOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
      `}>
        <div className="p-6 xl:p-6 pt-16 xl:pt-6">
          <Link 
            href="/athlete/workouts" 
            className="block text-xl font-bold mb-12 text-white hover:text-[#00A3E0] transition-colors flex items-center gap-3"
            onClick={closeNav}
          >
            <Home className="w-7 h-7" />
            Blakely & Baylor's Training
          </Link>

          <ViewToggle />

          <div className="space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={closeNav}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  pathname === href
                    ? 'bg-[#3A3B3C] text-[#00A3E0]'
                    : 'text-gray-300 hover:bg-[#3A3B3C] hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${
                  pathname === href ? 'text-[#00A3E0]' : 'text-gray-400'
                }`} />
                {label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-[#3A3B3C] transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 xl:p-8 mt-12 xl:mt-0">
        {children}
      </main>
    </div>
  );
}