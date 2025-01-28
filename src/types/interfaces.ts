export interface DrillSequence {
  id: string;
  name: string;
  drills: SequenceDrill[];
  coachId: string;
}

export interface SequenceDrill {
  id: string;
  exerciseId: string;
  sets?: number;  // Optional sets
  reps?: number;  // Optional reps
}

export interface Exercise {
  id: string;
  docId: string;
  name: string;
  description: string;
  category: string;
  videoIds: string[];
  coachId: string;
}

export interface Workout {
  id: string;
  name: string;
  items: WorkoutItem[];
  coachId: string;
}

export interface WorkoutForm {
  name: string;
  items: WorkoutItem[];
  coachId: string;
}

export interface SequenceForm {
  name: string;
  drills: SequenceDrill[];
  coachId: string;
}

export interface WorkoutItem {
  id: string;
  type: 'sequence' | 'drill';
  itemId: string;
  sets?: number;
  reps?: number;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  uploadDate: string;
  status: 'complete' | 'uploading' | 'failed';
  coachId: string;
}

export interface Athlete {
  id: string;
  name: string;
  position: string;
  notes: string;
  coachId: string;
}

export interface ScheduledWorkout {
  id: string;
  workoutId: string;
  athleteId: string;
  date: string;
  coachId: string;
}

export interface ExerciseProgress {
  id: string;
  exerciseId: string;
  athleteId: string;
  workoutId: string;
  scheduledWorkoutId: string;
  date: string;
  timestamp: string;
  completed: boolean;
  category: string;
  setsCompleted: number;
  repsCompleted: number;
  targetSets?: number;
  targetReps?: number;
  coachId: string;
}

export interface CoachProfile {
  id: string;
  invitationCount: number;  // Track number of pending invitations
  maxInvitations: number;   // Default to 5
  athletes: string[];       // athlete UIDs
  invites: string[];       // invitation IDs
}

export interface AthleteProfile {
  id: string;
  coachId: string;
  joinedAt: string;
}

export interface Category {
  id: string;
  name: string;
  coachId: string;
  isDefault?: boolean;
}

export interface Invitation {
  id: string;
  coachId: string;
  email: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  message?: string;
}

export interface PendingInvitation {
  email: string;
  message?: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

