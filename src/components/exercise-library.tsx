'use client';

import React, { useState, useEffect } from 'react';
import { Exercise } from '@/types/interfaces';
import { Search, Plus, Video, Trash, Edit, X, Check } from 'lucide-react';
import { useStore } from '@/store';
import { useAuth } from '@/context/AuthContext';
import VideoSelector from './Video-Selector';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface NewExercise {
  name: string;
  category: string;
  description: string;
  videoIds: string[];
  coachId: string;
}

const ExerciseLibrary = () => {
  const { user } = useAuth();
  const { exercises, addExercise, categories, removeExercise, updateExercise, linkVideoToExercise, unlinkVideoFromExercise, setExercises } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NewExercise>({
    name: '',
    category: 'Hitting',
    description: '',
    videoIds: [],
    coachId: user?.uid || ''
  });
  const [newExercise, setNewExercise] = useState<NewExercise>({
    name: '',
    category: 'Hitting',
    description: '',
    videoIds: [],
    coachId: user?.uid || ''
  });

  useEffect(() => {
    if (user?.uid) {
      setNewExercise(prev => ({ ...prev, coachId: user.uid }));
      setEditForm(prev => ({ ...prev, coachId: user.uid }));
    }
  }, [user]);

  const handleVideoSelect = (videoId: string, exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    if (exercise.videoIds.includes(videoId)) {
      unlinkVideoFromExercise(videoId, exerciseId);
    } else {
      linkVideoToExercise(videoId, exerciseId);
    }
  };

  const startEdit = (exercise: Exercise) => {
    if (!user?.uid) return;
    setEditingId(exercise.id);
    setEditForm({
      name: exercise.name,
      category: exercise.category,
      description: exercise.description,
      videoIds: exercise.videoIds,
      coachId: user.uid
    });
   };
   
   const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: '',
      category: 'Hitting',
      description: '',
      videoIds: [],
      coachId: user?.uid || ''
    });
   };

  const saveEdit = (id: string) => {
    if (!user?.uid) return;
    updateExercise(id, { ...editForm, coachId: user.uid });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    try {
      const exercise = exercises.find(e => e.id === id);
      if (!exercise) {
        console.error('Could not find exercise');
        return;
      }
  
      console.log('Deleting exercise with ID:', id);
      await removeExercise(id);
      
      const exercisesRef = collection(db, 'exercises');
      const snapshot = await getDocs(exercisesRef);
      const exerciseData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        docId: doc.id,
        name: doc.data().name,
        category: doc.data().category,
        description: doc.data().description,
        videoIds: (doc.data().videoIds || []).map(String)
      })) as Exercise[];
      
      setExercises(exerciseData);
      console.log('Exercise deleted successfully');
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    addExercise({ ...newExercise, coachId: user.uid });
    setNewExercise({
      name: '',
      category: 'Hitting',
      description: '',
      videoIds: [],
      coachId: user.uid
    });
    setShowAddForm(false);
  };

  return (
    <div className="mx-auto max-w-full">
      <div className="bg-[#242526] rounded-xl shadow-lg p-3 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white">Baseball/Softball Drills</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-full md:w-auto bg-[#00A3E0] text-white px-4 py-2 rounded hover:bg-[#0077A3] flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Drill
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-3 md:p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]">
            <form onSubmit={handleAddExercise}>
              <div className="flex flex-col gap-4">
                <input
                  placeholder="Drill name"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                  className="p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                  required
                />
                <select
                  value={newExercise.category}
                  onChange={(e) => setNewExercise({...newExercise, category: e.target.value})}
                  className="p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name} className="bg-[#242526] text-white">
                      {category.name}
                    </option>
                  ))}
                </select>

                <textarea
                  placeholder="Drill description and instructions"
                  value={newExercise.description}
                  onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
                  className="p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                  rows={3}
                  required
                />

                <div>
                  <VideoSelector
                    exerciseId="-1"
                    selectedVideoIds={newExercise.videoIds}
                    onVideoSelect={(videoId) => {
                      setNewExercise(prev => ({
                        ...prev,
                        videoIds: prev.videoIds.includes(videoId)
                          ? prev.videoIds.filter(id => id !== videoId)
                          : [...prev.videoIds, videoId]
                      }));
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="w-full md:w-auto px-4 py-2 border border-[#3A3B3C] rounded hover:bg-[#3A3B3C] text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto px-4 py-2 bg-[#00A3E0] text-white rounded hover:bg-[#0077A3] transition-colors"
                >
                  Add Drill
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search drills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 p-2 w-full bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
            />
          </div>
          <div className="flex flex-col gap-4">
  {/* Mobile Dropdown */}
  <select
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
  className="md:hidden w-full p-2 bg-[#18191A] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
>
  <option value="All">All</option>
  {categories.map(category => (
    <option key={category.id} value={category.name} className="bg-[#242526]">
      {category.name}
    </option>
  ))}
</select>

  {/* Desktop Category Buttons */}
  <div className="hidden md:flex flex-row gap-2 flex-wrap">
  <button
    key="all"
    onClick={() => setSelectedCategory('All')}
    className={`px-4 py-2 rounded text-center transition-colors ${
      selectedCategory === 'All' 
        ? 'bg-[#00A3E0] text-white' 
        : 'border border-[#3A3B3C] text-white hover:bg-[#3A3B3C]'
    }`}
  >
    All
  </button>
  {categories.map(category => (
    <button
      key={category.id}
      onClick={() => setSelectedCategory(category.name)}
      className={`px-4 py-2 rounded text-center transition-colors ${
        selectedCategory === category.name 
          ? 'bg-[#00A3E0] text-white' 
          : 'border border-[#3A3B3C] text-white hover:bg-[#3A3B3C]'
      }`}
    >
      {category.name}
    </button>
  ))}
</div>
</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredExercises.map((exercise) => (
            <div key={exercise.id} className="border border-[#3A3B3C] rounded-lg overflow-hidden bg-[#18191A]">
              <div className="p-3 md:p-4">
                {editingId === exercise.id ? (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none"
                    />
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none"
                      required
                    >
                      <option value="">Select category...</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name} className="bg-[#242526] text-white">
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none"
                      rows={3}
                    />
                    <VideoSelector
                      exerciseId={exercise.id}
                      selectedVideoIds={editForm.videoIds}
                      onVideoSelect={(videoId) => {
                        setEditForm(prev => ({
                          ...prev,
                          videoIds: prev.videoIds.includes(videoId)
                            ? prev.videoIds.filter(id => id !== videoId)
                            : [...prev.videoIds, videoId]
                        }));
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancelEdit}
                        className="text-gray-400 hover:text-white transition-colors p-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => saveEdit(exercise.id)}
                        className="text-[#00A3E0] hover:text-[#0077A3] transition-colors p-2"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white text-base truncate">{exercise.name}</h3>
                        <span className="text-sm text-gray-300 block">{exercise.category}</span>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button 
                          onClick={() => startEdit(exercise)}
                          className="text-[#00A3E0] hover:text-[#0077A3] transition-colors p-2"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(exercise.id)}
                          className="text-red-500 hover:text-red-600 transition-colors p-2"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mt-2 line-clamp-3">{exercise.description}</p>
                    {exercise.videoIds && exercise.videoIds.length > 0 && (
                      <div className="mt-2 flex items-center text-[#00A3E0]">
                        <Video className="w-4 h-4 mr-1" />
                        <span className="text-sm">{exercise.videoIds.length} video(s)</span>
                      </div>
                    )}
                    <VideoSelector
                      exerciseId={exercise.id}
                      selectedVideoIds={exercise.videoIds}
                      onVideoSelect={(videoId) => handleVideoSelect(videoId, exercise.id)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibrary;