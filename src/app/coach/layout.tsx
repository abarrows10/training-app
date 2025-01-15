"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, ListOrdered, Dumbbell, Users, Calendar, Upload, Home, Menu, X, LineChart, Video } from 'lucide-react';
import { useState } from 'react';

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const navItems = [
    { href: '/coach/exercises', label: 'Exercise Library', icon: Library },
    { href: '/coach/sequences', label: 'Sequences', icon: ListOrdered },
    { href: '/coach/workouts', label: 'Workouts', icon: Dumbbell },
    { href: '/coach/athletes', label: 'Athletes', icon: Users },
    { href: '/coach/assignments', label: 'Assignments', icon: Calendar },
    { href: '/coach/videos', label: 'Videos', icon: Upload },
    { href: '/coach/analytics', label: 'Analytics', icon: LineChart },
    { href: '/coach/video-analysis', label: 'Video Analysis', icon: Video },
  ];

  const closeNav = () => {
    setIsNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#18191A]">
      <button
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#242526] text-white hover:bg-[#3A3B3C] transition-colors"
        aria-label="Toggle menu"
      >
        {isNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isNavOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeNav}
        />
      )}

      <nav className={`
        fixed w-72 bg-[#242526] min-h-screen p-6 z-40 transform
        transition-transform duration-300 ease-in-out
        ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Link 
          href="/" 
          className="block text-xl font-bold mb-12 text-white hover:text-[#00A3E0] transition-colors flex items-center gap-3"
          onClick={closeNav}
        >
          <Home className="w-7 h-7" />
          Blakely & Baylor's Training
        </Link>
        
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
        </div>
      </nav>

      <main className="w-full min-h-screen">
        {children}
      </main>
    </div>
  );
}