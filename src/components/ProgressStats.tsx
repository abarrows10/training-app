"use client";

import React from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import { useStore } from '@/store';

interface ProgressStatsProps {
  athleteId: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ athleteId, dateRange }) => {
  const { getAthleteStats } = useStore();
  const stats = getAthleteStats(athleteId, dateRange);

  const completionData = stats.completionDates.map(date => ({
    date,
    exercises: 1
  }));

  const exerciseCategoryData = Object.entries(stats.exercisesByCategory).map(([category, count]) => ({
    category,
    count
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-black mb-2">Total Workouts</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalWorkouts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-black mb-2">Total Exercises</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalExercises}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-black mb-2">Total Sets</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalSets}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-black mb-2">Total Reps</h3>
          <p className="text-3xl font-bold text-red-600">{stats.totalReps}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-black mb-4">Exercise Completion Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="exercises" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-black mb-4">Exercises by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={exerciseCategoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressStats;