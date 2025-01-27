"use client";

import React, { useState } from 'react';
import { X, CheckCircle, Circle } from 'lucide-react';
import { useStore } from '@/store';
import VideoPlayer from './video-player';
import { Exercise, Workout, DrillSequence, Video } from '@/types/interfaces';

interface WorkoutDetailProps {
  workoutId: string;
  onClose: () => void;
}

interface ExerciseProgressProps {
  exerciseId: string;
  scheduledWorkoutId: string;
  athleteId: string;
  workoutId: string;
  exerciseName: string;
}

const ExerciseProgress = ({ 
  exerciseId, 
  scheduledWorkoutId, 
  athleteId,
  workoutId,
  exerciseName
}: ExerciseProgressProps) => {
  const { updateProgress, getProgress } = useStore();
  const existingProgress = getProgress(exerciseId, scheduledWorkoutId);
  const [isCompleted, setIsCompleted] = useState(existingProgress?.completed || false);

  const toggleComplete = () => {
    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted);
    updateProgress({
      exerciseId,
      athleteId,
      workoutId,
      scheduledWorkoutId,
      date: new Date().toISOString(),
      completed: newCompleted,
      category: 'unknown',
      setsCompleted: 0,
      repsCompleted: 0
    });
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        onClick={toggleComplete}
        className="flex items-center gap-2 p-2 rounded hover:bg-[#3A3B3C] transition-colors"
      >
        {isCompleted ? (
          <CheckCircle className="w-6 h-6 text-[#00A3E0]" />
        ) : (
          <Circle className="w-6 h-6 text-gray-400" />
        )}
        <span className={`${isCompleted ? 'text-[#00A3E0] font-medium' : 'text-gray-300'}`}>
          {isCompleted ? 'Completed' : 'Mark Complete'}
        </span>
      </button>
    </div>
  );
};

const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ workoutId, onClose }) => {
  const { workouts, exercises, sequences, videos, scheduledWorkouts } = useStore();

  const getVideoUrls = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    
    if (!exercise || !exercise.videoIds || exercise.videoIds.length === 0) {
      return [{
        id: '',
        url: 'null',
        filename: 'Placeholder',
        thumbnail: '',
        uploadDate: '',
        status: 'complete' as const
      }];
    }

    const foundVideos = exercise.videoIds
      .map(videoId => videos.find(video => video.id === videoId))
      .filter((video): video is Video => video !== undefined);
    
    return foundVideos;
  };

  const workout = workouts.find(w => w.id === workoutId);
  if (!workout) return null;

  const scheduledWorkout = scheduledWorkouts.find(sw => sw.workoutId === workoutId);
  if (!scheduledWorkout) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#242526] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#242526] border-b border-[#3A3B3C] p-4 flex justify-between items-center z-[60]">
          <h2 className="text-2xl font-bold text-white">{workout.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {workout.items.map((item, index) => {
            if (item.type === 'sequence') {
              const sequence = sequences.find(s => s.id === item.itemId);
              if (!sequence) return null;

              return (
                <div key={index} className="space-y-4">
                  <h3 className="text-xl font-semibold text-white border-b border-[#3A3B3C] pb-2">
                    {sequence.name} 
                    {item.sets && item.reps && (
                      <span className="ml-2 text-[#00A3E0]">
                        {item.sets} sets × {item.reps} reps each
                      </span>
                    )}
                  </h3>
                  <div className="pl-4 space-y-6">
                    {sequence.drills.map((drill, drillIndex) => {
                      const exercise = exercises.find(e => e.id === drill.exerciseId);
                      if (!exercise) return null;

                      return (
                        <div key={drillIndex} className="border border-[#3A3B3C] rounded-lg p-4 bg-[#18191A] hover:border-[#3A3B3C] transition-colors min-h-[80px]">
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-medium text-white">{exercise.name}</h4>
                            {(item.sets || drill.sets) && (item.reps || drill.reps) && (
                              <span className="text-[#00A3E0] font-bold">
                                {item.sets || drill.sets} sets × {item.reps || drill.reps} reps
                              </span>
                            )}
                          </div>
                          
                          <p className="mt-2 text-gray-300">{exercise.description}</p>
                          
                          <ExerciseProgress
                            exerciseId={exercise.id}
                            scheduledWorkoutId={scheduledWorkout.id}
                            athleteId={scheduledWorkout.athleteId}
                            workoutId={workout.id}
                            exerciseName={exercise.name}
                          />

                          {getVideoUrls(exercise.id).some(video => video.url !== 'null') && (
                            <div className="mt-4">
                              {getVideoUrls(exercise.id).map((video, videoIndex) => (
                                <VideoPlayer
                                  key={videoIndex}
                                  url={video.url}
                                  title={`${exercise.name} Demo ${videoIndex + 1}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );

            } else {
                const exercise = exercises.find(e => e.id === item.itemId);
                if (!exercise) return null;
  
                return (
                  <div key={index} className="border border-[#3A3B3C] rounded-lg p-4 bg-[#18191A] hover:border-[#3A3B3C] transition-colors min-h-[80px]">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-white">{exercise.name}</h3>
                      {item.sets && item.reps && (
                        <span className="text-[#00A3E0] font-bold">
                          {item.sets} sets × {item.reps} reps
                        </span>
                      )}
                    </div>
  
                    <p className="mt-2 text-gray-300">{exercise.description}</p>
  
                    <ExerciseProgress
                      exerciseId={exercise.id}
                      scheduledWorkoutId={scheduledWorkout.id}
                      athleteId={scheduledWorkout.athleteId}
                      workoutId={workout.id}
                      exerciseName={exercise.name}
                    />
  
                    {getVideoUrls(exercise.id).some(video => video.url !== 'null') && (
                      <div className="mt-4">
                        {getVideoUrls(exercise.id).map((video, videoIndex) => (
                          <VideoPlayer
                            key={videoIndex}
                            url={video.url}
                            title={`${exercise.name} Demo ${videoIndex + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    );
  };
  
  export default WorkoutDetail;