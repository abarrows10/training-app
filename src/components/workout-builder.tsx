"use client";

import React, { useState } from 'react';
import { Plus, Save, Trash, ArrowUp, ArrowDown, Edit, X, Check } from 'lucide-react';
import { useStore } from '@/store';
import { useAuth } from '@/context/AuthContext';
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

  const { user } = useAuth();

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

  const handleSave = async () => {
    if (!user?.uid) {
      alert('Please log in to save workouts');
      return;
    }
  
    if (!workout.name.trim()) {
      alert('Please add a workout name');
      return;
    }
    if (workout.items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    if (workout.items.some(item => !item.itemId)) {
      alert('Please select an item for each entry');
      return;
    }
  
    try {
      await addWorkout({
        name: workout.name,
        items: workout.items.map(item => ({
          id: item.id,
          type: item.type,
          itemId: item.itemId,
          sets: item.sets || 0,
          reps: item.reps || 0
        })),
        coachId: user.uid
      });
      setWorkout({ name: '', items: [], coachId: user.uid });
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Error saving workout. Please try again.');
    }
  };

  const startEdit = (workout: Workout) => {
    setEditingId(workout.id);
    setEditWorkout({
      name: workout.name,
      items: workout.items.map(item => ({
        ...item,
        id: item.id || Date.now().toString()
      })),
      coachId: workout.coachId
    });
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
      alert('Please select an item for each entry');
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

  const renderItemList = (item: WorkoutItem, options: any[]) => {
    return (
      <select
        value={item.itemId}
        onChange={(e) => {
          const selectedOption = options.find(opt => opt.id === e.target.value);
          return updateItem(
            currentWorkout.items.findIndex(i => i.id === item.id),
            { itemId: e.target.value },
            Boolean(editingId)
          );
        }}
        className="p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
      >
        <option value="">Select {item.type === 'sequence' ? 'a sequence' : 'a drill'}...</option>
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    );
  };

  const currentWorkout = editingId ? editWorkout : workout;

  return (
    <div className="mx-auto max-w-full">
      <div className="bg-[#242526] rounded-xl shadow-lg p-3 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="w-full md:w-auto">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              {editingId ? 'Edit Workout' : 'Workout Builder'}
            </h2>
            <input
              type="text"
              placeholder="Workout Name"
              value={currentWorkout.name}
              onChange={(e) => {
                const setFunction = editingId ? setEditWorkout : setWorkout;
                setFunction(prev => ({ ...prev, name: e.target.value }));
              }}
              className="w-full p-2 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => addItem('sequence', Boolean(editingId))}
              className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
            >
              <Plus className="w-4 h-4 md:mr-2 inline-block" />
              <span className="hidden md:inline">Add Sequence</span>
            </button>
            <button 
              onClick={() => addItem('drill', Boolean(editingId))}
              className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
            >
              <Plus className="w-4 h-4 md:mr-2 inline-block" />
              <span className="hidden md:inline">Add Drill</span>
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
                    disabled={index === currentWorkout.items.length - 1}
                    className={`text-gray-400 hover:text-white transition-colors ${
                      index === currentWorkout.items.length - 1 ? 'opacity-50' : ''
                    }`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {item.type === 'sequence' ? 
                    renderItemList(item, sequences) : 
                    renderItemList(item, exercises)
                  }

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

          {currentWorkout.items.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Click "Add Sequence" or "Add Drill" to start building your workout
            </div>
          )}
        </div>

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
