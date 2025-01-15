"use client";

import React from 'react';
import { Play, Pause, StepBack, StepForward, RotateCcw, RotateCw } from 'lucide-react';

interface VideoControlsProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    onFrameStep?: (direction: 'forward' | 'backward') => void;
  }

const VideoControls: React.FC<VideoControlsProps> = ({ videoRef, onFrameStep }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

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

    // Assuming 30fps, adjust frame time accordingly
    const frameTime = 1/30;
    const newTime = direction === 'forward' 
      ? currentTime + frameTime 
      : currentTime - frameTime;

    video.currentTime = Math.max(0, Math.min(newTime, duration));
    onFrameStep?.(direction);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#18191A] p-2 rounded-lg mt-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button 
            onClick={togglePlay}
            className="p-2 hover:bg-[#3A3B3C] rounded-lg text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => stepFrame('backward')}
            className="p-2 hover:bg-[#3A3B3C] rounded-lg text-white transition-colors"
          >
            <StepBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => stepFrame('forward')}
            className="p-2 hover:bg-[#3A3B3C] rounded-lg text-white transition-colors"
          >
            <StepForward className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-white text-sm">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={handleSeek}
        className="w-full accent-[#00A3E0]"
        step="0.001"
      />
    </div>
  );
};

export default VideoControls;