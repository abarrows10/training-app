"use client";

import React from 'react';
import { Play, Plus, Trash } from 'lucide-react';
import { useStore } from '@/store';

interface VideoSelectorProps {
  exerciseId: string;
  selectedVideoIds: string[];
  onVideoSelect: (videoId: string) => void;
}

const VideoSelector: React.FC<VideoSelectorProps> = ({ 
  exerciseId,
  selectedVideoIds, 
  onVideoSelect 
}) => {
  const { videos, exercises } = useStore();
  
  // Find the current exercise
  const currentExercise = exercises.find(e => e.id === exerciseId);
  // Only get videos that belong to this exercise
  const exerciseVideos = videos.filter(video => 
    currentExercise?.videoIds?.includes(video.id)
  );

  if (exerciseVideos.length === 0) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-black mb-2">Exercise Videos</h3>
        <div className="text-gray-500">No videos assigned to this exercise.</div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-black mb-2">Exercise Videos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exerciseVideos.map(video => (
          <div 
            key={video.id} 
            className="border rounded-lg overflow-hidden"
          >
            <div className="relative">
              <img 
                src={video.thumbnail} 
                alt={video.filename}
                className="w-full h-32 object-cover"
              />
              <button 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity"
                onClick={() => window.open(video.url, '_blank')}
              >
                <Play className="w-8 h-8 text-white" />
              </button>
            </div>
            
            <div className="p-2">
              <div className="flex justify-between items-start">
                <div className="text-sm text-black font-medium truncate">
                  {video.filename}
                </div>
                <button
                  onClick={() => onVideoSelect(video.id)}
                  className="p-1 rounded-full text-red-500 hover:text-red-600"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoSelector;