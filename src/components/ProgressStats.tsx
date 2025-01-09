"use client";

import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useStore } from '@/store';

interface ProgressStatsProps {
  athleteId: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ athleteId, dateRange }) => {
  const { getAthleteStats, sequences } = useStore();
  const stats = getAthleteStats(athleteId, dateRange);

  const completionData = stats.completionDates.map(date => ({
    date,
    completed: 1,
  }));

  const exerciseCategoryData = Object.entries(stats.exercisesByCategory).map(([category, count]) => ({
    category,
    count
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-[#242526] p-4 rounded-lg border border-[#3A3B3C]">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Total Workouts</h3>
          <p className="text-2xl font-bold text-white">{stats.totalWorkouts}</p>
        </div>
        <div className="bg-[#242526] p-4 rounded-lg border border-[#3A3B3C]">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Total Exercises</h3>
          <p className="text-2xl font-bold text-white">{stats.totalExercises}</p>
        </div>
        <div className="bg-[#242526] p-4 rounded-lg border border-[#3A3B3C]">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Total Sets</h3>
          <p className="text-2xl font-bold text-white">{stats.totalSets}</p>
        </div>
        <div className="bg-[#242526] p-4 rounded-lg border border-[#3A3B3C]">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Total Reps</h3>
          <p className="text-2xl font-bold text-white">{stats.totalReps}</p>
        </div>
        <div className="bg-[#242526] p-4 rounded-lg border border-[#3A3B3C]">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Total Sequences</h3>
          <p className="text-2xl font-bold text-white">{sequences.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Timeline */}
        <div className="bg-[#242526] p-4 rounded-lg border border-[#3A3B3C]">
          <h3 className="text-lg font-semibold text-white mb-4">Workout Completion Timeline</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3B3C" />
                <XAxis 
                  dataKey="date" 
                  stroke="#gray-400"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis 
                  stroke="#gray-400"
                  tick={{ fill: '#9CA3AF' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#242526',
                    borderColor: '#3A3B3C',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#00A3E0" 
                  strokeWidth={2}
                  dot={{ fill: '#00A3E0' }}
                  name="Workouts Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-[#242526] p-4 rounded-lg border border-[#3A3B3C]">
          <h3 className="text-lg font-semibold text-white mb-4">Exercise Categories</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exerciseCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3B3C" />
                <XAxis 
                  dataKey="category" 
                  stroke="#gray-400"
                  tick={{ fill: '#9CA3AF' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#gray-400"
                  tick={{ fill: '#9CA3AF' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#242526',
                    borderColor: '#3A3B3C',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  fill="#00A3E0" 
                  name="Number of Exercises"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressStats;