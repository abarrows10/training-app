"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';

interface ProgressStatsProps {
  athleteId: number;
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ athleteId }) => {
  const { getAthleteStats, athletes } = useStore();
  const [dateRange, setDateRange] = useState<{start: string; end: string}>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30); // Default to last 30 days
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  });

  const stats = getAthleteStats(athleteId, dateRange);
  const athlete = athletes.find(a => a.id === athleteId);

  const adjustDateRange = (days: number) => {
    const newEnd = new Date();
    const newStart = new Date();
    newStart.setDate(newEnd.getDate() - days);
    setDateRange({
      start: newStart.toISOString().split('T')[0],
      end: newEnd.toISOString().split('T')[0]
    });
  };

  const getDaysDifference = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalVolume = stats.totalSets * stats.totalReps;
  const activeDays = stats.completionDates.length;

  return (
    <div className="bg-[#242526] rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Training Stats - {athlete?.name}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => adjustDateRange(7)}
            className={`px-4 py-2 rounded transition-colors ${
              getDaysDifference(dateRange.start, dateRange.end) === 7
                ? 'bg-[#00A3E0] text-white'
                : 'border border-[#3A3B3C] text-gray-300 hover:bg-[#3A3B3C]'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => adjustDateRange(30)}
            className={`px-4 py-2 rounded transition-colors ${
              getDaysDifference(dateRange.start, dateRange.end) === 30
                ? 'bg-[#00A3E0] text-white'
                : 'border border-[#3A3B3C] text-gray-300 hover:bg-[#3A3B3C]'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => adjustDateRange(90)}
            className={`px-4 py-2 rounded transition-colors ${
              getDaysDifference(dateRange.start, dateRange.end) === 90
                ? 'bg-[#00A3E0] text-white'
                : 'border border-[#3A3B3C] text-gray-300 hover:bg-[#3A3B3C]'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]">
          <div className="text-sm text-gray-400 mb-1">Workouts Completed</div>
          <div className="text-2xl font-bold text-white">{stats.totalWorkouts}</div>
        </div>

        <div className="p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]">
          <div className="text-sm text-gray-400 mb-1">Active Days</div>
          <div className="text-2xl font-bold text-white">{activeDays}</div>
        </div>

        <div className="p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]">
          <div className="text-sm text-gray-400 mb-1">Total Exercises</div>
          <div className="text-2xl font-bold text-white">{stats.totalExercises}</div>
        </div>

        <div className="p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]">
          <div className="text-sm text-gray-400 mb-1">Total Volume</div>
          <div className="text-2xl font-bold text-white">{totalVolume}</div>
          <div className="text-xs text-gray-400">
            {stats.totalSets} sets × {stats.totalReps} reps
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(stats.exercisesByCategory).map(([category, count]) => (
          <div key={category} className="p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]">
            <div className="text-lg font-semibold text-white mb-1">{category}</div>
            <div className="text-3xl font-bold text-[#00A3E0]">{count}</div>
            <div className="text-sm text-gray-400">Exercises Completed</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressStats;