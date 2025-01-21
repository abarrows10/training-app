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

  // Add these functions after the state declarations
const updateItem = (index: number, updates: Partial<WorkoutItem>, isEditing: boolean = false) => {
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
};

const startEdit = (workout: Workout) => {
  setEditingId(workout.id);
  setEditWorkout({
    name: workout.name,
    items: [...workout.items],
    coachId: workout.coachId
  });
};

  return (
    <div className="mx-auto max-w-full">
      <div className="bg-[#242526] rounded-xl shadow-lg p-3 md:p-6">
        {editingId ? (
          // Edit Mode
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="w-full md:w-auto">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Edit Workout</h2>
                <input
                  type="text"
                  value={editWorkout.name}
                  onChange={(e) => setEditWorkout(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => addItem('sequence', true)}
                  className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
                >
                  Add Sequence
                </button>
                <button 
                  onClick={() => addItem('drill', true)}
                  className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
                >
                  Add Drill
                </button>
              </div>
            </div>
          </>
        ) : (
          // Create Mode
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="w-full md:w-auto">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Workout Builder</h2>
                <input
                  type="text"
                  placeholder="Workout Name"
                  value={workout.name}
                  onChange={(e) => setWorkout(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => addItem('sequence')}
                  className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
                >
                  Add Sequence
                </button>
                <button 
                  onClick={() => addItem('drill')}
                  className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
                >
                  Add Drill
                </button>
              </div>
            </div>
            
            {/* Workout Items */}
            <div className="space-y-4">
              {(editingId ? editWorkout : workout).items.map((item, index) => (
                <div 
                  key={item.id}
                  className="p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex md:flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => moveItem(index, 'up', Boolean(editingId))}
                        disabled={index === 0}
                        className={`text-gray-400 hover:text-white transition-colors ${index === 0 ? 'opacity-50' : ''}`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down', Boolean(editingId))}
                        disabled={index === (editingId ? editWorkout : workout).items.length - 1}
                        className={`text-gray-400 hover:text-white transition-colors ${
                          index === (editingId ? editWorkout : workout).items.length - 1 ? 'opacity-50' : ''
                        }`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
  
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(index, { type: e.target.value as 'sequence' | 'drill' }, Boolean(editingId))}
                        className="p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                      >
                        <option value="sequence">Sequence</option>
                        <option value="drill">Single Drill</option>
                      </select>
  
                      <select
                        value={item.itemId}
                        onChange={(e) => updateItem(index, { itemId: e.target.value }, Boolean(editingId))}
                        className="p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                      >
                        <option value="">Select {item.type === 'sequence' ? 'a sequence' : 'a drill'}...</option>
                        {item.type === 'sequence' 
                          ? sequences.map(sequence => (
                              <option key={sequence.id} value={sequence.id}>{sequence.name}</option>
                            ))
                          : exercises.map(exercise => (
                              <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                            ))
                        }
                      </select>
  
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Sets"
                          value={item.sets || ''}
                          onChange={(e) => updateItem(index, { sets: parseInt(e.target.value) || undefined }, Boolean(editingId))}
                          className="w-20 p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                        />
                        <input
                          type="number"
                          placeholder="Reps"
                          value={item.reps || ''}
                          onChange={(e) => updateItem(index, { reps: parseInt(e.target.value) || undefined }, Boolean(editingId))}
                          className="w-20 p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeItem(index, Boolean(editingId))}
                      className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
  
            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              {editingId ? (
                <>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-[#3A3B3C] rounded-lg hover:bg-[#3A3B3C] text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditSave(editingId)}
                    className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSave}
                  className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
                >
                  Save Workout
                </button>
              )}
            </div>
          </>
        )}
  
        {/* Saved Workouts List */}
        {workouts.length > 0 && !editingId && (
          <div className="mt-8 border-t border-[#3A3B3C] pt-6">
            <h3 className="text-lg font-bold text-white mb-4">Saved Workouts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workouts.map(savedWorkout => (
                <div key={savedWorkout.id} className="border border-[#3A3B3C] rounded-lg p-4 bg-[#18191A]">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{savedWorkout.name}</h4>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(savedWorkout)}
                        className="text-[#00A3E0] hover:text-[#0077A3] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeWorkout(savedWorkout.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <ul className="list-disc list-inside text-gray-300">
                    {savedWorkout.items.map((item) => (
                      <li key={item.id} className="text-gray-300">
                        {getItemName(item)}
                        {(item.sets || item.reps) && (
                          <span className="text-[#00A3E0]">
                            {' '}({item.sets || 0} sets × {item.reps || 0} reps)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutBuilder;
