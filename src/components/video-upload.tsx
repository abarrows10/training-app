"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, Play } from 'lucide-react';
import { useStore } from '@/store';
import { Video } from '@/types/interfaces';

const VideoUpload = () => {
  const { videos, addVideo, updateVideoStatus, removeVideo, exercises, linkVideoToExercise } = useStore();
  const [dragActive, setDragActive] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeUploads = videos.filter(v => v.status === 'uploading');
  const completedVideos = videos.filter(v => v.status === 'complete');

  const handleFiles = async (files: File[]) => {
    if (!selectedExercise) {
      alert('Please select an exercise first');
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('video/')) {
        alert('Please upload only video files');
        continue;
      }

      try {
        const url = URL.createObjectURL(file);
        const thumbnail = '/api/placeholder/320/180';

        const videoId = await addVideo({
          filename: file.name,
          url: url,
          thumbnail,
          uploadDate: new Date().toISOString(),
          status: 'uploading'
        });

        // Link video to exercise immediately
        await linkVideoToExercise(videoId, selectedExercise);

        // Simulate upload completion
        setTimeout(() => {
          updateVideoStatus(videoId, 'complete');
        }, 1500);

      } catch (error) {
        console.error('Error processing video:', error);
        alert('Error uploading video. Please try again.');
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  // Get exercise name for a video
  const getExerciseName = (videoId: string) => {
    const exercise = exercises.find(e => e.videoIds?.includes(videoId));
    return exercise ? exercise.name : 'Unassigned';
  };

  return (
    <div>
      <div className="bg-[#242526] rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">Video Management</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select exercise for upload:
          </label>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full p-2 border border-[#3A3B3C] rounded-lg text-white bg-[#18191A]"
            required
          >
            <option value="">Select an exercise...</option>
            {exercises.map(exercise => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name} ({exercise.category})
              </option>
            ))}
          </select>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 ${
            dragActive ? 'border-[#00A3E0] bg-[#18191A]' : 'border-[#3A3B3C]'
          }`}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <div className="text-lg font-medium mb-2 text-white">
            Drag and drop video files here
          </div>
          <div className="text-sm mb-4 text-gray-300">
            Or click to select files from your computer
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFiles(Array.from(e.target.files || []))}
            multiple
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border border-[#3A3B3C] rounded-lg hover:bg-[#3A3B3C] text-white transition-colors"
          >
            Select Files
          </button>
        </div>

        {activeUploads.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Active Uploads</h3>
            <div className="space-y-4">
              {activeUploads.map(video => (
                <div key={video.id} className="border border-[#3A3B3C] rounded-lg p-4 bg-[#18191A]">
                  <div className="flex gap-4">
                    <div className="relative w-40 h-24 flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.filename}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-white">{video.filename}</div>
                          <div className="text-sm text-gray-400">
                            {getExerciseName(video.id)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-[#3A3B3C] rounded-full h-2">
                        <div
                          className="bg-[#00A3E0] h-2 rounded-full transition-all duration-300"
                          style={{ width: '50%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

{completedVideos.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Video Library</h3>
            <div className="space-y-4">
              {completedVideos.map(video => (
                <div key={video.id} className="border border-[#3A3B3C] rounded-lg p-4 bg-[#18191A]">
                  <div className="flex gap-4">
                    <div className="relative w-40 h-24 flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.filename}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button 
                        onClick={() => window.open(video.url, '_blank')}
                        className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-white">{video.filename}</div>
                          <div className="text-sm text-gray-400">
                            Assigned to: {getExerciseName(video.id)}
                          </div>
                        </div>
                        <button 
                          onClick={() => removeVideo(video.id)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUpload;