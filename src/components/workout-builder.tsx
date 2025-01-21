"use client";

import React, { useState } from 'react';
import { Plus, Save, Trash, ArrowUp, ArrowDown, Edit, X, Check } from 'lucide-react';
import { useStore } from '@/store';
import { Workout, WorkoutItem } from '@/types/interfaces';

interface WorkoutForm {
  name: string;
  items: WorkoutItem[];
}

const WorkoutBuilder = () => {
  const { exercises, sequences, workouts, addWorkout, removeWorkout, updateWorkout } = useStore();
  const [workout, setWorkout] = useState<WorkoutForm>({
    name: '',
    items: []
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWorkout, setEditWorkout] = useState<WorkoutForm>({
    name: '',
    items: []
  });

  const addItem = (type: 'sequence' | 'drill', isEditing: boolean = false) => {
    const newItem: WorkoutItem = {
      id: Date.now().toString(),
      type,
      itemId: '',
      sets: undefined,
      reps: undefined
    };

    const setFunction = isEditing ? setEditWorkout : setWorkout;
    setFunction(prev => ({
      ...prev,
      items: [...prev.items, newItem]
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
    if (workout.items.some(item => item.itemId === '')) {
      alert('Please select items for all entries');
      return;
    }
    addWorkout(workout);
    setWorkout({ name: '', items: [] });
    alert('Workout saved successfully!');
  };

  const startEdit = (workout: Workout) => {
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
    setEditWorkout({ name: '', items: [] });
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
    <div className="mx-auto max-w-full">
      <div className="bg-[#242526] rounded-xl shadow-lg p-3 md:p-6">
        {editingId ? (
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
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <button 
                  onClick={() => addItem('sequence', true)}
                  className="w-full md:w-auto bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sequence
                </button>
                <button 
                  onClick={() => addItem('drill', true)}
                  className="w-full md:w-auto bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Single Drill
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {editWorkout.items.map((item, index) => (
                <div 
                  key={item.id}
                  className="p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex md:flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => moveItem(index, 'up', true)}
                        disabled={index === 0}
                        className={`text-gray-400 hover:text-white transition-colors ${index === 0 ? 'opacity-50' : ''}`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down', true)}
                        disabled={index === editWorkout.items.length - 1}
                        className={`text-gray-400 hover:text-white transition-colors ${
                          index === editWorkout.items.length - 1 ? 'opacity-50' : ''
                        }`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                      <select
                        value={item.itemId}
                        onChange={(e) => updateItem(index, { itemId: e.target.value }, true)}
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors md:col-span-2"
                      >
                        <option value="">
                          {item.type === 'sequence' ? 'Select a sequence...' : 'Select a drill...'}
                        </option>
                        {item.type === 'sequence' 
                          ? sequences.map(sequence => (
                              <option key={sequence.id} value={sequence.id}>
                                {sequence.name}
                              </option>
                            ))
                          : exercises.map(exercise => (
                              <option key={exercise.id} value={exercise.id}>
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
                        onChange={(e) => updateItem(index, { sets: e.target.value ? Number(e.target.value) : undefined }, true)}
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                      />

                      <input
                        type="number"
                        min="0"
                        placeholder="Reps"
                        value={item.reps || ''}
                        onChange={(e) => updateItem(index, { reps: e.target.value ? Number(e.target.value) : undefined }, true)}
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                      />
                    </div>
                    
                    <button
                      onClick={() => removeItem(index, true)}
                      className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col-reverse md:flex-row justify-end gap-3">
              <button
                onClick={cancelEdit}
                className="w-full md:w-auto px-4 py-2 border border-[#3A3B3C] rounded-lg hover:bg-[#3A3B3C] text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button 
                onClick={() => handleEditSave(editingId)}
                className="w-full md:w-auto bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] flex items-center justify-center transition-colors"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </>
        ) : (
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
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <button 
                  onClick={() => addItem('sequence')}
                  className="w-full md:w-auto bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sequence
                </button>
                <button 
                  onClick={() => addItem('drill')}
                  className="w-full md:w-auto bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Single Drill
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {workout.items.map((item, index) => (
                <div 
                  key={item.id}
                  className="p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex md:flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className={`text-gray-400 hover:text-white transition-colors ${index === 0 ? 'opacity-50' : ''}`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === workout.items.length - 1}
                        className={`text-gray-400 hover:text-white transition-colors ${
                          index === workout.items.length - 1 ? 'opacity-50' : ''
                        }`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                      <select
                        value={item.itemId}
                        onChange={(e) => updateItem(index, { itemId: e.target.value })}
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors md:col-span-2"
                      >
                        <option value="">
                          {item.type === 'sequence' ? 'Select a sequence...' : 'Select a drill...'}
                        </option>
                        {item.type === 'sequence' 
                          ? sequences.map(sequence => (
                              <option key={sequence.id} value={sequence.id}>
                                {sequence.name}
                              </option>
                            ))
                          : exercises.map(exercise => (
                              <option key={exercise.id} value={exercise.id}>
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
                        onChange={(e) => updateItem(index, { sets: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                      />

                      <input
                        type="number"
                        min="0"
                        placeholder="Reps"
                        value={item.reps || ''}
                        onChange={(e) => updateItem(index, { reps: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                      />
                    </div>
                    
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {workout.items.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Add sequences or individual drills to build your workout
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleSave}
                className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] flex items-center transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Workout
              </button>
            </div>
          </>
        )}

        {workouts.length > 0 && !editingId && (
          <div className="mt-8 border-t border-[#3A3B3C] pt-6">
            <h3 className="text-lg font-bold text-white mb-4">Saved Workouts</h3>
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
                        {getItemName(item)}
                        {item.sets && item.reps ? ` - ${item.sets} sets × ${item.reps} reps` : ''}
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