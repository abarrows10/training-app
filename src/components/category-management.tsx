'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash, X, Check } from 'lucide-react';
import { useStore } from '@/store';
import { useAuth } from '@/context/AuthContext';
import { Category } from '@/types/interfaces';

const CategoryManagement = () => {
  const { user } = useAuth();
  const { categories, exercises, addCategory, updateCategory, removeCategory } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<Omit<Category, 'id'>>({
    name: '',
    coachId: user?.uid || '',
    isDefault: false
  });
  const [editForm, setEditForm] = useState<Omit<Category, 'id'>>({
    name: '',
    coachId: user?.uid || '',
    isDefault: false
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    addCategory({ ...newCategory, coachId: user.uid });
    setNewCategory({ name: '', coachId: user.uid, isDefault: false });
    setShowAddForm(false);
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      coachId: category.coachId,
      isDefault: category.isDefault || false
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', coachId: user?.uid || '', isDefault: false });
  };

  const handleEditSave = (id: string) => {
    updateCategory(id, editForm);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const exercisesUsingCategory = exercises.filter(exercise => {
      const category = categories.find(c => c.id === id);
      return category && exercise.category === category.name;
    });

    if (exercisesUsingCategory.length > 0) {
      alert('Cannot delete category that is in use by exercises');
      return;
    }

    try {
      await removeCategory(id);
    } catch (error) {
      console.error('Error removing category:', error);
    }
  };

  return (
    <div className="mx-auto max-w-full">
      <div className="bg-[#242526] rounded-xl shadow-lg p-3 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-white">Categories</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-full md:w-auto bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]">
            <form onSubmit={handleAddCategory}>
              <div className="flex flex-col gap-4">
                <input
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                  required
                />
              </div>
              <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="w-full md:w-auto px-4 py-2 border border-[#3A3B3C] rounded-lg hover:bg-[#3A3B3C] text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border border-[#3A3B3C] rounded-lg p-4 bg-[#18191A]">
              {editingId === category.id ? (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-white transition-colors p-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditSave(category.id)}
                      className="text-[#00A3E0] hover:text-[#0077A3] transition-colors p-2"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white text-lg">{category.name}</h3>
                      <span className="text-sm text-gray-400">
                        {exercises.filter(e => e.category === category.name).length} exercises
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(category)}
                        className="text-[#00A3E0] hover:text-[#0077A3] transition-colors p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="text-red-500 hover:text-red-600 transition-colors p-2"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {categories.length === 0 && !showAddForm && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-8 text-gray-400">
              No categories added yet. Click "Add Category" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;