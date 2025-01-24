"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { profile, viewMode } = useAuth();

  useEffect(() => {
    if (profile?.role === 'coach' || profile?.role === 'super_admin') {
      router.push('/coach/exercises');
    } else if (profile?.role === 'athlete') {
      router.push('/athlete/workouts');
    } else {
      router.push('/login');
    }
  }, [profile, router]);

  return null; // No UI needed since we're redirecting
}