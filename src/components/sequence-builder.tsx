"use client";

import React, { useState } from 'react';
import { Plus, Save, Trash, ArrowUp, ArrowDown, Edit, X, Check } from 'lucide-react';
import { useStore } from '@/store';
import { DrillSequence } from '@/types/interfaces';

interface SequenceDrill {
  id: string;
  exerciseId: string;
  sets?: number;
  reps?: number;
}

interface SequenceForm {
  name: string;
  drills: SequenceDrill[];
}

const SequenceBuilder = () => {
  const { exercises, sequences, addSequence, removeSequence } = useStore();
  const [sequence, setSequence] = useState<SequenceForm>({
    name: '',
    drills: []
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSequence, setEditSequence] = useState<SequenceForm>({
    name: '',
    drills: []
  });

  const addDrill = () => {
    setSequence(prev => ({
      ...prev,
      drills: [...prev.drills, { id: Date.now().toString(), exerciseId: '', sets: 0, reps: 0 }]
    }));
  };

  const addDrillToEdit = () => {
    setEditSequence(prev => ({
      ...prev,
      drills: [...prev.drills, { id: Date.now().toString(), exerciseId: '', sets: 0, reps: 0 }]
    }));
  };

  const updateDrill = (index: number, updates: Partial<SequenceDrill>) => {
    const newDrills = [...sequence.drills];
    newDrills[index] = { ...newDrills[index], ...updates };
    setSequence(prev => ({ ...prev, drills: newDrills }));
  };

  const updateEditDrill = (index: number, updates: Partial<SequenceDrill>) => {
    const newDrills = [...editSequence.drills];
    newDrills[index] = { ...newDrills[index], ...updates };
    setEditSequence(prev => ({ ...prev, drills: newDrills }));
  };

  const removeDrill = (index: number) => {
    setSequence(prev => ({
      ...prev,
      drills: prev.drills.filter((_, i) => i !== index)
    }));
  };

  const removeEditDrill = (index: number) => {
    setEditSequence(prev => ({
      ...prev,
      drills: prev.drills.filter((_, i) => i !== index)
    }));
  };

  const moveDrill = (index: number, direction: 'up' | 'down', isEditing: boolean = false) => {
    const currentSequence = isEditing ? editSequence : sequence;
    const setCurrentSequence = isEditing ? setEditSequence : setSequence;
    const newDrills = [...currentSequence.drills];
    
    if (direction === 'up' && index > 0) {
      [newDrills[index], newDrills[index - 1]] = [newDrills[index - 1], newDrills[index]];
    } else if (direction === 'down' && index < newDrills.length - 1) {
      [newDrills[index], newDrills[index + 1]] = [newDrills[index + 1], newDrills[index]];
    }
    
    setCurrentSequence(prev => ({ ...prev, drills: newDrills }));
  };

  const handleSave = () => {
    if (!sequence.name.trim()) {
      alert('Please add a sequence name');
      return;
    }
    if (sequence.drills.length === 0) {
      alert('Please add at least one drill');
      return;
    }
    if (sequence.drills.some(drill => drill.exerciseId === '')) {
      alert('Please select a drill for each item');
      return;
    }
    addSequence(sequence);
    setSequence({ name: '', drills: [] });
    alert('Sequence saved successfully!');
  };

  const startEdit = (sequence: DrillSequence) => {
    setEditingId(sequence.id);
    setEditSequence({
      name: sequence.name,
      drills: [...sequence.drills]
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSequence({
      name: '',
      drills: []
    });
  };

  const handleEditSave = (id: string) => {
    if (!editSequence.name.trim()) {
      alert('Please add a sequence name');
      return;
    }
    if (editSequence.drills.length === 0) {
      alert('Please add at least one drill');
      return;
    }
    if (editSequence.drills.some(drill => drill.exerciseId === '')) {
      alert('Please select a drill for each item');
      return;
    }
    removeSequence(id);
    addSequence(editSequence);
    setEditingId(null);
    setEditSequence({ name: '', drills: [] });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* New Sequence Builder */}
        {!editingId && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-black mb-2">Drill Sequence Builder</h2>
                <input
                  type="text"
                  placeholder="Sequence Name (e.g., Basic Hitting Sequence)"
                  value={sequence.name}
                  onChange={(e) => setSequence(prev => ({ ...prev, name: e.target.value }))}
                  className="p-2 border rounded text-black w-full md:w-96"
                />
              </div>
              <button 
                onClick={addDrill}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Drill
              </button>
            </div>

            <div className="space-y-4">
              {sequence.drills.map((drill, index) => (
                <div 
                  key={drill.id}
                  className="p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex md:flex-col gap-2">
                      <button
                        onClick={() => moveDrill(index, 'up')}
                        disabled={index === 0}
                        className={`text-gray-500 hover:text-gray-700 ${index === 0 ? 'opacity-50' : ''}`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveDrill(index, 'down')}
                        disabled={index === sequence.drills.length - 1}
                        className={`text-gray-500 hover:text-gray-700 ${
                          index === sequence.drills.length - 1 ? 'opacity-50' : ''
                        }`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <select
                      value={drill.exerciseId}
                      onChange={(e) => updateDrill(index, { exerciseId: e.target.value })}
                      className="flex-1 p-2 border rounded text-black"
                    >
                      <option value="">Select a drill...</option>
                      {exercises.map(exercise => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name} ({exercise.category})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="0"
                      placeholder="Sets"
                      value={drill.sets || ''}
                      onChange={(e) => updateDrill(index, { sets: Number(e.target.value) })}
                      className="w-20 p-2 border rounded text-black"
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="Reps"
                      value={drill.reps || ''}
                      onChange={(e) => updateDrill(index, { reps: Number(e.target.value) })}
                      className="w-20 p-2 border rounded text-black"
                    />
                    
                    <button
                      onClick={() => removeDrill(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {sequence.drills.length === 0 && (
                <div className="text-center py-8 text-black">
                  Click "Add Drill" to start building your sequence
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Sequence
              </button>
            </div>
          </>
        )}

        {/* Edit Form */}
        {editingId && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-black mb-2">Edit Sequence</h2>
                <input
                  type="text"
                  value={editSequence.name}
                  onChange={(e) => setEditSequence(prev => ({ ...prev, name: e.target.value }))}
                  className="p-2 border rounded text-black w-full md:w-96"
                />
              </div>
              <button 
                onClick={addDrillToEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Drill
              </button>
            </div>

            <div className="space-y-4">
              {editSequence.drills.map((drill, index) => (
                <div 
                  key={drill.id}
                  className="p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex md:flex-col gap-2">
                      <button
                        onClick={() => moveDrill(index, 'up', true)}
                        disabled={index === 0}
                        className={`text-gray-500 hover:text-gray-700 ${index === 0 ? 'opacity-50' : ''}`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveDrill(index, 'down', true)}
                        disabled={index === editSequence.drills.length - 1}
                        className={`text-gray-500 hover:text-gray-700 ${
                          index === editSequence.drills.length - 1 ? 'opacity-50' : ''
                        }`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <select
                      value={drill.exerciseId}
                      onChange={(e) => updateEditDrill(index, { exerciseId: e.target.value })}
                      className="flex-1 p-2 border rounded text-black"
                    >
                      <option value="">Select a drill...</option>
                      {exercises.map(exercise => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name} ({exercise.category})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="0"
                      placeholder="Sets"
                      value={drill.sets || ''}
                      onChange={(e) => updateEditDrill(index, { sets: Number(e.target.value) })}
                      className="w-20 p-2 border rounded text-black"
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="Reps"
                      value={drill.reps || ''}
                      onChange={(e) => updateEditDrill(index, { reps: Number(e.target.value) })}
                      className="w-20 p-2 border rounded text-black"
                    />
                    
                    <button
                      onClick={() => removeEditDrill(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 border rounded hover:bg-gray-50 text-black flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button 
                onClick={() => handleEditSave(editingId)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </>
        )}

        {/* Saved Sequences List */}
        {sequences.length > 0 && !editingId && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-bold text-black mb-4">Saved Sequences</h3>
            <div className="space-y-4">
              {sequences.map(savedSequence => (
                <div key={savedSequence.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-black">{savedSequence.name}</h4>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(savedSequence)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeSequence(savedSequence.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <ul className="list-disc list-inside text-black">
                    {savedSequence.drills.map((drill, index) => {
                      const exercise = exercises.find(e => e.id === drill.exerciseId);
                      return (
                        <li key={index} className="text-black">
                          {exercise?.name || 'Unknown Exercise'}
                          {drill.sets && drill.reps && ` (${drill.sets} sets × ${drill.reps} reps)`}
                        </li>
                      );
                    })}
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

export default SequenceBuilder;