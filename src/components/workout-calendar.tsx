"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

type Workout = {
  id: string;
  name: string;
  time: string;
  clientName: string;
}

type WorkoutSchedule = {
  [key: string]: Workout[];
}

const WorkoutCalendar = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  const getWeekDates = (date: Date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);
  
  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Sample workout data with proper typing
  const workouts: WorkoutSchedule = {
    'Mon Dec 23 2024': [
      { id: '1', name: 'Upper Body Strength', time: '09:00 AM', clientName: 'John Doe' },
      { id: '2', name: 'Core Basics', time: '02:00 PM', clientName: 'Jane Smith' }
    ],
    'Wed Dec 25 2024': [
      { id: '3', name: 'Lower Body Focus', time: '10:30 AM', clientName: 'Mike Johnson' }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Weekly Schedule</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => navigateWeek(-1)}
              className="p-2 border rounded hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigateWeek(1)}
              className="p-2 border rounded hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date) => {
            const dateKey = formatDate(date);
            const isToday = new Date().toDateString() === date.toDateString();
            const dayWorkouts = workouts[dateKey] || [];
            
            return (
              <div key={dateKey} className="min-h-[300px]">
                <div className={`p-2 text-center mb-2 rounded-lg ${
                  isToday ? 'bg-blue-100' : 'bg-gray-50'
                }`}>
                  <div className="font-semibold text-black">{dateKey}</div>
                </div>
                
                <div className="space-y-2">
                  {dayWorkouts.map(workout => (
                    <div 
                      key={workout.id}
                      className="p-3 border rounded-lg bg-white shadow-sm"
                    >
                      <div className="text-sm font-medium text-black">{workout.name}</div>
                      <div className="text-xs text-black">{workout.time}</div>
                      <div className="text-xs text-black">{workout.clientName}</div>
                    </div>
                  ))}
                  
                  <button className="w-full p-2 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 flex items-center justify-center text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Workout
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;