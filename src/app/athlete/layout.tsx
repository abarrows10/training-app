"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dumbbell, Home, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AthleteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  
  const navItems = [
    { href: '/athlete/workouts', label: 'My Workouts', icon: Dumbbell },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#18191A]">
      <nav className="w-72 bg-[#242526] p-6 flex flex-col h-screen">
        <Link 
          href="/" 
          className="block text-xl font-bold mb-12 text-white hover:text-[#00A3E0] transition-colors flex items-center gap-3"
        >
          <Home className="w-7 h-7" />
          Blakely & Baylor's Training
        </Link>
        <div className="flex-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
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
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#3A3B3C] hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5 text-gray-400" />
          Sign Out
        </button>
      </nav>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}