"use client";

import { createContext, useContext, useState, useEffect } from 'react';

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
  timestamp: string;  // New: exact time of completion
  completed: boolean;
  category: string;   // New: copied from exercise
  setsCompleted: number; // New: actual sets completed
  repsCompleted: number; // New: actual reps completed
  targetSets?: number;   // New: from workout plan
  targetReps?: number;   // New: from workout plan
}

interface StoreContextType {
  athletes: Athlete[];
  addAthlete: (athlete: Omit<Athlete, 'id'>) => void;
  updateAthlete: (id: number, athlete: Omit<Athlete, 'id'>) => void;
  removeAthlete: (id: number) => void;
  
  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  updateExercise: (id: number, exercise: Omit<Exercise, 'id'>) => void;
  removeExercise: (id: number) => void;
  
  sequences: DrillSequence[];
  addSequence: (sequence: Omit<DrillSequence, 'id'>) => void;
  removeSequence: (id: number) => void;
  
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (id: number, workout: Omit<Workout, 'id'>) => void;
  removeWorkout: (id: number) => void;
  
  scheduledWorkouts: ScheduledWorkout[];
  scheduleWorkout: (workout: Omit<ScheduledWorkout, 'id'>) => void;
  removeScheduledWorkout: (id: number) => void;

  videos: Video[];
  addVideo: (video: Omit<Video, 'id'>) => number;
  updateVideoStatus: (id: number, status: Video['status']) => void;
  removeVideo: (id: number) => void;
  linkVideoToExercise: (videoId: number, exerciseId: number) => void;
  unlinkVideoFromExercise: (videoId: number, exerciseId: number) => void;
  
  progress: ExerciseProgress[];
  updateProgress: (progress: Partial<ExerciseProgress>) => void;
  getProgress: (exerciseId: number, scheduledWorkoutId: number) => ExerciseProgress | undefined;
  
  // New methods for progress statistics
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
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sequences, setSequences] = useState<DrillSequence[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [progress, setProgress] = useState<ExerciseProgress[]>([]);

  useEffect(() => {
    const savedAthletes = localStorage.getItem('athletes');
    const savedExercises = localStorage.getItem('exercises');
    const savedSequences = localStorage.getItem('sequences');
    const savedWorkouts = localStorage.getItem('workouts');
    const savedScheduledWorkouts = localStorage.getItem('scheduledWorkouts');
    const savedVideos = localStorage.getItem('videos');
    const savedProgress = localStorage.getItem('progress');

    if (savedAthletes) setAthletes(JSON.parse(savedAthletes));
    if (savedExercises) {
      const parsedExercises = JSON.parse(savedExercises);
      setExercises(parsedExercises.map((ex: Exercise) => ({
        ...ex,
        videoIds: ex.videoIds || []
      })));
    }
    if (savedSequences) setSequences(JSON.parse(savedSequences));
    if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts));
    if (savedScheduledWorkouts) setScheduledWorkouts(JSON.parse(savedScheduledWorkouts));
    if (savedVideos) setVideos(JSON.parse(savedVideos));
    if (savedProgress) setProgress(JSON.parse(savedProgress));
  }, []);

  useEffect(() => {
    localStorage.setItem('athletes', JSON.stringify(athletes));
    localStorage.setItem('exercises', JSON.stringify(exercises));
    localStorage.setItem('sequences', JSON.stringify(sequences));
    localStorage.setItem('workouts', JSON.stringify(workouts));
    localStorage.setItem('scheduledWorkouts', JSON.stringify(scheduledWorkouts));
    localStorage.setItem('videos', JSON.stringify(videos));
    localStorage.setItem('progress', JSON.stringify(progress));
  }, [athletes, exercises, sequences, workouts, scheduledWorkouts, videos, progress]);

  // Athlete functions
  const addAthlete = (athlete: Omit<Athlete, 'id'>) => {
    const newAthlete = {
      ...athlete,
      id: Date.now(),
    };
    setAthletes(prev => [...prev, newAthlete]);
  };

  const updateAthlete = (id: number, athlete: Omit<Athlete, 'id'>) => {
    setAthletes(prev => prev.map(a => a.id === id ? { ...athlete, id } : a));
  };

  const removeAthlete = (id: number) => {
    setAthletes(prev => prev.filter(athlete => athlete.id !== id));
    setScheduledWorkouts(prev => prev.filter(sw => sw.athleteId !== id));
  };

  // Exercise functions
  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    const newExercise = {
      ...exercise,
      id: Date.now(),
      videoIds: exercise.videoIds || [],
    };
    setExercises(prev => [...prev, newExercise]);
  };

  const updateExercise = (id: number, exercise: Omit<Exercise, 'id'>) => {
    setExercises(prev => prev.map(e => e.id === id ? {
      ...exercise,
      id,
      videoIds: exercise.videoIds || []
    } : e));
  };

  const removeExercise = (id: number) => {
    setExercises(prev => prev.filter(exercise => exercise.id !== id));
  };

  // Sequence functions
  const addSequence = (sequence: Omit<DrillSequence, 'id'>) => {
    const newSequence = {
      ...sequence,
      id: Date.now(),
    };
    setSequences(prev => [...prev, newSequence]);
  };

  const removeSequence = (id: number) => {
    setSequences(prev => prev.filter(sequence => sequence.id !== id));
  };

  // Workout functions
  const addWorkout = (workout: Omit<Workout, 'id'>) => {
    const newWorkout = {
      ...workout,
      id: Date.now(),
    };
    setWorkouts(prev => [...prev, newWorkout]);
  };

  const updateWorkout = (id: number, workout: Omit<Workout, 'id'>) => {
    setWorkouts(prev => prev.map(w => w.id === id ? { ...workout, id } : w));
  };

  const removeWorkout = (id: number) => {
    setWorkouts(prev => prev.filter(workout => workout.id !== id));
    setScheduledWorkouts(prev => prev.filter(sw => sw.workoutId !== id));
  };

  // ScheduledWorkout functions
  const scheduleWorkout = (workout: Omit<ScheduledWorkout, 'id'>) => {
    const newScheduledWorkout = {
      ...workout,
      id: Date.now(),
    };
    setScheduledWorkouts(prev => [...prev, newScheduledWorkout]);
  };

  const removeScheduledWorkout = (id: number) => {
    setScheduledWorkouts(prev => prev.filter(workout => workout.id !== id));
  };

  // Video functions
  const addVideo = (video: Omit<Video, 'id'>) => {
    const id = Date.now();
    const newVideo = { ...video, id };
    setVideos(prev => [...prev, newVideo]);
    return id;
  };

  const updateVideoStatus = (id: number, status: Video['status']) => {
    setVideos(prev => prev.map(video => 
      video.id === id ? { ...video, status } : video
    ));
  };

  const removeVideo = (id: number) => {
    setExercises(prev => prev.map(exercise => ({
      ...exercise,
      videoIds: (exercise.videoIds || []).filter(videoId => videoId !== id)
    })));
    setVideos(prev => prev.filter(video => video.id !== id));
  };

  const linkVideoToExercise = (videoId: number, exerciseId: number) => {
    setExercises(prev => prev.map(exercise => 
      exercise.id === exerciseId
        ? {
            ...exercise,
            videoIds: [...new Set([...(exercise.videoIds || []), videoId])]
          }
        : exercise
    ));
  };

  const unlinkVideoFromExercise = (videoId: number, exerciseId: number) => {
    setExercises(prev => prev.map(exercise =>
      exercise.id === exerciseId
        ? {
            ...exercise,
            videoIds: (exercise.videoIds || []).filter(id => id !== videoId)
          }
        : exercise
    ));
  };

  // Progress functions
  const updateProgress = (newProgress: Partial<ExerciseProgress>) => {
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

    setProgress(prev => {
      const index = prev.findIndex(p => 
        p.exerciseId === completeProgress.exerciseId && 
        p.scheduledWorkoutId === completeProgress.scheduledWorkoutId
      );
      
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = completeProgress;
        return updated;
      }
      
      return [...prev, completeProgress];
    });
  };

  const getProgress = (exerciseId: number, scheduledWorkoutId: number) => {
    return progress.find(p => 
      p.exerciseId === exerciseId && 
      p.scheduledWorkoutId === scheduledWorkoutId
    );
  };

  // New statistics function
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

    const stats = {
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

    return stats;
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