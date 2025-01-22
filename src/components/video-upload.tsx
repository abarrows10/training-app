'use client';

import React, { useState } from 'react';
import { X, Play } from 'lucide-react';
import { useStore } from '@/store';
import { useAuth } from '@/context/AuthContext';
import { parseVideoUrl, getVideoThumbnail } from '@/utils/videoUtils';

const VideoUpload = () => {
  const { user } = useAuth();
  const { videos, addVideo, removeVideo, exercises, linkVideoToExercise } = useStore();
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [error, setError] = useState('');

  const completedVideos = videos.filter(v => v.status === 'complete');

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user?.uid) {
      setError('Please log in first');
      return;
    }

    if (!selectedExercise) {
      setError('Please select an exercise first');
      return;
    }

    const { type, videoId } = parseVideoUrl(videoUrl);
    
    if (!type || !videoId) {
      setError('Invalid video URL. Please enter a valid YouTube or Vimeo URL');
      return;
    }

    try {
      const newVideo = {
        title: videoTitle || videoUrl,
        url: videoUrl,
        thumbnail: getVideoThumbnail(type, videoId),
        uploadDate: new Date().toISOString(),
        status: 'complete' as const,
        coachId: user.uid
      };

      const videoId2 = await addVideo(newVideo);
      await linkVideoToExercise(videoId2, selectedExercise);

      setVideoUrl('');
      setVideoTitle('');
      setError('');
    } catch (error) {
      console.error('Error adding video:', error);
      setError('Error adding video. Please try again.');
    }
  };

  const getExerciseName = (videoId: string) => {
    const exercise = exercises.find(e => e.videoIds?.includes(videoId));
    return exercise ? exercise.name : 'Unassigned';
  };

  const getVideoType = (url: string) => {
    const { type } = parseVideoUrl(url);
    return type || 'unknown';
  };

  return (
    <div className="mx-auto max-w-full">
      <div className="bg-[#242526] rounded-xl shadow-lg p-3 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-white">Video Management</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select exercise for the video:
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

        <form onSubmit={handleAddVideo} className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video Title (optional):
            </label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Enter a title for the video"
              className="w-full p-2 border border-[#3A3B3C] rounded-lg text-white bg-[#18191A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video URL:
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube or Vimeo URL here"
              className="w-full p-2 border border-[#3A3B3C] rounded-lg text-white bg-[#18191A]"
              required
            />
            <p className="text-sm text-gray-400 mt-1">
              Supports YouTube videos, Shorts, and Vimeo links
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-500/10 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full md:w-auto bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] transition-colors"
          >
            Add Video
          </button>
        </form>

        {completedVideos.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Video Library</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedVideos.map(video => (
                <div key={video.id} className="border border-[#3A3B3C] rounded-lg p-4 bg-[#18191A]">
                  <div className="flex flex-col gap-4">
                    <div className="relative aspect-video w-full">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button 
                        onClick={() => window.open(video.url, '_blank')}
                        className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-white truncate">
                            {video.title}
                          </div>
                          <div className="text-sm text-gray-400">
                            Assigned to: {getExerciseName(video.id)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Platform: {getVideoType(video.url).charAt(0).toUpperCase() + getVideoType(video.url).slice(1)}
                          </div>
                        </div>
                        <button 
                          onClick={() => removeVideo(video.id)}
                          className="text-gray-400 hover:text-white transition-colors p-2 ml-2 flex-shrink-0"
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