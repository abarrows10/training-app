"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

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

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const scrubber = e.currentTarget;
    if (!video || !scrubber) return;

    const rect = scrubber.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    video.currentTime = Math.max(0, Math.min(newTime, duration));
    setCurrentTime(newTime);
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
    <div className="bg-black/80 backdrop-blur-sm px-4 py-4">
      <div className="mb-2 flex justify-between items-center text-sm text-white">
        <div>{formatTime(currentTime)}</div>
        <div>{formatTime(duration)}</div>
      </div>

      <motion.div
        className="relative h-16 touch-action-none"
        onClick={handleScrubberClick}
      >
        {/* Progress Track */}
        <div className="absolute inset-0 bg-white/10 rounded-full" />
        
        {/* Progress Bar */}
        <div 
          className="absolute inset-y-0 left-0 bg-[#00A3E0] rounded-full"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />

        {/* Frame Markers */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 ${i % 5 === 0 ? 'h-3 bg-white/40' : 'h-2 bg-white/20'}`}
              style={{ margin: '0 1px' }}
            />
          ))}
        </div>

        {/* Handle */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          className="absolute top-1/2 -translate-y-1/2 -ml-4 w-8 h-8"
          style={{
            left: `${(currentTime / duration) * 100}%`,
            touchAction: 'none'
          }}
        >
          <div className="w-full h-full bg-[#00A3E0] rounded-full shadow-lg" />
        </motion.div>
      </motion.div>

      <div className="flex items-center justify-between mt-4 px-2">
        <motion.button 
          onClick={togglePlaybackRate}
          className="text-white text-lg font-medium px-4 py-2 rounded-full"
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          {playbackRate}x
        </motion.button>

        <div className="flex items-center gap-6">
          <motion.button
            onClick={() => stepFrame('backward')}
            className="text-white text-2xl px-4 py-2 rounded-full"
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.95 }}
          >
            ⋘
          </motion.button>

          <motion.button
            onClick={togglePlay}
            className="text-white p-3 rounded-full bg-[#00A3E0]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? 
              <Pause className="w-8 h-8" /> : 
              <Play className="w-8 h-8" />
            }
          </motion.button>

          <motion.button
            onClick={() => stepFrame('forward')}
            className="text-white text-2xl px-4 py-2 rounded-full"
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.95 }}
          >
            ⋙
          </motion.button>
        </div>

        <motion.button 
          className="text-white p-2 rounded-full"
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
};

export default VideoControls;