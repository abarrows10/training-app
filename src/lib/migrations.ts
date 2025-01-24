import { db } from '@/firebase/config';
import { doc, writeBatch, collection, getDocs, setDoc } from 'firebase/firestore';

const ADMIN_UID = 'zsIzvn4d4WhlDZiGg6iI9K3cHuS2';

export async function testAccess() {
  try {
    const testSnap = await getDocs(collection(db, 'exercises'));
    console.log('Test data count:', testSnap.docs.length);
    testSnap.docs.forEach(doc => {
      console.log('Document data:', doc.data());
    });
  } catch (error) {
    console.error('DB access error:', error);
  }
}

export async function migrateDataToAdmin() {
  await testAccess();
  
  let status = {
    exercises: 0,
    sequences: 0,
    workouts: 0,
    athletes: 0,
    assignments: 0,
    videos: 0,
    categories: 0,
    errors: [] as string[]
  };

  try {
    // Set admin user
    await setDoc(doc(db, 'users', ADMIN_UID), {
      role: 'super_admin',
      isAdmin: true
    }, { merge: true });

    // Setup coach structure
    await setDoc(doc(db, 'coaches', ADMIN_UID), {
      createdAt: new Date().toISOString()
    });

    // Get all unique categories from exercises
    const exercisesSnap = await getDocs(collection(db, 'exercises'));
    const uniqueCategories = new Set<string>();
    exercisesSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.category) uniqueCategories.add(data.category);
    });

    // Migrate categories
    for (const categoryName of uniqueCategories) {
      await setDoc(doc(db, `coaches/${ADMIN_UID}/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}`), {
        name: categoryName,
        coachId: ADMIN_UID,
        isDefault: true
      });
      status.categories++;
    }

    // Migrate exercises
    for (const docSnap of exercisesSnap.docs) {
      const data = docSnap.data();
      await setDoc(doc(db, `coaches/${ADMIN_UID}/exercises/${docSnap.id}`), {
        ...data,
        coachId: ADMIN_UID
      });
      status.exercises++;
    }

    // Migrate sequences
    const sequencesSnap = await getDocs(collection(db, 'sequences'));
    for (const docSnap of sequencesSnap.docs) {
      const data = docSnap.data();
      await setDoc(doc(db, `coaches/${ADMIN_UID}/sequences/${docSnap.id}`), {
        ...data,
        coachId: ADMIN_UID
      });
      status.sequences++;
    }

    // Migrate workouts
    const workoutsSnap = await getDocs(collection(db, 'workouts'));
    for (const docSnap of workoutsSnap.docs) {
      const data = docSnap.data();
      await setDoc(doc(db, `coaches/${ADMIN_UID}/workouts/${docSnap.id}`), {
        ...data,
        coachId: ADMIN_UID
      });
      status.workouts++;
    }

    // Migrate athletes
    const athletesSnap = await getDocs(collection(db, 'athletes'));
    for (const docSnap of athletesSnap.docs) {
      const data = docSnap.data();
      await setDoc(doc(db, `coaches/${ADMIN_UID}/athletes/${docSnap.id}`), {
        ...data,
        coachId: ADMIN_UID
      });
      status.athletes++;
    }

    // Migrate assignments
    const assignmentsSnap = await getDocs(collection(db, 'scheduledWorkouts'));
    for (const docSnap of assignmentsSnap.docs) {
      const data = docSnap.data();
      await setDoc(doc(db, `coaches/${ADMIN_UID}/assignments/${docSnap.id}`), {
        ...data,
        coachId: ADMIN_UID
      });
      status.assignments++;
    }

    // Migrate videos
    const videosSnap = await getDocs(collection(db, 'videos'));
    for (const docSnap of videosSnap.docs) {
      const data = docSnap.data();
      await setDoc(doc(db, `coaches/${ADMIN_UID}/videos/${docSnap.id}`), {
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