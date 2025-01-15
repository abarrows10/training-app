"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, ListOrdered, Dumbbell, Users, Calendar, Upload, Home, Menu, X, LineChart, Split } from 'lucide-react';
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
    { href: '/coach/analytics', label: 'Analytics', icon: LineChart },
    { href: '/coach/videos', label: 'Videos', icon: Upload },
    { href: '/coach/video-analysis', label: 'Video Analysis', icon: Split },
    
  ];

  const closeNav = () => {
    setIsNavOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-[#18191A] relative">
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#242526] text-white hover:bg-[#3A3B3C] transition-colors"
        aria-label="Toggle menu"
      >
        {isNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay - Only shows on mobile when menu is open */}
      {isNavOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeNav}
        ></div>
      )}

      {/* Navigation Sidebar */}
      <nav className={`
        fixed lg:static w-72 bg-[#242526] min-h-screen p-6 z-40
        transition-transform duration-300 ease-in-out
        ${isNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
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

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 mt-12 lg:mt-0">
        {children}
      </main>
    </div>
  );
}