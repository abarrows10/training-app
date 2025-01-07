"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Video, Trash, Edit, X, Check } from 'lucide-react';
import { useStore } from '@/store';
import VideoSelector from '../components/Video-Selector';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface NewExercise {
  name: string;
  category: string;
  description: string;
  videoIds: number[];
}

interface Exercise {
  id: number;
  name: string;
  category: string;
  description: string;
  videoIds: number[];
}

const ExerciseLibrary = () => {
  const { exercises, addExercise, removeExercise, updateExercise, linkVideoToExercise, unlinkVideoFromExercise, setExercises } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<NewExercise>({
    name: '',
    category: 'Hitting',
    description: '',
    videoIds: []
  });
  const [newExercise, setNewExercise] = useState<NewExercise>({
    name: '',
    category: 'Hitting',
    description: '',
    videoIds: []
  });

  useEffect(() => {
    console.log('Loaded exercises:', exercises);
  }, [exercises]);

  const categories = ['All', 'Hitting', 'Fielding', 'Throwing', 'Pitching', 'Band Exercises', 'Speed & Agility'];

  const handleVideoSelect = (videoId: number, exerciseId: number) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    if (exercise.videoIds.includes(videoId)) {
      unlinkVideoFromExercise(videoId, exerciseId);
    } else {
      linkVideoToExercise(videoId, exerciseId);
    }
  };

  const startEdit = (exercise: any) => {
    setEditingId(exercise.id);
    setEditForm({
      name: exercise.name,
      category: exercise.category,
      description: exercise.description,
      videoIds: exercise.videoIds || []
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: '',
      category: 'Hitting',
      description: '',
      videoIds: []
    });
  };

  const saveEdit = (id: number) => {
    updateExercise(id, editForm);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    try {
      console.log('Type of id:', typeof id);
      console.log('Original id:', id);
      const numericId = Number(id);
      console.log('Converted numericId:', numericId);
      await removeExercise(numericId);
      
      const exercisesRef = collection(db, 'exercises');
      const snapshot = await getDocs(exercisesRef);
      const exerciseData = snapshot.docs.map(doc => {
        console.log('Doc ID:', doc.id, 'Doc data:', doc.data());
        return {
          ...doc.data(),
          id: Number(doc.id)
        };
      }) as Exercise[];
      setExercises(exerciseData);
      
      console.log('Exercise deleted successfully');
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    console.log('Exercise being filtered:', exercise);
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    addExercise(newExercise);
    setNewExercise({
      name: '',
      category: 'Hitting',
      description: '',
      videoIds: []
    });
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="bg-[#242526] rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Baseball/Softball Drills</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-[#00A3E0] text-white px-4 py-2 rounded hover:bg-[#0077A3] flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Drill
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]">
            <form onSubmit={handleAddExercise}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                >
                  {categories.filter(cat => cat !== 'All').map(category => (
                    <option key={category} value={category} className="bg-[#242526] text-white">{category}</option>
                  ))}
                </select>

                <textarea
                  placeholder="Drill description and instructions"
                  value={newExercise.description}
                  onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
                  className="p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white md:col-span-2 focus:border-[#00A3E0] focus:outline-none transition-colors"
                  rows={3}
                  required
                />

                <div className="md:col-span-2">
                  <VideoSelector
                    exerciseId={-1}
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
              <div className="flex justify-end gap-2">
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
                  Add Drill
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search drills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 p-2 w-full bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded whitespace-nowrap transition-colors ${
                  selectedCategory === category 
                    ? 'bg-[#00A3E0] text-white' 
                    : 'border border-[#3A3B3C] text-white hover:bg-[#3A3B3C]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => {
            console.log('Exercise in render:', exercise);
            return (
              <div key={exercise.id} className="border border-[#3A3B3C] rounded-lg overflow-hidden bg-[#18191A]">
                <div className="p-4">
                  {editingId === exercise.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                      />
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
                      >
                        {categories.filter(cat => cat !== 'All').map(category => (
                          <option key={category} value={category} className="bg-[#242526] text-white">{category}</option>
                        ))}
                      </select>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded text-white focus:border-[#00A3E0] focus:outline-none transition-colors"
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
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => saveEdit(exercise.id)}
                          className="text-[#00A3E0] hover:text-[#0077A3] transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-white">{exercise.name}</h3>
                          <span className="text-sm text-gray-300">{exercise.category}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => startEdit(exercise)}
                            className="text-[#00A3E0] hover:text-[#0077A3] transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              console.log('Delete clicked, exercise id:', exercise.id);
                              handleDelete(exercise.id);
                            }}
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mt-2">{exercise.description}</p>
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibrary;