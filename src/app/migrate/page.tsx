'use client';

import React, { useState } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';

export default function DataMigration() {
  const [status, setStatus] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const { user, profile } = useAuth();

  const migrateData = async () => {
    if (!user || !profile || profile.role !== 'coach') {
      setError('Unauthorized');
      return;
    }

    const stats = { exercises: 0, sequences: 0, workouts: 0, videos: 0, athletes: 0, assignments: 0 };
    
    try {
      // Migrate exercises
      const exercisesSnap = await getDocs(collection(db, 'exercises'));
      for (const exerciseDoc of exercisesSnap.docs) {
        await setDoc(
          doc(db, `coaches/${user.uid}/exercises/${exerciseDoc.id}`),
          { ...exerciseDoc.data(), coachId: user.uid }
        );
        stats.exercises++;
      }

      // Migrate sequences
      const sequencesSnap = await getDocs(collection(db, 'sequences'));
      for (const sequenceDoc of sequencesSnap.docs) {
        await setDoc(
          doc(db, `coaches/${user.uid}/sequences/${sequenceDoc.id}`),
          { ...sequenceDoc.data(), coachId: user.uid }
        );
        stats.sequences++;
      }

      // Migrate workouts
      const workoutsSnap = await getDocs(collection(db, 'workouts'));
      for (const workoutDoc of workoutsSnap.docs) {
        await setDoc(
          doc(db, `coaches/${user.uid}/workouts/${workoutDoc.id}`),
          { ...workoutDoc.data(), coachId: user.uid }
        );
        stats.workouts++;
      }

      // Migrate videos
      const videosSnap = await getDocs(collection(db, 'videos'));
      for (const videoDoc of videosSnap.docs) {
        await setDoc(
          doc(db, `coaches/${user.uid}/videos/${videoDoc.id}`),
          { ...videoDoc.data(), coachId: user.uid }
        );
        stats.videos++;
      }

      // Migrate athletes
      const athletesSnap = await getDocs(collection(db, 'athletes'));
      for (const athleteDoc of athletesSnap.docs) {
        await setDoc(
          doc(db, `coaches/${user.uid}/athletes/${athleteDoc.id}`),
          { ...athleteDoc.data(), coachId: user.uid }
        );
        stats.athletes++;
      }

      // Migrate assignments
      const assignmentsSnap = await getDocs(collection(db, 'scheduledWorkouts'));
      for (const assignmentDoc of assignmentsSnap.docs) {
        await setDoc(
          doc(db, `coaches/${user.uid}/assignments/${assignmentDoc.id}`),
          { ...assignmentDoc.data(), coachId: user.uid }
        );
        stats.assignments++;
      }

      setStatus(stats);
    } catch (err: any) {  // Add type annotation
        setError(err.message || 'An error occurred during migration');
      }
  };

  if (!user || !profile || profile.role !== 'coach') {
    return <div className="text-white">Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-[#18191A] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#242526] rounded-xl p-6 shadow-lg">
          <h1 className="text-xl font-bold text-white mb-6">Data Migration</h1>

          <button
            onClick={migrateData}
            className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
          >
            Start Migration
          </button>

          {Object.keys(status).length > 0 && (
            <div className="mt-6 space-y-2 text-white">
              <p>Exercises migrated: {status.exercises}</p>
              <p>Sequences migrated: {status.sequences}</p>
              <p>Workouts migrated: {status.workouts}</p>
              <p>Videos migrated: {status.videos}</p>
              <p>Athletes migrated: {status.athletes}</p>
              <p>Assignments migrated: {status.assignments}</p>
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