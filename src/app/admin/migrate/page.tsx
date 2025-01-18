'use client';

import { useState } from 'react';
import { migrateDataToAdmin } from '@/lib/migrations';
import { useAuth } from '@/context/AuthContext';

export default function MigratePage() {
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const { profile } = useAuth();

  if (!profile?.isAdmin) {
    return <div>Access Denied</div>;
  }

  const handleMigration = async () => {
    try {
      setError('');
      const result = await migrateDataToAdmin();
      setStatus(result);
    } catch (error: any) {
      setError(error.message);
      setStatus(error.status);
    }
  };

  return (
    <div className="min-h-screen bg-[#18191A] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#242526] rounded-xl p-6 shadow-lg">
          <h1 className="text-xl font-bold text-white mb-6">Data Migration</h1>

          <button
            onClick={handleMigration}
            className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
          >
            Start Migration
          </button>

          {status && (
            <div className="mt-6 space-y-2 text-white">
              <p>Exercises migrated: {status.exercises}</p>
              <p>Sequences migrated: {status.sequences}</p>
              <p>Workouts migrated: {status.workouts}</p>
              <p>Athletes migrated: {status.athletes}</p>
              <p>Assignments migrated: {status.assignments}</p>
              <p>Videos migrated: {status.videos}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 text-red-500 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}