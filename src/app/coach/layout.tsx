"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Dumbbell, 
  User, 
  Users, 
  Calendar1,
  Video, 
  Home, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  ChartNoAxesCombined,
  LogOut,
  Tag,
  Layers,
  ListPlus
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ViewToggle from '@/components/ui/ViewToggle';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  subItems?: { href: string; label: string; icon: any }[];
}

const navItems: NavItem[] = [
  { href: '/account', label: 'Account', icon: User },
  { 
    href: '#',
    label: 'Exercises', 
    icon: Dumbbell,
    subItems: [
      { href: '/coach/exercises', label: 'Exercise Library', icon: Dumbbell },
      { href: '/coach/categories', label: 'Categories', icon: Tag }
    ]
  },
  { href: '/coach/sequences', label: 'Sequences', icon: Layers },
  { href: '/coach/workouts', label: 'Workouts', icon: ListPlus },
  { href: '/coach/assignments', label: 'Assignments', icon: Calendar1 },
  { href: '/coach/athletes', label: 'Athletes', icon: Users },
  { href: '/coach/videos', label: 'Videos', icon: Video },
  { href: '/coach/video-analysis', label: 'Video Analysis', icon: Video },
  { href: '/coach/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
];

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const router = useRouter();
  const { logout } = useAuth();

  const closeNav = () => setIsNavOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isSubItemActive = (href: string) => pathname === href;
  const isMainItemActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.subItems?.some(sub => pathname === sub.href)) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex bg-[#18191A] relative">
      <button
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#242526] text-white hover:bg-[#3A3B3C] transition-colors"
        aria-label="Toggle menu"
      >
        {isNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isNavOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeNav}
        />
      )}

      <nav className={`
        fixed lg:static w-72 bg-[#242526] min-h-screen z-40
        transition-transform duration-300 ease-in-out
        ${isNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 md:p-6 pt-16 md:pt-6">
          <Link 
            href="/coach/exercises" 
            className="block text-xl font-bold mb-12 text-white hover:text-[#00A3E0] transition-colors flex items-center gap-3"
            onClick={closeNav}
          >
            <Home className="w-7 h-7" />
            Blakely & Baylor's Training
          </Link>

          <ViewToggle />

          <div className="space-y-2">
            {navItems.map((item) => (
              <div key={item.href} className="space-y-1">
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.href ? null : item.href)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                        isMainItemActive(item)
                          ? 'bg-[#3A3B3C] text-[#00A3E0]'
                          : 'text-gray-300 hover:bg-[#3A3B3C] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${
                          isMainItemActive(item) ? 'text-[#00A3E0]' : 'text-gray-400'
                        }`} />
                        {item.label}
                      </div>
                      {expandedItem === item.href ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </button>
                    
                    {expandedItem === item.href && (
                      <div className="ml-9 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={closeNav}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                              isSubItemActive(subItem.href)
                                ? 'bg-[#3A3B3C] text-[#00A3E0]'
                                : 'text-gray-300 hover:bg-[#3A3B3C] hover:text-white'
                            }`}
                          >
                            <subItem.icon className={`w-4 h-4 ${
                              isSubItemActive(subItem.href) ? 'text-[#00A3E0]' : 'text-gray-400'
                            }`} />
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={closeNav}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isMainItemActive(item)
                        ? 'bg-[#3A3B3C] text-[#00A3E0]'
                        : 'text-gray-300 hover:bg-[#3A3B3C] hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${
                      isMainItemActive(item) ? 'text-[#00A3E0]' : 'text-gray-400'
                    }`} />
                    {item.label}
                  </Link>
                )}
              </div>
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

      <main className="flex-1 p-4 lg:p-8 mt-12 lg:mt-0">
        {children}
      </main>
    </div>
  );
}