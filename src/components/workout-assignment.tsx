"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash } from 'lucide-react';
import { useStore } from '@/store';

const WorkoutAssignment = () => {
  const { athletes, workouts, scheduledWorkouts, scheduleWorkout, removeScheduledWorkout } = useStore();
  const [selectedAthlete, setSelectedAthlete] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    athleteId: 0,
    workoutId: 0,
    date: '',
  });

  const getWeekDates = (date: Date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

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

  const getWorkoutName = (workoutId: number) => {
    const workout = workouts.find(w => w.id === workoutId);
    return workout ? workout.name : 'Workout Deleted';
  };

  const getAthleteName = (athleteId: number) => {
    const athlete = athletes.find(a => a.id === athleteId);
    return athlete ? athlete.name : 'Athlete Removed';
  };

  const getAssignmentsForDate = (date: Date) => {
    const dateStr = formatDateValue(date);
    return scheduledWorkouts.filter(workout => {
      const workoutExists = workouts.some(w => w.id === workout.workoutId);
      const athleteExists = athletes.some(a => a.id === workout.athleteId);
      const matchesDate = workout.date === dateStr;
      const matchesAthlete = selectedAthlete === 0 || workout.athleteId === selectedAthlete;
      return workoutExists && athleteExists && matchesDate && matchesAthlete;
    });
  };

  const handleAssignWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDate = newAssignment.date;
    scheduleWorkout(newAssignment);
    setNewAssignment({
      athleteId: 0,
      workoutId: 0,
      date: selectedDate,
    });
    setShowAssignForm(false);
  };

  return (
    <div>
      <div className="bg-[#242526] rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Workout Assignments</h2>
            <select
              value={selectedAthlete}
              onChange={(e) => setSelectedAthlete(Number(e.target.value))}
              className="p-2 bg-[#18191A] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
            >
              <option value={0} className="bg-[#18191A]">All Athletes</option>
              {athletes.map(athlete => (
                <option key={athlete.id} value={athlete.id} className="bg-[#18191A]">
                  {athlete.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 border border-[#3A3B3C] rounded hover:bg-[#3A3B3C] text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 border border-[#3A3B3C] rounded hover:bg-[#3A3B3C] text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowAssignForm(true)}
              className="bg-[#00A3E0] text-white px-4 py-2 rounded hover:bg-[#0077A3] flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Assign Workout
            </button>
          </div>
        </div>

        {showAssignForm && (
          <div className="mb-6 p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]">
            <form onSubmit={handleAssignWorkout}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Select Athlete</label>
                  <select
                    value={newAssignment.athleteId}
                    onChange={(e) => setNewAssignment({...newAssignment, athleteId: Number(e.target.value)})}
                    className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                    required
                  >
                    <option value="" className="bg-[#242526]">Choose an athlete...</option>
                    {athletes.map(athlete => (
                      <option key={athlete.id} value={athlete.id} className="bg-[#242526]">
                        {athlete.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Select Workout</label>
                  <select
                    value={newAssignment.workoutId}
                    onChange={(e) => setNewAssignment({...newAssignment, workoutId: Number(e.target.value)})}
                    className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                    required
                  >
                    <option value="" className="bg-[#242526]">Choose a workout...</option>
                    {workouts.map(workout => (
                      <option key={workout.id} value={workout.id} className="bg-[#242526]">
                        {workout.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Select Date</label>
                  <input
                    type="date"
                    value={newAssignment.date}
                    onChange={(e) => setNewAssignment({...newAssignment, date: e.target.value})}
                    className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignForm(false)}
                  className="px-4 py-2 border border-[#3A3B3C] rounded hover:bg-[#3A3B3C] text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00A3E0] text-white rounded hover:bg-[#0077A3] transition-colors"
                  disabled={!newAssignment.athleteId || !newAssignment.workoutId || !newAssignment.date}
                >
                  Assign Workout
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date) => {
            const dateStr = formatDate(date);
            const isToday = new Date().toDateString() === date.toDateString();
            const assignments = getAssignmentsForDate(date);
            
            return (
              <div key={dateStr} className="min-h-[200px]">
                <div className={`p-2 text-center mb-2 rounded-lg ${
                  isToday ? 'bg-[#00A3E0] text-white' : 'bg-[#18191A] text-gray-300'
                }`}>
                  <div className="font-semibold">{dateStr}</div>
                </div>
                
                <div className="space-y-2">
                  {assignments.map(assignment => (
                    <div 
                      key={assignment.id}
                      className="p-2 border border-[#3A3B3C] rounded-lg bg-[#18191A] hover:border-[#00A3E0] transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {getAthleteName(assignment.athleteId)}
                          </div>
                          <div className="text-xs text-gray-300">
                            {getWorkoutName(assignment.workoutId)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeScheduledWorkout(assignment.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkoutAssignment;