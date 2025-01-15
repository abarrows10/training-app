"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onFrameStep?: (direction: 'forward' | 'backward') => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({ videoRef, onFrameStep }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

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

  const bind = useDrag(({ active, movement: [mx], first, last }) => {
    const video = videoRef.current;
    if (!video) return;

    if (first) setIsDragging(true);

    const scrubber = document.querySelector('.scrubber-container');
    if (!scrubber) return;

    const containerWidth = scrubber.clientWidth;
    const timeChange = (mx / containerWidth) * duration;
    const newTime = Math.max(0, Math.min(currentTime + timeChange, duration));

    if (active) {
      setCurrentTime(newTime);
      video.currentTime = newTime;
    }

    if (last) setIsDragging(false);
  });

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm px-4 py-3">
      {/* Frame counter and scrubber */}
      <div className="relative mb-4">
        <div 
          className="absolute -top-8 px-2 py-1 bg-black/70 rounded text-white text-sm transform -translate-x-1/2"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          {formatTime(currentTime)}
        </div>

        <div className="scrubber-container relative h-12 touch-none select-none">
          {/* Progress bar */}
          <div className="absolute inset-y-0 left-0 bg-[#00A3E0]/30"
               style={{ width: `${(currentTime / duration) * 100}%` }} />
          
          {/* Frame markers */}
          <div className="absolute inset-0 flex items-center">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-4 ${i % 5 === 0 ? 'bg-white/30' : 'bg-white/20'}`}
                style={{ margin: '0 1px' }}
              />
            ))}
          </div>

          {/* Drag handle */}
          <div
            {...bind()}
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-[#00A3E0] rounded-full cursor-pointer"
            style={{
              left: `${(currentTime / duration) * 100}%`,
              touchAction: 'none'
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-2">
        <button 
          onClick={togglePlaybackRate}
          className="text-white text-base px-3 py-1 rounded hover:bg-white/10"
        >
          {playbackRate}x
        </button>

        <button 
          className="text-white p-2 rounded hover:bg-white/10"
        >
          <RefreshCw className="w-7 h-7" />
        </button>

        <button
          onClick={() => stepFrame('backward')}
          className="text-white text-2xl px-4 py-2 rounded hover:bg-white/10"
        >
          ⋘
        </button>

        <button
          onClick={togglePlay}
          className="text-white p-2 rounded-full hover:bg-white/10"
        >
          {isPlaying ? 
            <Pause className="w-10 h-10" /> : 
            <Play className="w-10 h-10" />
          }
        </button>

        <button
          onClick={() => stepFrame('forward')}
          className="text-white text-2xl px-4 py-2 rounded hover:bg-white/10"
        >
          ⋙
        </button>
      </div>
    </div>
  );
};

export default VideoControls;