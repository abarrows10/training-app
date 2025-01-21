"use client";

import React, { useState } from 'react';
import { Plus, Save, Trash, ArrowUp, ArrowDown, Edit, X, Check } from 'lucide-react';
import { useStore } from '@/store';
import { Workout, WorkoutForm, WorkoutItem } from '@/types/interfaces';

const WorkoutBuilder = () => {
  const { exercises, sequences, workouts, addWorkout, removeWorkout, updateWorkout } = useStore();
  const [workout, setWorkout] = useState<WorkoutForm>({
    name: '',
    items: [],
    coachId: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWorkout, setEditWorkout] = useState<WorkoutForm>({
    name: '',
    items: [],
    coachId: ''
  });

  const addItem = (type: 'sequence' | 'drill', isEditing: boolean = false) => {
    const newItem: WorkoutItem = {
      id: Date.now().toString(),
      type,
      itemId: '',
      sets: undefined,
      reps: undefined
    };

    const setFunction = isEditing ? setEditWorkout : setWorkout;const updateItem = (index: number, updates: Partial<WorkoutItem>, isEditing: boolean = false) => {
      const currentWorkout = isEditing ? editWorkout : workout;
      const setFunction = isEditing ? setEditWorkout : setWorkout;
      const newItems = [...currentWorkout.items];
      newItems[index] = { ...newItems[index], ...updates };
      setFunction(prev => ({ ...prev, items: newItems }));
    };
  
    const removeItem = (index: number, isEditing: boolean = false) => {
      const setFunction = isEditing ? setEditWorkout : setWorkout;
      setFunction(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    };
  
    const moveItem = (index: number, direction: 'up' | 'down', isEditing: boolean = false) => {
      const currentWorkout = isEditing ? editWorkout : workout;
      const setFunction = isEditing ? setEditWorkout : setWorkout;
      const newItems = [...currentWorkout.items];
      
      if (direction === 'up' && index > 0) {
        [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
      } else if (direction === 'down' && index < newItems.length - 1) {
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      }
      
      setFunction(prev => ({ ...prev, items: newItems }));
    };
  
    const handleSave = () => {
      if (!workout.name.trim()) {
        alert('Please add a workout name');
        return;
      }
      if (workout.items.length === 0) {
        alert('Please add at least one item');
        return;
      }
      if (workout.items.some(item => item.itemId === '')) {
        alert('Please select items for all entries');
        return;
      }
      addWorkout(workout);
      setWorkout({ name: '', items: [], coachId: '' });
      alert('Workout saved successfully!');
    };
  
    const startEdit = (workout: Workout) => {
      setEditingId(workout.id);
      setEditWorkout({
        name: workout.name,
        items: [...workout.items],
        coachId: workout.coachId
      });
    };
    setFunction(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditWorkout({ name: '', items: [], coachId: '' });
  };

  const handleEditSave = (id: string) => {
    if (!editWorkout.name.trim()) {
      alert('Please add a workout name');
      return;
    }
    if (editWorkout.items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    if (editWorkout.items.some(item => item.itemId === '')) {
      alert('Please select items for all entries');
      return;
    }
    
    updateWorkout(id, editWorkout);
    setEditingId(null);
    setEditWorkout({ name: '', items: [], coachId: '' });
  };

  const getItemName = (item: WorkoutItem) => {
    if (item.type === 'sequence') {
      const sequence = sequences.find(s => s.id === item.itemId);
      return sequence ? sequence.name : 'Unknown Sequence';
    } else {
      const exercise = exercises.find(e => e.id === item.itemId);
      return exercise ? exercise.name : 'Unknown Exercise';
    }
  };

  return (
    // ... existing JSX code
  );
};

export default WorkoutBuilder;
