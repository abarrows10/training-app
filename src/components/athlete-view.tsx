"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useStore } from '@/store';
import WorkoutDetail from './workout-detail';
import VideoPlayer from './video-player';

interface Video {
  id: string;
  filename: string;
  url: string;
  thumbnail: string;
  uploadDate: string;
  status: 'complete' | 'uploading' | 'failed';
}

const AthleteView = () => {
  const { scheduledWorkouts, workouts, exercises, sequences, videos, athletes } = useStore();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

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

  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId);

  return (
    <div className="min-h-screen bg-[#18191A] p-3 md:p-8">
      <div className="flex flex-col gap-4">
        {!selectedAthleteId ? (
          <div className="flex flex-col items-center gap-8">
            <Link href="/" className="text-xl md:text-2xl font-bold text-white hover:text-[#00A3E0] transition-colors flex items-center gap-3">
              <Home className="w-6 h-6 md:w-7 md:h-7" />
              Blakely & Baylor's Training
            </Link>
            <select
              value={selectedAthleteId || ''}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="p-4 border border-[#3A3B3C] rounded-lg text-white text-lg font-semibold w-full max-w-[18rem] bg-[#242526] hover:border-[#00A3E0] transition-colors focus:outline-none focus:border-[#00A3E0]"
            >
              <option value="">Select Athlete</option>
              {athletes.map(athlete => (
                <option key={athlete.id} value={athlete.id} className="bg-[#242526]">
                  {athlete.name}
                </option>
              ))}
            </select>
            <div className="text-center py-8 text-gray-400">
              Please select an athlete to view workouts
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 md:mb-8">
              <Link href="/" className="text-xl md:text-2xl font-bold text-white hover:text-[#00A3E0] transition-colors flex items-center gap-3">
                <Home className="w-6 h-6 md:w-7 md:h-7" />
                Blakely & Baylor's Training
              </Link>
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                className="w-full max-w-[18rem] p-3 md:p-4 border border-[#3A3B3C] rounded-lg text-white text-base md:text-lg font-semibold bg-[#242526] hover:border-[#00A3E0] transition-colors focus:outline-none focus:border-[#00A3E0]"
              >
                {athletes.map(athlete => (
                  <option key={athlete.id} value={athlete.id} className="bg-[#242526]">
                    {athlete.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-[#242526] rounded-xl shadow-lg p-3 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
                Workouts for {selectedAthlete?.name}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-7 gap-2 md:gap-4">
                {weekDates.map((date) => {
                  const dateStr = formatDate(date);
                  const isToday = new Date().toDateString() === date.toDateString();
                  const dateWorkouts = getWorkoutsForDate(date);
                  
                  return (
                    <div key={dateStr} className="min-h-[180px] md:min-h-[200px]">
                      <div className={`p-2 md:p-3 text-center mb-2 md:mb-3 rounded-lg ${
                        isToday ? 'bg-[#00A3E0] text-white' : 'bg-[#3A3B3C] text-gray-300'
                      }`}>
                        <div className="font-semibold text-sm md:text-base">{dateStr}</div>
                      </div>
                      
                      <div className="space-y-2">
                        {dateWorkouts.map(scheduledWorkout => {
                          const workout = workouts.find(w => w.id === scheduledWorkout.workoutId);
                          if (!workout) return null;

                          return (
                            <div 
                              key={scheduledWorkout.id}
                              onClick={() => setSelectedWorkoutId(workout.id)}
                              className="p-2 md:p-3 border border-[#3A3B3C] rounded-lg bg-[#18191A] cursor-pointer hover:border-[#00A3E0] transition-colors group"
                            >
                              <div className="text-xs md:text-sm font-medium text-gray-300 group-hover:text-white transition-colors line-clamp-2">
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
          </>
        )}
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