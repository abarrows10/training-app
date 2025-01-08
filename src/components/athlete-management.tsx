"use client";

import React, { useState } from 'react';
import { Plus, Edit, Trash, X, Check } from 'lucide-react';
import { useStore } from '@/store';
import { Athlete } from '@/types/interfaces';

interface AthleteForm {
  name: string;
  position: string;
  notes: string;
}

const AthleteManagement = () => {
  const { athletes, addAthlete, updateAthlete, removeAthlete } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const startEdit = (athlete: Athlete) => {
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

  const handleEditSave = (id: string) => {
    updateAthlete(id, editForm);
    setEditingId(null);
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Athletes</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Athlete
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <form onSubmit={handleAddAthlete}>
              <div className="space-y-4">
                <div>
                  <label className="block text-black mb-1">Name</label>
                  <input
                    type="text"
                    value={newAthlete.name}
                    onChange={(e) => setNewAthlete({...newAthlete, name: e.target.value})}
                    className="w-full p-2 border rounded text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-black mb-1">Position</label>
                  <input
                    type="text"
                    value={newAthlete.position}
                    onChange={(e) => setNewAthlete({...newAthlete, position: e.target.value})}
                    className="w-full p-2 border rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-black mb-1">Notes</label>
                  <textarea
                    value={newAthlete.notes}
                    onChange={(e) => setNewAthlete({...newAthlete, notes: e.target.value})}
                    className="w-full p-2 border rounded text-black"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50 text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Athlete
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {athletes.map(athlete => (
            <div key={athlete.id} className="border rounded-lg p-4">
              {editingId === athlete.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-black mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full p-2 border rounded text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-black mb-1">Position</label>
                    <input
                      type="text"
                      value={editForm.position}
                      onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                      className="w-full p-2 border rounded text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-black mb-1">Notes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      className="w-full p-2 border rounded text-black"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEdit}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditSave(athlete.id)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-black">{athlete.name}</h3>
                      {athlete.position && (
                        <span className="text-sm text-black">{athlete.position}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(athlete)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeAthlete(athlete.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {athlete.notes && (
                    <p className="text-sm text-black mt-2">{athlete.notes}</p>
                  )}
                </>
              )}
            </div>
          ))}
          
          {athletes.length === 0 && !showAddForm && (
            <div className="col-span-2 text-center py-8 text-black">
              No athletes added yet. Click "Add Athlete" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AthleteManagement;