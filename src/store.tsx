"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db } from '@/firebase/config';

interface Exercise {
  id: number;
  name: string;
  category: string;
  description: string;
  videoIds: number[];
}

interface DrillSequence {
  id: number;
  name: string;
  drills: {
    id: number;
    exerciseId: number;
    sets?: number;
    reps?: number;
  }[];
}

interface Workout {
  id: number;
  name: string;
  items: {
    id: number;
    type: 'sequence' | 'drill';
    itemId: number;
    sets?: number;
    reps?: number;
  }[];
}

interface ScheduledWorkout {
  id: number;
  workoutId: number;
  date: string;
  athleteId: number;
}

interface Athlete {
  id: number;
  name: string;
  position: string;
  notes: string;
}

interface Video {
  id: number;
  filename: string;
  url: string;
  thumbnail: string;
  uploadDate: string;
  status: 'complete' | 'uploading' | 'failed';
}

interface ExerciseProgress {
  exerciseId: number;
  athleteId: number;
  workoutId: number;
  scheduledWorkoutId: number;
  date: string;
  timestamp: string;
  completed: boolean;
  category: string;
  setsCompleted: number;
  repsCompleted: number;
  targetSets?: number;
  targetReps?: number;
}

interface StoreContextType {
  athletes: Athlete[];
  addAthlete: (athlete: Omit<Athlete, 'id'>) => Promise<void>;
  updateAthlete: (id: number, athlete: Omit<Athlete, 'id'>) => Promise<void>;
  removeAthlete: (id: number) => Promise<void>;
  
  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, 'id'>) => Promise<void>;
  updateExercise: (id: number, exercise: Omit<Exercise, 'id'>) => Promise<void>;
  removeExercise: (id: number) => Promise<void>;
  
  sequences: DrillSequence[];
  addSequence: (sequence: Omit<DrillSequence, 'id'>) => Promise<void>;
  removeSequence: (id: number) => Promise<void>;
  
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id'>) => Promise<void>;
  updateWorkout: (id: number, workout: Omit<Workout, 'id'>) => Promise<void>;
  removeWorkout: (id: number) => Promise<void>;
  
  scheduledWorkouts: ScheduledWorkout[];
  scheduleWorkout: (workout: Omit<ScheduledWorkout, 'id'>) => Promise<void>;
  removeScheduledWorkout: (id: number) => Promise<void>;

  videos: Video[];
  addVideo: (video: Omit<Video, 'id'>) => Promise<number>;
  updateVideoStatus: (id: number, status: Video['status']) => Promise<void>;
  removeVideo: (id: number) => Promise<void>;
  linkVideoToExercise: (videoId: number, exerciseId: number) => Promise<void>;
  unlinkVideoFromExercise: (videoId: number, exerciseId: number) => Promise<void>;
  
  progress: ExerciseProgress[];
  updateProgress: (progress: Partial<ExerciseProgress>) => Promise<void>;
  getProgress: (exerciseId: number, scheduledWorkoutId: number) => ExerciseProgress | undefined;
  getAthleteStats: (athleteId: number, dateRange?: { start: string; end: string }) => {
    totalWorkouts: number;
    totalExercises: number;
    totalSets: number;
    totalReps: number;
    exercisesByCategory: Record<string, number>;
    completionDates: string[];
  };
}

const StoreContext = createContext<StoreContextType | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
    // State declarations with proper typing
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [sequences, setSequences] = useState<DrillSequence[]>([]);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [progress, setProgress] = useState<ExerciseProgress[]>([]);
  
    // Firestore Listeners
    useEffect(() => {
      console.log('Setting up Firestore listeners');
  
      // Exercises listener
      const unsubExercises = onSnapshot(
        collection(db, 'exercises'),
        (snapshot) => {
          console.log('Received exercises update');
          const exerciseData = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: Number(doc.id)
          })) as Exercise[];
          setExercises(exerciseData);
        },
        (error) => console.error('Exercises listener error:', error)
      );
  
      // Athletes listener
      const unsubAthletes = onSnapshot(
        collection(db, 'athletes'),
        (snapshot) => {
          const athleteData = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: Number(doc.id)
          })) as Athlete[];
          setAthletes(athleteData);
        }
      );
  
      // Sequences listener
      const unsubSequences = onSnapshot(
        collection(db, 'sequences'),
        (snapshot) => {
          const sequenceData = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: Number(doc.id)
          })) as DrillSequence[];
          setSequences(sequenceData);
        }
      );
  
      // Workouts listener
      const unsubWorkouts = onSnapshot(
        collection(db, 'workouts'),
        (snapshot) => {
          const workoutData = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: Number(doc.id)
          })) as Workout[];
          setWorkouts(workoutData);
        }
      );
  
      // Scheduled Workouts listener
      const unsubScheduled = onSnapshot(
        collection(db, 'scheduledWorkouts'),
        (snapshot) => {
          const scheduledData = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: Number(doc.id)
          })) as ScheduledWorkout[];
          setScheduledWorkouts(scheduledData);
        }
      );
  
      // Videos listener
      const unsubVideos = onSnapshot(
        collection(db, 'videos'),
        (snapshot) => {
          const videoData = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: Number(doc.id)
          })) as Video[];
          setVideos(videoData);
        }
      );
  
      // Progress listener
      const unsubProgress = onSnapshot(
        collection(db, 'progress'),
        (snapshot) => {
          const progressData = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: Number(doc.id)
        })) as unknown as ExerciseProgress[];
          setProgress(progressData);
        }
      );
  
      // Cleanup function
      return () => {
        unsubExercises();
        unsubAthletes();
        unsubSequences();
        unsubWorkouts();
        unsubScheduled();
        unsubVideos();
        unsubProgress();
      };
    }, []); // Empty dependency array means this runs once on mount
    // Exercise functions
  const addExercise = async (exercise: Omit<Exercise, 'id'>) => {
    try {
      console.log('Adding exercise:', exercise);
      const docRef = await addDoc(collection(db, 'exercises'), {
        ...exercise,
        videoIds: exercise.videoIds || []
      });
      console.log('Exercise added with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw error;
    }
  };

  const updateExercise = async (id: number, exercise: Omit<Exercise, 'id'>) => {
    try {
      await updateDoc(doc(db, 'exercises', id.toString()), {
        ...exercise,
        videoIds: exercise.videoIds || []
      });
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  };

  const removeExercise = async (id: number) => {
    try {
      await deleteDoc(doc(db, 'exercises', id.toString()));
    } catch (error) {
      console.error('Error removing exercise:', error);
      throw error;
    }
  };

  // Athlete functions
  const addAthlete = async (athlete: Omit<Athlete, 'id'>) => {
    try {
      await addDoc(collection(db, 'athletes'), athlete);
    } catch (error) {
      console.error('Error adding athlete:', error);
      throw error;
    }
  };

  const updateAthlete = async (id: number, athlete: Omit<Athlete, 'id'>) => {
    try {
      await updateDoc(doc(db, 'athletes', id.toString()), athlete);
    } catch (error) {
      console.error('Error updating athlete:', error);
      throw error;
    }
  };

  const removeAthlete = async (id: number) => {
    try {
      await deleteDoc(doc(db, 'athletes', id.toString()));
    } catch (error) {
      console.error('Error removing athlete:', error);
      throw error;
    }
  };

  // Sequence functions
  const addSequence = async (sequence: Omit<DrillSequence, 'id'>) => {
    try {
      await addDoc(collection(db, 'sequences'), sequence);
    } catch (error) {
      console.error('Error adding sequence:', error);
      throw error;
    }
  };

  const removeSequence = async (id: number) => {
    try {
      await deleteDoc(doc(db, 'sequences', id.toString()));
    } catch (error) {
      console.error('Error removing sequence:', error);
      throw error;
    }
  };

  // Workout functions
  const addWorkout = async (workout: Omit<Workout, 'id'>) => {
    try {
      await addDoc(collection(db, 'workouts'), workout);
    } catch (error) {
      console.error('Error adding workout:', error);
      throw error;
    }
  };

  const updateWorkout = async (id: number, workout: Omit<Workout, 'id'>) => {
    try {
      await updateDoc(doc(db, 'workouts', id.toString()), workout);
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
  };

  const removeWorkout = async (id: number) => {
    try {
      await deleteDoc(doc(db, 'workouts', id.toString()));
      // Also remove any scheduled instances of this workout
      const scheduledToRemove = scheduledWorkouts.filter(sw => sw.workoutId === id);
      for (const sw of scheduledToRemove) {
        await removeScheduledWorkout(sw.id);
      }
    } catch (error) {
      console.error('Error removing workout:', error);
      throw error;
    }
  };

  // Scheduled Workout functions
  const scheduleWorkout = async (workout: Omit<ScheduledWorkout, 'id'>) => {
    try {
      await addDoc(collection(db, 'scheduledWorkouts'), workout);
    } catch (error) {
      console.error('Error scheduling workout:', error);
      throw error;
    }
  };

  const removeScheduledWorkout = async (id: number) => {
    try {
      await deleteDoc(doc(db, 'scheduledWorkouts', id.toString()));
    } catch (error) {
      console.error('Error removing scheduled workout:', error);
      throw error;
    }
  };

  // Video functions
  const addVideo = async (video: Omit<Video, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'videos'), video);
      return Number(docRef.id);
    } catch (error) {
      console.error('Error adding video:', error);
      throw error;
    }
  };

  const updateVideoStatus = async (id: number, status: Video['status']) => {
    try {
      await updateDoc(doc(db, 'videos', id.toString()), { status });
    } catch (error) {
      console.error('Error updating video status:', error);
      throw error;
    }
  };

  const removeVideo = async (id: number) => {
    try {
      await deleteDoc(doc(db, 'videos', id.toString()));
      // Update exercises that reference this video
      const exercisesWithVideo = exercises.filter(e => e.videoIds.includes(id));
      for (const exercise of exercisesWithVideo) {
        const updatedVideoIds = exercise.videoIds.filter(vid => vid !== id);
        await updateExercise(exercise.id, { ...exercise, videoIds: updatedVideoIds });
      }
    } catch (error) {
      console.error('Error removing video:', error);
      throw error;
    }
  };

  const linkVideoToExercise = async (videoId: number, exerciseId: number) => {
    try {
      const exercise = exercises.find(e => e.id === exerciseId);
      if (exercise) {
        const updatedVideoIds = [...new Set([...(exercise.videoIds || []), videoId])];
        await updateExercise(exerciseId, { ...exercise, videoIds: updatedVideoIds });
      }
    } catch (error) {
      console.error('Error linking video:', error);
      throw error;
    }
  };

  const unlinkVideoFromExercise = async (videoId: number, exerciseId: number) => {
    try {
      const exercise = exercises.find(e => e.id === exerciseId);
      if (exercise) {
        const updatedVideoIds = exercise.videoIds.filter(id => id !== videoId);
        await updateExercise(exerciseId, { ...exercise, videoIds: updatedVideoIds });
      }
    } catch (error) {
      console.error('Error unlinking video:', error);
      throw error;
    }
  };
  // Progress tracking functions
  const updateProgress = async (newProgress: Partial<ExerciseProgress>) => {
    try {
      const exercise = exercises.find(e => e.id === newProgress.exerciseId);
      const workout = workouts.find(w => w.id === newProgress.workoutId);
      let workoutItem;

      if (workout) {
        workoutItem = workout.items.find(item => {
          if (item.type === 'drill') {
            return item.itemId === newProgress.exerciseId;
          } else if (item.type === 'sequence') {
            const sequence = sequences.find(s => s.id === item.itemId);
            return sequence?.drills.some(d => d.exerciseId === newProgress.exerciseId);
          }
          return false;
        });
      }

      const completeProgress: ExerciseProgress = {
        exerciseId: newProgress.exerciseId!,
        athleteId: newProgress.athleteId!,
        workoutId: newProgress.workoutId!,
        scheduledWorkoutId: newProgress.scheduledWorkoutId!,
        date: newProgress.date || new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        completed: newProgress.completed || false,
        category: exercise?.category || 'unknown',
        setsCompleted: newProgress.setsCompleted || 0,
        repsCompleted: newProgress.repsCompleted || 0,
        targetSets: workoutItem?.sets,
        targetReps: workoutItem?.reps
      };

      const progressId = `${completeProgress.exerciseId}_${completeProgress.scheduledWorkoutId}`;
      await setDoc(doc(db, 'progress', progressId), completeProgress);
      console.log('Progress updated:', completeProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  const getProgress = (exerciseId: number, scheduledWorkoutId: number): ExerciseProgress | undefined => {
    return progress.find(p => 
      p.exerciseId === exerciseId && 
      p.scheduledWorkoutId === scheduledWorkoutId
    );
  };

  const getAthleteStats = (athleteId: number, dateRange?: { start: string; end: string }) => {
    const athleteProgress = progress.filter(p => {
      const progressDate = new Date(p.date);
      if (dateRange) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return p.athleteId === athleteId && 
               progressDate >= startDate && 
               progressDate <= endDate;
      }
      return p.athleteId === athleteId;
    });

    return {
      totalWorkouts: new Set(athleteProgress.map(p => p.workoutId)).size,
      totalExercises: athleteProgress.filter(p => p.completed).length,
      totalSets: athleteProgress.reduce((sum, p) => sum + (p.setsCompleted || 0), 0),
      totalReps: athleteProgress.reduce((sum, p) => sum + (p.repsCompleted || 0), 0),
      exercisesByCategory: athleteProgress.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      completionDates: [...new Set(athleteProgress
        .filter(p => p.completed)
        .map(p => p.date))]
    };
  };

  return (
    <StoreContext.Provider value={{
      athletes,
      addAthlete,
      updateAthlete,
      removeAthlete,
      exercises,
      addExercise,
      updateExercise,
      removeExercise,
      sequences,
      addSequence,
      removeSequence,
      workouts,
      addWorkout,
      updateWorkout,
      removeWorkout,
      scheduledWorkouts,
      scheduleWorkout,
      removeScheduledWorkout,
      videos,
      addVideo,
      updateVideoStatus,
      removeVideo,
      linkVideoToExercise,
      unlinkVideoFromExercise,
      progress,
      updateProgress,
      getProgress,
      getAthleteStats,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}