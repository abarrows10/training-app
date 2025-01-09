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
    <div className="mx-auto max-w-full">
      <div className="bg-[#242526] rounded-xl shadow-lg p-3 md:p-6">
        {/* New Sequence Builder */}
        {!editingId && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Drill Sequence Builder</h2>
                <input
                  type="text"
                  placeholder="Sequence Name (e.g., Basic Hitting Sequence)"
                  value={sequence.name}
                  onChange={(e) => setSequence(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                />
              </div>
              <button 
                onClick={addDrill}
                className="w-full md:w-auto bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Drill
              </button>
            </div>

            <div className="space-y-4">
              {sequence.drills.map((drill, index) => (
                <div 
                  key={drill.id}
                  className="p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex md:flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => moveDrill(index, 'up')}
                        disabled={index === 0}
                        className={`text-gray-400 hover:text-white transition-colors ${index === 0 ? 'opacity-50' : ''}`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveDrill(index, 'down')}
                        disabled={index === sequence.drills.length - 1}
                        className={`text-gray-400 hover:text-white transition-colors ${
                          index === sequence.drills.length - 1 ? 'opacity-50' : ''
                        }`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      <select
                        value={drill.exerciseId}
                        onChange={(e) => updateDrill(index, { exerciseId: e.target.value })}
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
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
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                      />

                      <input
                        type="number"
                        min="0"
                        placeholder="Reps"
                        value={drill.reps || ''}
                        onChange={(e) => updateDrill(index, { reps: Number(e.target.value) })}
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                      />
                    </div>
                    
                    <button
                      onClick={() => removeDrill(index)}
                      className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {sequence.drills.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Click "Add Drill" to start building your sequence
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleSave}
                className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] flex items-center transition-colors"
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Edit Sequence</h2>
                <input
                  type="text"
                  value={editSequence.name}
                  onChange={(e) => setEditSequence(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                />
              </div>
              <button 
                onClick={addDrillToEdit}
                className="w-full md:w-auto bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Drill
              </button>
            </div>

            <div className="space-y-4">
              {editSequence.drills.map((drill, index) => (
                <div 
                  key={drill.id}
                  className="p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex md:flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => moveDrill(index, 'up', true)}
                        disabled={index === 0}
                        className={`text-gray-400 hover:text-white transition-colors ${index === 0 ? 'opacity-50' : ''}`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveDrill(index, 'down', true)}
                        disabled={index === editSequence.drills.length - 1}
                        className={`text-gray-400 hover:text-white transition-colors ${
                          index === editSequence.drills.length - 1 ? 'opacity-50' : ''
                        }`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      <select
                        value={drill.exerciseId}
                        onChange={(e) => updateEditDrill(index, { exerciseId: e.target.value })}
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
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
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                      />

                      <input
                        type="number"
                        min="0"
                        placeholder="Reps"
                        value={drill.reps || ''}
                        onChange={(e) => updateEditDrill(index, { reps: Number(e.target.value) })}
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                      />
                    </div>
                    
                    <button
                      onClick={() => removeEditDrill(index)}
                      className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col md:flex-row justify-end gap-3">
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
        )}

        {/* Saved Sequences List */}
        {sequences.length > 0 && !editingId && (
          <div className="mt-8 border-t border-[#3A3B3C] pt-6">
            <h3 className="text-lg font-bold text-white mb-4">Saved Sequences</h3>
            <div className="space-y-4">
              {sequences.map(savedSequence => (
                <div key={savedSequence.id} className="border border-[#3A3B3C] rounded-lg p-4 bg-[#18191A]">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{savedSequence.name}</h4>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(savedSequence)}
                        className="text-[#00A3E0] hover:text-[#0077A3] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeSequence(savedSequence.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <ul className="list-disc list-inside text-gray-300">
                    {savedSequence.drills.map((drill, index) => {
                      const exercise = exercises.find(e => e.id === drill.exerciseId);
                      return (
                        <li key={index} className="text-gray-300">
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