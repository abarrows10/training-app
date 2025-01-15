"use client";

import React from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onFrameStep?: (direction: 'forward' | 'backward') => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({ videoRef, onFrameStep }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [playbackRate, setPlaybackRate] = React.useState(1);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const updatePlayState = () => setIsPlaying(!video.paused);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', updatePlayState);
    video.addEventListener('pause', updatePlayState);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', updatePlayState);
      video.removeEventListener('pause', updatePlayState);
    };
  }, [videoRef]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const stepFrame = (direction: 'forward' | 'backward') => {
    const video = videoRef.current;
    if (!video) return;
    const frameTime = 1/30;
    const newTime = direction === 'forward' 
      ? currentTime + frameTime 
      : currentTime - frameTime;
    video.currentTime = Math.max(0, Math.min(newTime, duration));
    onFrameStep?.(direction);
  };

  const togglePlaybackRate = () => {
    const video = videoRef.current;
    if (!video) return;
    const rates = [0.25, 0.5, 1, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    video.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm px-4 py-3">
      {/* Scrubber and Frame Counter */}
      <div className="relative mb-3">
        <div className="absolute -top-6 text-white text-sm px-2 py-0.5 bg-black/70 rounded"
             style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translateX(-50%)' }}>
          {currentTime.toFixed(3)}
        </div>
        
        <div className="relative h-8">
          <div className="absolute inset-0 flex items-center">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-4 ${i % 5 === 0 ? 'bg-white' : 'bg-gray-600'}`}
                style={{ margin: '0 1px' }}
              />
            ))}
          </div>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => {
              const video = videoRef.current;
              if (!video) return;
              video.currentTime = Number(e.target.value);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-2">
        <button 
          onClick={togglePlaybackRate}
          className="text-white text-sm px-3 py-1"
        >
          {playbackRate}x
        </button>

        <button 
          onClick={() => {}}
          className="text-white p-2"
        >
          <RefreshCw className="w-6 h-6" />
        </button>

        <button
          onClick={() => stepFrame('backward')}
          className="text-white text-2xl px-4 py-2"
        >
          ⋘
        </button>

        <button
          onClick={togglePlay}
          className="text-white p-2"
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </button>

        <button
          onClick={() => stepFrame('forward')}
          className="text-white text-2xl px-4 py-2"
        >
          ⋙
        </button>
      </div>
    </div>
  );
};

export default VideoControls;