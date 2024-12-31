"use client";

import React, { useState } from 'react';
import { Plus, Edit, Trash, X, Check } from 'lucide-react';
import { useStore } from '@/store';

interface AthleteForm {
  name: string;
  position: string;
  notes: string;
}

const AthleteManagement = () => {
  const { athletes, addAthlete, updateAthlete, removeAthlete } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newAthlete, setNewAthlete] = useState<AthleteForm>({
    name: '',
    position: '',
    notes: ''
  });
  const [editForm, setEditForm] = useState<AthleteForm>({
    name: '',
    position: '',
    notes: ''
  });

  const handleAddAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    addAthlete(newAthlete);
    setNewAthlete({ name: '', position: '', notes: '' });
    setShowAddForm(false);
  };

  const startEdit = (athlete: any) => {
    setEditingId(athlete.id);
    setEditForm({
      name: athlete.name,
      position: athlete.position,
      notes: athlete.notes
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', position: '', notes: '' });
  };

  const handleEditSave = (id: number) => {
    updateAthlete(id, editForm);
    setEditingId(null);
  };

  return (
    <div>
      <div className="bg-[#242526] rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Athletes</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-[#00A3E0] text-white px-4 py-2 rounded hover:bg-[#0077A3] flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Athlete
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]">
            <form onSubmit={handleAddAthlete}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={newAthlete.name}
                    onChange={(e) => setNewAthlete({...newAthlete, name: e.target.value})}
                    className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Position</label>
                  <input
                    type="text"
                    value={newAthlete.position}
                    onChange={(e) => setNewAthlete({...newAthlete, position: e.target.value})}
                    className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={newAthlete.notes}
                    onChange={(e) => setNewAthlete({...newAthlete, notes: e.target.value})}
                    className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-[#3A3B3C] rounded hover:bg-[#3A3B3C] text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00A3E0] text-white rounded hover:bg-[#0077A3] transition-colors"
                >
                  Add Athlete
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {athletes.map(athlete => (
            <div key={athlete.id} className="border border-[#3A3B3C] rounded-lg p-4 bg-[#18191A]">
              {editingId === athlete.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Position</label>
                    <input
                      type="text"
                      value={editForm.position}
                      onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                      className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Notes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditSave(athlete.id)}
                      className="text-[#00A3E0] hover:text-[#0077A3] transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{athlete.name}</h3>
                      {athlete.position && (
                        <span className="text-sm text-gray-300">{athlete.position}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(athlete)}
                        className="text-[#00A3E0] hover:text-[#0077A3] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeAthlete(athlete.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {athlete.notes && (
                    <p className="text-sm text-gray-300 mt-2">{athlete.notes}</p>
                  )}
                </>
              )}
            </div>
          ))}
          
          {athletes.length === 0 && !showAddForm && (
            <div className="col-span-2 text-center py-8 text-gray-400">
              No athletes added yet. Click "Add Athlete" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AthleteManagement;