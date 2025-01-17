"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onFrameStep?: (direction: 'forward' | 'backward') => void;
  containerWidth?: number;
}

const PLAYBACK_SPEEDS = [2, 1.5, 1, 0.5, 0.25, 0.125];

const VideoControls: React.FC<VideoControlsProps> = ({ 
  videoRef, 
  onFrameStep,
  containerWidth 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const scrubberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => !isDragging && setCurrentTime(video.currentTime);
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
  }, [videoRef, isDragging]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateTimeFromTouch(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      updateTimeFromTouch(e);
    }
  };

  const updateTimeFromTouch = (e: React.TouchEvent) => {
    const video = videoRef.current;
    const scrubber = scrubberRef.current;
    if (!video || !scrubber) return;

    const rect = scrubber.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;

    setCurrentTime(newTime);
    video.currentTime = newTime;
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

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSpeedChange = () => {
    const video = videoRef.current;
    if (!video) return;
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const newSpeed = PLAYBACK_SPEEDS[nextIndex];
    video.playbackRate = newSpeed;
    setPlaybackRate(newSpeed);
  };

  const formatTime = (time: number) => {
    const integerTime = Math.floor(time * 1000);
    return (integerTime / 1000).toFixed(3);
  };

  return (
    <div className={`fixed bottom-0 px-4 py-2 z-50 bg-gradient-to-t from-black/80 to-transparent`}
    style={{ width: containerWidth }}>
      <div className="text-white text-xs mb-1">
        {formatTime(currentTime)}
      </div>
      
      <div
        ref={scrubberRef}
        className="relative h-8"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        <div className="absolute inset-0 flex items-center">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 ${i % 5 === 0 ? 'bg-white/30' : 'bg-white/20'}`}
              style={{ margin: '0 1px' }}
            />
          ))}
        </div>
        
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#00A3E0] rounded-full"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <button 
          onClick={handleSpeedChange}
          className="text-white text-xs px-2"
        >
          {playbackRate}x
        </button>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => stepFrame('backward')}
            className="text-white text-lg px-2"
          >
            ⋘
          </button>

          <button
            onClick={togglePlay}
            className="text-white"
          >
            {isPlaying ? 
              <Pause className="w-6 h-6" /> : 
              <Play className="w-6 h-6" />
            }
          </button>

          <button
            onClick={() => stepFrame('forward')}
            className="text-white text-lg px-2"
          >
            ⋙
          </button>
        </div>

        <div className="w-8" /> {/* Spacer to balance layout */}
      </div>
    </div>
  );
};

export default VideoControls;