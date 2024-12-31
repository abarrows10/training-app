"use client";

import React, { useState } from 'react';
import { Plus, Save, Trash, ArrowUp, ArrowDown, Edit, X, Check } from 'lucide-react';
import { useStore } from '@/store';

interface WorkoutItem {
  id: number;
  type: 'sequence' | 'drill';
  itemId: number;
  sets?: number;
  reps?: number;
}

interface WorkoutForm {
  name: string;
  items: WorkoutItem[];
}

const WorkoutBuilder = () => {
  const { exercises, sequences, addWorkout, workouts, removeWorkout, updateWorkout } = useStore();
  const [workout, setWorkout] = useState<WorkoutForm>({
    name: '',
    items: []
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editWorkout, setEditWorkout] = useState<WorkoutForm>({
    name: '',
    items: []
  });

  const addItem = (type: 'sequence' | 'drill', isEditing: boolean = false) => {
    const setFunction = isEditing ? setEditWorkout : setWorkout;
    setFunction(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), type, itemId: 0, sets: 0, reps: 0 }]
    }));
  };

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
    if (workout.items.some(item => item.itemId === 0)) {
      alert('Please select all items');
      return;
    }
    addWorkout(workout);
    setWorkout({ name: '', items: [] });
    alert('Workout saved successfully!');
  };

  const startEdit = (workout: any) => {
    setEditingId(workout.id);
    setEditWorkout({
      name: workout.name,
      items: [...workout.items]
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditWorkout({ name: '', items: [] });
  };

  const saveEdit = (id: number) => {
    if (!editWorkout.name.trim()) {
      alert('Please add a workout name');
      return;
    }
    if (editWorkout.items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    if (editWorkout.items.some(item => item.itemId === 0)) {
      alert('Please select all items');
      return;
    }
    
    updateWorkout(id, editWorkout);
    setEditingId(null);
    setEditWorkout({ name: '', items: [] });
  };

  const getItemName = (item: WorkoutItem) => {
    if (item.type === 'sequence') {
      const sequence = sequences.find(s => s.id === item.itemId);
      return sequence ? sequence.name : 'Select a sequence...';
    } else {
      const exercise = exercises.find(e => e.id === item.itemId);
      return exercise ? exercise.name : 'Select a drill...';
    }
  };

  const renderWorkoutForm = (
    currentWorkout: WorkoutForm,
    isEditing: boolean = false,
    onSave: () => void
  ) => (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isEditing ? 'Edit Workout' : 'Workout Builder'}
          </h2>
          <input
            type="text"
            placeholder="Workout Name"
            value={currentWorkout.name}
            onChange={(e) => {
              const setFunction = isEditing ? setEditWorkout : setWorkout;
              setFunction(prev => ({ ...prev, name: e.target.value }));
            }}
            className="p-2 w-full md:w-96 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => addItem('sequence', isEditing)}
            className="bg-[#00A3E0] text-white px-4 py-2 rounded hover:bg-[#0077A3] flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Sequence
          </button>
          <button 
            onClick={() => addItem('drill', isEditing)}
            className="bg-[#00A3E0] text-white px-4 py-2 rounded hover:bg-[#0077A3] flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Single Drill
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {currentWorkout.items.map((item, index) => (
          <div 
            key={item.id}
            className="p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex md:flex-col gap-2">
                <button
                  onClick={() => moveItem(index, 'up', isEditing)}
                  disabled={index === 0}
                  className={`text-gray-400 hover:text-white transition-colors ${index === 0 ? 'opacity-50' : ''}`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down', isEditing)}
                  disabled={index === currentWorkout.items.length - 1}
                  className={`text-gray-400 hover:text-white transition-colors ${
                    index === currentWorkout.items.length - 1 ? 'opacity-50' : ''
                  }`}
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-1 gap-4">
                <select
                  value={item.itemId}
                  onChange={(e) => updateItem(index, { itemId: Number(e.target.value) }, isEditing)}
                  className="flex-1 p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                >
                  <option value={0} className="bg-[#242526] text-white">
                    {item.type === 'sequence' ? 'Select a sequence...' : 'Select a drill...'}
                  </option>
                  {item.type === 'sequence' 
                    ? sequences.map(sequence => (
                        <option key={sequence.id} value={sequence.id} className="bg-[#242526] text-white">
                          {sequence.name}
                        </option>
                      ))
                    : exercises.map(exercise => (
                        <option key={exercise.id} value={exercise.id} className="bg-[#242526] text-white">
                          {exercise.name} ({exercise.category})
                        </option>
                      ))
                  }
                </select>

                <input
                  type="number"
                  min="0"
                  placeholder="Sets"
                  value={item.sets || ''}
                  onChange={(e) => updateItem(index, { sets: Number(e.target.value) }, isEditing)}
                  className="w-20 p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                />

                <input
                  type="number"
                  min="0"
                  placeholder="Reps"
                  value={item.reps || ''}
                  onChange={(e) => updateItem(index, { reps: Number(e.target.value) }, isEditing)}
                  className="w-20 p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                />
              </div>
              
              <button
                onClick={() => removeItem(index, isEditing)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {currentWorkout.items.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Add sequences or individual drills to build your workout
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        {isEditing && (
          <button
            onClick={cancelEdit}
            className="px-4 py-2 border border-[#3A3B3C] rounded hover:bg-[#3A3B3C] text-white flex items-center transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        )}
        <button 
          onClick={onSave}
          className="bg-[#00A3E0] text-white px-4 py-2 rounded hover:bg-[#0077A3] flex items-center transition-colors"
        >
          {isEditing ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {isEditing ? 'Save Changes' : 'Save Workout'}
        </button>
      </div>
    </>
  );

  return (
    <div>
      <div className="bg-[#242526] rounded-xl shadow-lg p-6">
        {editingId ? (
          renderWorkoutForm(editWorkout, true, () => saveEdit(editingId))
        ) : (
          <>
            {renderWorkoutForm(workout, false, handleSave)}

            {workouts.length > 0 && (
              <div className="mt-8 border-t border-[#3A3B3C] pt-6">
                <h3 className="text-xl font-bold text-white mb-4">Saved Workouts</h3>
                <div className="space-y-4">
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
                        {savedWorkout.items.map((item, index) => (
                          <li key={index} className="text-gray-300">
                            {item.type === 'sequence' ? '📑 ' : '🎯 '}
                            {getItemName(item)}
                            {item.sets && item.reps && ` - ${item.sets} sets × ${item.reps} reps`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkoutBuilder;