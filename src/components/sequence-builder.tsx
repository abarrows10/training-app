"use client";

import React, { useState } from 'react';
import { Plus, Save, Trash, ArrowUp, ArrowDown, Edit, X, Check } from 'lucide-react';
import { useStore } from '@/store';

interface SequenceDrill {
  id: number;
  exerciseId: number;
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSequence, setEditSequence] = useState<SequenceForm>({
    name: '',
    drills: []
  });

  const addDrill = () => {
    setSequence(prev => ({
      ...prev,
      drills: [...prev.drills, { id: Date.now(), exerciseId: 0 }]
    }));
  };

  const addDrillToEdit = () => {
    setEditSequence(prev => ({
      ...prev,
      drills: [...prev.drills, { id: Date.now(), exerciseId: 0 }]
    }));
  };

  const updateDrill = (index: number, exerciseId: number) => {
    const newDrills = [...sequence.drills];
    newDrills[index] = { ...newDrills[index], exerciseId };
    setSequence(prev => ({ ...prev, drills: newDrills }));
  };

  const updateEditDrill = (index: number, exerciseId: number) => {
    const newDrills = [...editSequence.drills];
    newDrills[index] = { ...newDrills[index], exerciseId };
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
    if (sequence.drills.some(drill => drill.exerciseId === 0)) {
      alert('Please select a drill for each item');
      return;
    }
    addSequence(sequence);
    setSequence({ name: '', drills: [] });
  };

  const startEdit = (sequence: any) => {
    setEditingId(sequence.id);
    setEditSequence({
      name: sequence.name,
      drills: [...sequence.drills]
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSequence({ name: '', drills: [] });
  };

  const saveEdit = (id: number) => {
    if (!editSequence.name.trim()) {
      alert('Please add a sequence name');
      return;
    }
    if (editSequence.drills.length === 0) {
      alert('Please add at least one drill');
      return;
    }
    if (editSequence.drills.some(drill => drill.exerciseId === 0)) {
      alert('Please select a drill for each item');
      return;
    }
    removeSequence(id);
    addSequence(editSequence);
    setEditingId(null);
    setEditSequence({ name: '', drills: [] });
  };

  const getExerciseName = (exerciseId: number) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    return exercise ? exercise.name : '';
  };

  const renderWorkoutForm = (
    currentSequence: SequenceForm,
    isEditing: boolean = false,
    onSave: () => void
  ) => (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isEditing ? 'Edit Sequence' : 'Drill Sequence Builder'}
          </h2>
          <input
            type="text"
            placeholder="Sequence Name (e.g., Basic Hitting Sequence)"
            value={currentSequence.name}
            onChange={(e) => {
              const setFunction = isEditing ? setEditSequence : setSequence;
              setFunction(prev => ({ ...prev, name: e.target.value }));
            }}
            className="p-2 w-full md:w-96 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
          />
        </div>
        <button 
          onClick={() => isEditing ? addDrillToEdit() : addDrill()}
          className="bg-[#00A3E0] text-white px-4 py-2 rounded hover:bg-[#0077A3] flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Drill
        </button>
      </div>

      <div className="space-y-4">
        {currentSequence.drills.map((drill, index) => (
          <div 
            key={drill.id}
            className="p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex md:flex-col gap-2">
                <button
                  onClick={() => moveDrill(index, 'up', isEditing)}
                  disabled={index === 0}
                  className={`text-gray-400 hover:text-white transition-colors ${index === 0 ? 'opacity-50' : ''}`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveDrill(index, 'down', isEditing)}
                  disabled={index === currentSequence.drills.length - 1}
                  className={`text-gray-400 hover:text-white transition-colors ${
                    index === currentSequence.drills.length - 1 ? 'opacity-50' : ''
                  }`}
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              <select
                value={drill.exerciseId}
                onChange={(e) => isEditing ? updateEditDrill(index, Number(e.target.value)) : updateDrill(index, Number(e.target.value))}
                className="flex-1 p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
              >
                <option value={0} className="bg-[#242526] text-white">Select a drill...</option>
                {exercises.map(exercise => (
                  <option key={exercise.id} value={exercise.id} className="bg-[#242526] text-white">
                    {exercise.name} ({exercise.category})
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => isEditing ? removeEditDrill(index) : removeDrill(index)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {currentSequence.drills.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Click "Add Drill" to start building your sequence
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
          {isEditing ? 'Save Changes' : 'Save Sequence'}
        </button>
      </div>
    </>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#242526] rounded-xl shadow-lg p-6">
        {editingId ? (
          renderWorkoutForm(editSequence, true, () => saveEdit(editingId))
        ) : (
          <>
            {renderWorkoutForm(sequence, false, handleSave)}

            {sequences.length > 0 && (
              <div className="mt-8 border-t border-[#3A3B3C] pt-6">
                <h3 className="text-xl font-bold text-white mb-4">Saved Sequences</h3>
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
                        {savedSequence.drills.map((drill, index) => (
                          <li key={index} className="text-gray-300">
                            {getExerciseName(drill.exerciseId)}
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

export default SequenceBuilder;