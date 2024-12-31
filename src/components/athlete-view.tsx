"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useStore } from '@/store';
import WorkoutDetail from './workout-detail';
import VideoPlayer from './video-player';

interface Video {
  id: number;
  filename: string;
  url: string;
  thumbnail: string;
  uploadDate: string;
  status: 'complete' | 'uploading' | 'failed';
}

const AthleteView = () => {
  const { scheduledWorkouts, workouts, exercises, sequences, videos, athletes } = useStore();
  const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(null);

  const getNextSevenDays = () => {
    const week = [];
    const start = new Date();
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getNextSevenDays();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatDateValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWorkoutsForDate = (date: Date) => {
    const dateStr = formatDateValue(date);
    return scheduledWorkouts.filter(workout => 
      workout.date === dateStr && 
      workout.athleteId === selectedAthleteId
    );
  };

  if (!selectedAthleteId) {
    return (
      <div className="min-h-screen bg-[#18191A] p-8">
        <div className="flex flex-col items-center gap-8">
          <Link href="/" className="text-2xl font-bold text-white hover:text-[#00A3E0] transition-colors flex items-center gap-3">
            <Home className="w-7 h-7" />
            Blakely & Baylor's Training
          </Link>
          <select
            value={selectedAthleteId || ''}
            onChange={(e) => setSelectedAthleteId(Number(e.target.value))}
            className="p-4 border border-[#3A3B3C] rounded-lg text-white text-lg font-semibold w-72 bg-[#242526] hover:border-[#00A3E0] transition-colors focus:outline-none focus:border-[#00A3E0]"
          >
            <option value="">Select Athlete</option>
            {athletes.map(athlete => (
              <option key={athlete.id} value={athlete.id} className="bg-[#242526]">
                {athlete.name}
              </option>
            ))}
          </select>
        </div>
        <div className="text-center py-8 text-gray-400">
          Please select an athlete to view workouts
        </div>
      </div>
    );
  }

  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId);

  return (
    <div className="min-h-screen bg-[#18191A] p-8">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="text-2xl font-bold text-white hover:text-[#00A3E0] transition-colors flex items-center gap-3">
          <Home className="w-7 h-7" />
          Blakely & Baylor's Training
        </Link>
        <div className="flex-1 flex justify-center">
          <select
            value={selectedAthleteId}
            onChange={(e) => setSelectedAthleteId(Number(e.target.value))}
            className="p-4 border border-[#3A3B3C] rounded-lg text-white text-lg font-semibold w-72 bg-[#242526] hover:border-[#00A3E0] transition-colors focus:outline-none focus:border-[#00A3E0]"
          >
            {athletes.map(athlete => (
              <option key={athlete.id} value={athlete.id} className="bg-[#242526]">
                {athlete.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[#242526] rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          Workouts for {selectedAthlete?.name}
        </h2>

        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date) => {
            const dateStr = formatDate(date);
            const isToday = new Date().toDateString() === date.toDateString();
            const dateWorkouts = getWorkoutsForDate(date);
            
            return (
              <div key={dateStr} className="min-h-[200px]">
                <div className={`p-3 text-center mb-3 rounded-lg ${
                  isToday ? 'bg-[#00A3E0] text-white' : 'bg-[#3A3B3C] text-gray-300'
                }`}>
                  <div className="font-semibold">{dateStr}</div>
                </div>
                
                <div className="space-y-2">
                  {dateWorkouts.map(scheduledWorkout => {
                    const workout = workouts.find(w => w.id === scheduledWorkout.workoutId);
                    if (!workout) return null;

                    return (
                      <div 
                        key={scheduledWorkout.id}
                        onClick={() => setSelectedWorkoutId(workout.id)}
                        className="p-3 border border-[#3A3B3C] rounded-lg bg-[#18191A] cursor-pointer hover:border-[#00A3E0] transition-colors group"
                      >
                        <div className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                          {workout.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedWorkoutId && (
        <WorkoutDetail 
          workoutId={selectedWorkoutId} 
          onClose={() => setSelectedWorkoutId(null)} 
        />
      )}
    </div>
  );
};

export default AthleteView;