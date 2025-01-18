import { db } from '@/firebase/config';
import { doc, writeBatch, collection, getDocs, setDoc } from 'firebase/firestore';

const ADMIN_UID = 'y7PHTm2TYbVfl3HYG3ufGkpumD22';

export async function migrateDataToAdmin() {
  let status = {
    exercises: 0,
    sequences: 0,
    workouts: 0,
    athletes: 0,
    assignments: 0,
    videos: 0,
    errors: [] as string[]
  };

  try {
    // Set admin user
    await setDoc(doc(db, 'users', ADMIN_UID), {
      role: 'coach',
      isAdmin: true
    }, { merge: true });

    // Setup coach structure
    await setDoc(doc(db, 'coaches', ADMIN_UID), {
      createdAt: new Date().toISOString()
    });

    // Migrate exercises
    const exercisesSnap = await getDocs(collection(db, 'exercises'));
    for (const docSnap of exercisesSnap.docs) {
      const data = docSnap.data();
      await setDoc(doc(db, 'coaches', ADMIN_UID, 'content', 'exercises', docSnap.id), {
        ...data,
        coachId: ADMIN_UID
      });
      status.exercises++;
    }

    // Migrate sequences
    const sequencesSnap = await getDocs(collection(db, 'sequences'));
    for (const docSnap of sequencesSnap.docs) {
      const data = docSnap.data();
      await setDoc(doc(db, 'coaches', ADMIN_UID, 'content', 'sequences', docSnap.id), {
        ...data,
        coachId: ADMIN_UID
      });
      status.sequences++;
    }

    // Migrate workouts
    const workoutsSnap = await getDocs(collection(db, 'workouts'));
    for (const docSnap of workoutsSnap.docs) {
      const data = docSnap.data();
      await setDoc(doc(db, 'coaches', ADMIN_UID, 'content', 'workouts', docSnap.id), {
        ...data,
        coachId: ADMIN_UID
      });
      status.workouts++;
    }

    // Migrate athletes
    const athletesSnap = await getDocs(collection(db, 'athletes'));
    for (const docSnap of athletesSnap.docs) {
      const data = docSnap.data();
      await setDoc(doc(db, 'coaches', ADMIN_UID, 'athletes', docSnap.id), {
        ...data,
        coachId: ADMIN_UID
      });
      status.athletes++;
    }

    // Migrate assignments
    const assignmentsSnap = await getDocs(collection(db, 'scheduledWorkouts'));
    for (const docSnap of assignmentsSnap.docs) {
      const data = docSnap.data();
      await setDoc(doc(db, 'coaches', ADMIN_UID, 'content', 'assignments', docSnap.id), {
        ...data,
        coachId: ADMIN_UID
      });
      status.assignments++;
    }

    // Migrate videos
    const videosSnap = await getDocs(collection(db, 'videos'));
    for (const docSnap of videosSnap.docs) {
      const data = docSnap.data();
      await setDoc(doc(db, 'coaches', ADMIN_UID, 'content', 'videos', docSnap.id), {
        ...data,
        coachId: ADMIN_UID
      });
      status.videos++;
    }

    return status;
  } catch (error: any) {
    status.errors.push(error.message);
    throw { status, error };
  }
}