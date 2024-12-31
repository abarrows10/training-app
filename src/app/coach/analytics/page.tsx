"use client";

import React, { useState } from 'react';
import { useStore } from '@/store';
import ProgressStats from '@/components/ProgressStats';

export default function AnalyticsPage() {
  const { athletes } = useStore();
  const [selectedAthlete, setSelectedAthlete] = useState<number>(0);

  return (
    <div>
      <div className="flex flex-col items-center gap-8 mb-8">
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <select
          value={selectedAthlete}
          onChange={(e) => setSelectedAthlete(Number(e.target.value))}
          className="p-4 border border-[#3A3B3C] rounded-lg text-white text-lg font-semibold w-72 bg-[#242526] hover:border-[#00A3E0] transition-colors focus:outline-none focus:border-[#00A3E0]"
        >
          <option value={0} className="bg-[#242526]">Select Athlete</option>
          {athletes.map(athlete => (
            <option key={athlete.id} value={athlete.id} className="bg-[#242526]">
              {athlete.name}
            </option>
          ))}
        </select>
      </div>

      {selectedAthlete !== 0 ? (
        <ProgressStats athleteId={selectedAthlete} />
      ) : (
        <div className="bg-[#242526] rounded-xl shadow-lg p-6">
          <div className="text-center text-gray-400 py-8">
            Please select an athlete to view their stats
          </div>
        </div>
      )}
    </div>
  );
}