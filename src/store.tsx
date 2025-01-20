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
  setDoc,
  where
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { 
  Exercise, 
  DrillSequence, 
  Workout, 
  ExerciseProgress,
  Video,
  Athlete,
  ScheduledWorkout,
  WorkoutItem
} from '@/types/interfaces';

interface StoreContextType {
  athletes: Athlete[];
  addAthlete: (athlete: Omit<Athlete, 'id'>) => Promise<void>;
  updateAthlete: (id: string, athlete: Omit<Athlete, 'id'>) => Promise<void>;
  removeAthlete: (id: string) => Promise<void>;
  
  exercises: Exercise[];
  setExercises: (exercises: Exercise[]) => void;
  addExercise: (exercise: Omit<Exercise, 'id' | 'docId'>) => Promise<void>;
  updateExercise: (id: string, exercise: Omit<Exercise, 'id' | 'docId'>) => Promise<void>;
  removeExercise: (id: string) => Promise<void>;
  
  sequences: DrillSequence[];
  addSequence: (sequence: Omit<DrillSequence, 'id'>) => Promise<void>;
  removeSequence: (id: string) => Promise<void>;
  
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id'>) => Promise<void>;
  updateWorkout: (id: string, workout: Omit<Workout, 'id'>) => Promise<void>;
  removeWorkout: (id: string) => Promise<void>;
  
  scheduledWorkouts: ScheduledWorkout[];
  scheduleWorkout: (workout: Omit<ScheduledWorkout, 'id'>) => Promise<void>;
  removeScheduledWorkout: (id: string) => Promise<void>;

  videos: Video[];
  addVideo: (video: Omit<Video, 'id'>) => Promise<string>;
  updateVideoStatus: (id: string, status: Video['status']) => Promise<void>;
  removeVideo: (id: string) => Promise<void>;
  linkVideoToExercise: (videoId: string, exerciseId: string) => Promise<void>;
  unlinkVideoFromExercise: (videoId: string, exerciseId: string) => Promise<void>;
  
  progress: ExerciseProgress[];
  updateProgress: (progress: Partial<ExerciseProgress>) => Promise<void>;
  getProgress: (exerciseId: string, scheduledWorkoutId: string) => ExerciseProgress | undefined;
  getAthleteStats: (athleteId: string, dateRange?: { start: string; end: string }) => {
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
  const { user, profile } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sequences, setSequences] = useState<DrillSequence[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [progress, setProgress] = useState<ExerciseProgress[]>([]);

  useEffect(() => {
    if (!user || !profile || profile.role !== 'coach') return;

    console.log('Setting up Firestore listeners for coach:', user.uid);

    // Exercises listener
    const unsubExercises = onSnapshot(
      collection(db, `coaches/${user.uid}/exercises`),
      (snapshot) => {
        const exerciseData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          docId: doc.id,
          videoIds: (doc.data().videoIds || []).map(String)
        })) as Exercise[];
        setExercises(exerciseData);
      },
      (error) => console.error('Exercises listener error:', error)
    );

    // Athletes listener
    const unsubAthletes = onSnapshot(
      collection(db, `coaches/${user.uid}/athletes`),
      (snapshot) => {
        const athleteData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Athlete[];
        setAthletes(athleteData);
      }
    );

    // Sequences listener
    const unsubSequences = onSnapshot(
      collection(db, `coaches/${user.uid}/sequences`),
      (snapshot) => {
        const sequenceData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          drills: doc.data().drills.map((drill: any) => ({
            ...drill,
            id: String(drill.id),
            exerciseId: String(drill.exerciseId)
          }))
        })) as DrillSequence[];
        setSequences(sequenceData);
      }
    );

    // Workouts listener
    const unsubWorkouts = onSnapshot(
      collection(db, `coaches/${user.uid}/workouts`),
      (snapshot) => {
        const workoutData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          items: doc.data().items.map((item: any) => ({
            ...item,
            id: String(item.id),
            itemId: String(item.itemId)
          }))
        })) as Workout[];
        setWorkouts(workoutData);
      }
    );

    // Scheduled Workouts listener
    const unsubScheduled = onSnapshot(
      collection(db, `coaches/${user.uid}/assignments`),
      (snapshot) => {
        const scheduledData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          workoutId: String(doc.data().workoutId),
          athleteId: String(doc.data().athleteId)
        })) as ScheduledWorkout[];
        setScheduledWorkouts(scheduledData);
      }
    );

    // Videos listener
    const unsubVideos = onSnapshot(
      collection(db, `coaches/${user.uid}/videos`),
      (snapshot) => {
        const videoData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Video[];
        setVideos(videoData);
      }
    );

    // Progress listener
    const unsubProgress = onSnapshot(
      collection(db, `coaches/${user.uid}/progress`),
      (snapshot) => {
        const progressData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          exerciseId: String(doc.data().exerciseId),
          athleteId: String(doc.data().athleteId),
          workoutId: String(doc.data().workoutId),
          scheduledWorkoutId: String(doc.data().scheduledWorkoutId),
          date: doc.data().date || new Date().toISOString().split('T')[0],
          timestamp: doc.data().timestamp || new Date().toISOString(),
          completed: doc.data().completed || false,
          category: doc.data().category || 'unknown',
          setsCompleted: doc.data().setsCompleted || 0,
          repsCompleted: doc.data().repsCompleted || 0,
          targetSets: doc.data().targetSets,
          targetReps: doc.data().targetReps
        })) as ExerciseProgress[];
        setProgress(progressData);
      }
    );

    return () => {
      unsubExercises();
      unsubAthletes();
      unsubSequences();
      unsubWorkouts();
      unsubScheduled();
      unsubVideos();
      unsubProgress();
    };
  }, [user, profile]);

  // Exercise functions
  const addExercise = async (exercise: Omit<Exercise, 'id' | 'docId'>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const docRef = await addDoc(collection(db, `coaches/${user.uid}/exercises`), {
        ...exercise,
        coachId: user.uid,
        videoIds: (exercise.videoIds || []).map(String)
      });
      console.log('Exercise added with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw error;
    }
  };

  const updateExercise = async (id: string, exercise: Omit<Exercise, 'id' | 'docId'>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      await updateDoc(doc(db, `coaches/${user.uid}/exercises`, id), {
        ...exercise,
        coachId: user.uid,
        videoIds: (exercise.videoIds || []).map(String)
      });
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  };

  const removeExercise = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      await deleteDoc(doc(db, `coaches/${user.uid}/exercises`, id));
    } catch (error) {
      console.error('Error removing exercise:', error);
      throw error;
    }
  };

  // Athlete functions
  const addAthlete = async (athlete: Omit<Athlete, 'id'>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const docRef = await addDoc(collection(db, `coaches/${user.uid}/athletes`), {
        ...athlete,
        coachId: user.uid
      });
      console.log('Athlete added with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding athlete:', error);
      throw error;
    }
  };

  const updateAthlete = async (id: string, athlete: Omit<Athlete, 'id'>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      await updateDoc(doc(db, `coaches/${user.uid}/athletes`, id), {
        ...athlete,
        coachId: user.uid
      });
    } catch (error) {
      console.error('Error updating athlete:', error);
      throw error;
    }
  };

  const removeAthlete = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      await deleteDoc(doc(db, `coaches/${user.uid}/athletes`, id));
    } catch (error) {
      console.error('Error removing athlete:', error);
      throw error;
    }
  };

  // Sequence functions
  const addSequence = async (sequence: Omit<DrillSequence, 'id'>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      console.log('Current user:', user.uid);
      console.log('Adding sequence to path:', `coaches/${user.uid}/sequences`);
      const preparedSequence = {
        ...sequence,
        coachId: user.uid,
        drills: sequence.drills.map(drill => ({
          ...drill,
          id: String(drill.id),
          exerciseId: String(drill.exerciseId)
        }))
      };
      console.log('Prepared sequence:', preparedSequence);
      await addDoc(collection(db, `coaches/${user.uid}/sequences`), preparedSequence);
    } catch (error) {
      console.error('Error adding sequence:', error);
      throw error;
    }
  };

  const removeSequence = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      await deleteDoc(doc(db, `coaches/${user.uid}/sequences`, id));
    } catch (error) {
      console.error('Error removing sequence:', error);
      throw error;
    }
  };

  // Workout functions
  const addWorkout = async (workout: Omit<Workout, 'id'>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const preparedWorkout = {
        ...workout,
        coachId: user.uid,
        items: workout.items.map(item => ({
          ...item,
          id: String(item.id),
          itemId: String(item.itemId)
        }))
      };
      await addDoc(collection(db, `coaches/${user.uid}/workouts`), preparedWorkout);
    } catch (error) {
      console.error('Error adding workout:', error);
      throw error;
    }
  };

  const updateWorkout = async (id: string, workout: Omit<Workout, 'id'>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const preparedWorkout = {
        ...workout,
        coachId: user.uid,
        items: workout.items.map(item => ({
          ...item,
          id: String(item.id),
          itemId: String(item.itemId)
        }))
      };
      await updateDoc(doc(db, `coaches/${user.uid}/workouts`, id), preparedWorkout);
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
  };

  const removeWorkout = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      await deleteDoc(doc(db, `coaches/${user.uid}/workouts`, id));
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

  // Video functions
  const addVideo = async (video: Omit<Video, 'id'>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const docRef = await addDoc(collection(db, `coaches/${user.uid}/videos`), {
        ...video,
        coachId: user.uid
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding video:', error);
      throw error;
    }
  };

  const updateVideoStatus = async (id: string, status: Video['status']) => {
    if (!user) throw new Error('Not authenticated');
    try {
      await updateDoc(doc(db, `coaches/${user.uid}/videos`, id), { status });
    } catch (error) {
      console.error('Error updating video status:', error);
      throw error;
    }
  };

  const removeVideo = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      await deleteDoc(doc(db, `coaches/${user.uid}/videos`, id));
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

  const linkVideoToExercise = async (videoId: string, exerciseId: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const exercise = exercises.find(e => e.id === exerciseId);
      if (exercise) {
        const updatedVideoIds = [...new Set([...(exercise.videoIds || []), videoId])].map(String);
        await updateExercise(exerciseId, { ...exercise, videoIds: updatedVideoIds });
      }
    } catch (error) {
      console.error('Error linking video:', error);
      throw error;
    }
  };

  const unlinkVideoFromExercise = async (videoId: string, exerciseId: string) => {
    if (!user) throw new Error('Not authenticated');
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

  // Scheduled Workout functions
  const scheduleWorkout = async (workout: Omit<ScheduledWorkout, 'id'>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const preparedScheduledWorkout = {
        ...workout,
        coachId: user.uid,
        workoutId: String(workout.workoutId),
        athleteId: String(workout.athleteId)
      };
      await addDoc(collection(db, `coaches/${user.uid}/assignments`), preparedScheduledWorkout);
    } catch (error) {
      console.error('Error scheduling workout:', error);
      throw error;
    }
  };

  const removeScheduledWorkout = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    try {
      await deleteDoc(doc(db, `coaches/${user.uid}/assignments`, id));
    } catch (error) {
      console.error('Error removing scheduled workout:', error);
      throw error;
    }
  };

  // Progress tracking functions
  const updateProgress = async (newProgress: Partial<ExerciseProgress>) => {
    if (!user) throw new Error('Not authenticated');
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
      await setDoc(doc(db, `coaches/${user.uid}/progress`, progressId), completeProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  const getProgress = (exerciseId: string, scheduledWorkoutId: string): ExerciseProgress | undefined => {
    return progress.find(p => 
      p.exerciseId === exerciseId && 
      p.scheduledWorkoutId === scheduledWorkoutId
    );
  };

  const getAthleteStats = (athleteId: string, dateRange?: { start: string; end: string }) => {
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
    <StoreContext.Provider 
      value={{
        athletes,
        addAthlete,
        updateAthlete,
        removeAthlete,
        exercises,
        setExercises,
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
      }}
    >
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