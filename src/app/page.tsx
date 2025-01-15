"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#18191A]">
      <div className="max-w-md w-full p-6 bg-[#242526] rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-white">Blakely & Baylor's Training App</h1>
        <div className="space-y-4">
  <Link 
    href="/coach/exercises"
    className="block w-full p-4 text-center bg-[#00A3E0] text-white font-bold rounded-lg hover:bg-[#0077A3] transition-colors"
  >
    Coaches
  </Link>
  <Link
    href="/athlete/workouts"
    className="block w-full p-4 text-center bg-[#18191A] text-white font-bold rounded-lg hover:bg-[#3A3B3C] transition-colors"
  >
    Athletes
  </Link>
  <Link
    href="/coach/analysis"
    className="block w-full p-4 text-center bg-[#18191A] text-white font-bold rounded-lg hover:bg-[#3A3B3C] transition-colors"
  >
    Video Analysis
  </Link>
</div>
      </div>
    </main>
  );
}