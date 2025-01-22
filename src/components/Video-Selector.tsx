"use client";

import React from 'react';
import { Play, Trash } from 'lucide-react';
import { useStore } from '@/store';
import { parseVideoUrl } from '@/utils/videoUtils';

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
  
  const currentExercise = exercises.find(e => e.id === exerciseId);
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

  const getVideoType = (url: string) => {
    const { type } = parseVideoUrl(url);
    return type || 'unknown';
  };

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
                alt={video.title}
                className="w-full h-32 object-cover"
              />
              <button 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity"
                onClick={() => window.open(video.url, '_blank')}
              >
                <Play className="w-8 h-8 text-white" />
              </button>
              <div className="absolute top-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs text-white">
                {getVideoType(video.url)}
              </div>
            </div>
            
            <div className="p-2">
              <div className="flex justify-between items-start">
                <div className="text-sm text-black font-medium truncate flex-1 pr-2">
                  {video.title}
                </div>
                <button
                  onClick={() => onVideoSelect(video.id)}
                  className="p-1 rounded-full text-red-500 hover:text-red-600 flex-shrink-0"
                  title="Remove video"
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