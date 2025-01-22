'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash } from 'lucide-react';
import { useStore } from '@/store';
import { useAuth } from '@/context/AuthContext';

const WorkoutAssignment = () => {
  const { user } = useAuth();
  const { athletes, workouts, scheduledWorkouts, scheduleWorkout, removeScheduledWorkout } = useStore();
  const [selectedAthlete, setSelectedAthlete] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    athleteId: '',
    workoutId: '',
    date: '',
    coachId: user?.uid || ''
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

  const getWorkoutName = (workoutId: string) => {
    const workout = workouts.find(w => w.id === workoutId);
    return workout ? workout.name : 'Workout Deleted';
  };

  const getAthleteName = (athleteId: string) => {
    const athlete = athletes.find(a => a.id === athleteId);
    return athlete ? athlete.name : 'Athlete Removed';
  };

  const getAssignmentsForDate = (date: Date) => {
    const dateStr = formatDateValue(date);
    return scheduledWorkouts.filter(workout => {
      const workoutExists = workouts.some(w => w.id === workout.workoutId);
      const athleteExists = athletes.some(a => a.id === workout.athleteId);
      const matchesDate = workout.date === dateStr;
      const matchesAthlete = selectedAthlete === '' || workout.athleteId === selectedAthlete;
      return workoutExists && athleteExists && matchesDate && matchesAthlete;
    });
  };

  const handleAssignWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    const selectedDate = newAssignment.date;
    await scheduleWorkout({
      ...newAssignment,
      coachId: user.uid
    });

    setNewAssignment({
      athleteId: '',
      workoutId: '',
      date: selectedDate,
      coachId: user.uid
    });
    setShowAssignForm(false);
  };

  return (
    <div className="mx-auto max-w-full">
      <div className="bg-[#242526] rounded-xl shadow-lg p-3 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="w-full md:w-auto">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Workout Assignments</h2>
            <select
              value={selectedAthlete}
              onChange={(e) => setSelectedAthlete(e.target.value)}
              className="w-full p-2 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
            >
              <option value="">All Athletes</option>
              {athletes.map(athlete => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="flex gap-2 justify-center md:justify-start">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 border border-[#3A3B3C] rounded-lg hover:bg-[#3A3B3C] text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 border border-[#3A3B3C] rounded-lg hover:bg-[#3A3B3C] text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => setShowAssignForm(true)}
              className="w-full md:w-auto bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] flex items-center justify-center transition-colors"
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
                  <label className="block text-white mb-1 font-medium">Select Athlete</label>
                  <select
                    value={newAssignment.athleteId}
                    onChange={(e) => setNewAssignment({...newAssignment, athleteId: e.target.value})}
                    className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Choose an athlete...</option>
                    {athletes.map(athlete => (
                      <option key={athlete.id} value={athlete.id}>
                        {athlete.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-1 font-medium">Select Workout</label>
                  <select
                    value={newAssignment.workoutId}
                    onChange={(e) => setNewAssignment({...newAssignment, workoutId: e.target.value})}
                    className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Choose a workout...</option>
                    {workouts.map(workout => (
                      <option key={workout.id} value={workout.id}>
                        {workout.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-1 font-medium">Select Date</label>
                  <input
                    type="date"
                    value={newAssignment.date}
                    onChange={(e) => setNewAssignment({...newAssignment, date: e.target.value})}
                    className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignForm(false)}
                  className="w-full md:w-auto px-4 py-2 border border-[#3A3B3C] rounded-lg hover:bg-[#3A3B3C] text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
                  disabled={!newAssignment.athleteId || !newAssignment.workoutId || !newAssignment.date}
                >
                  Assign Workout
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 md:gap-4">
          {weekDates.map((date) => {
            const dateStr = formatDate(date);
            const isToday = new Date().toDateString() === date.toDateString();
            const assignments = getAssignmentsForDate(date);
            
            return (
              <div key={dateStr} className="min-h-[180px] md:min-h-[200px]">
                <div className={`p-2 md:p-3 text-center mb-2 md:mb-3 rounded-lg ${
                  isToday ? 'bg-[#00A3E0] text-white' : 'bg-[#3A3B3C] text-gray-300'
                }`}>
                  <div className="font-semibold text-sm md:text-base">{dateStr}</div>
                </div>
                
                <div className="space-y-2">
                  {assignments.map(assignment => (
                    <div 
                      key={assignment.id}
                      className="p-2 md:p-3 border border-[#3A3B3C] rounded-lg bg-[#18191A] group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs md:text-sm font-medium text-white truncate">
                            {getAthleteName(assignment.athleteId)}
                          </div>
                          <div className="text-xs text-gray-300 truncate">
                            {getWorkoutName(assignment.workoutId)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeScheduledWorkout(assignment.id)}
                          className="text-red-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-1"
                        >
                          <Trash className="w-3 h-3 md:w-4 md:h-4" />
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