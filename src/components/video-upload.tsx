"use client";

import React, { useState } from 'react';
import { X, Play } from 'lucide-react';
import { useStore } from '@/store';

const VideoUpload = () => {
  const { videos, addVideo, removeVideo, exercises, linkVideoToExercise } = useStore();
  const [selectedExercise, setSelectedExercise] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState('');

  const completedVideos = videos.filter(v => v.status === 'complete');

  const getVideoThumbnail = (url: string) => {
    // YouTube formats
    const youtubeId = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([^&\?]+)/)?.[1];
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }

    // Vimeo format - use placeholder since we can't easily get the thumbnail
    const vimeoMatch = url.match(/vimeo\.com/);
    if (vimeoMatch) {
      return '/api/placeholder/320/180';
    }

    return '/api/placeholder/320/180';
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) {
      alert('Please select an exercise first');
      return;
    }

    if (!videoUrl) {
      alert('Please enter a video URL');
      return;
    }

    // Validate URL format
    if (!videoUrl.match(/youtube\.com|youtu\.be|vimeo\.com/)) {
      alert('Please enter a valid YouTube or Vimeo URL');
      return;
    }

    try {
      const videoId = await addVideo({
        filename: `Video ${new Date().toLocaleString()}`,
        url: videoUrl,
        thumbnail: getVideoThumbnail(videoUrl),
        uploadDate: new Date().toISOString(),
        status: 'complete'
      });

      await linkVideoToExercise(videoId, selectedExercise);
      setVideoUrl('');
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Error adding video. Please try again.');
    }
  };

  const getExerciseName = (videoId: number) => {
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
            onChange={(e) => setSelectedExercise(Number(e.target.value))}
            className="w-full p-2 border border-[#3A3B3C] rounded-lg text-white bg-[#18191A]"
            required
          >
            <option value={0}>Select an exercise...</option>
            {exercises.map(exercise => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name} ({exercise.category})
              </option>
            ))}
          </select>
        </div>
        
        <form onSubmit={handleVideoSubmit} className="mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video URL:
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter YouTube or Vimeo URL..."
                className="w-full p-2 border border-[#3A3B3C] rounded-lg text-white bg-[#18191A]"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full px-4 py-2 bg-[#00A3E0] text-white rounded-lg hover:bg-[#0077A3] transition-colors"
            >
              Add Video
            </button>
          </div>
        </form>

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
                        className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white hover:bg-opacity-70"
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