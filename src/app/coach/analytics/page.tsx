"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import ProgressStats from '@/components/ProgressStats';

export default function AnalyticsPage() {
  const { athletes } = useStore();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string; } | undefined>();

  if (!athletes.length) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">
          No athletes available. Add athletes to view analytics.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <select
          value={selectedAthleteId}
          onChange={(e) => setSelectedAthleteId(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Select Athlete</option>
          {athletes.map(athlete => (
            <option key={athlete.id} value={athlete.id}>
              {athlete.name}
            </option>
          ))}
        </select>
      </div>

      {selectedAthleteId && (
        <ProgressStats athleteId={selectedAthleteId} dateRange={dateRange} />
      )}
    </div>
  );
}