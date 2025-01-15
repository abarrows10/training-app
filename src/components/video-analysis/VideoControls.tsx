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
  
  const x = useMotionValue(0);
  const progress = useTransform(x, [-100, 100], [-0.5, 0.5]);

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

  useEffect(() => {
    const updateVideoTime = () => {
      const video = videoRef.current;
      if (!video || !isDragging) return;

      const newTime = currentTime + progress.get() * duration;
      video.currentTime = Math.max(0, Math.min(newTime, duration));
    };

    progress.onChange(updateVideoTime);
  }, [progress, duration, currentTime, isDragging, videoRef]);

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
      <div className="relative mb-4">
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -top-8 px-2 py-1 bg-black/70 rounded text-white text-sm transform -translate-x-1/2"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              {formatTime(currentTime)}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative h-12">
          {/* Progress bar */}
          <div 
            className="absolute inset-y-0 left-0 bg-[#00A3E0]/30"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          
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

          {/* Draggable handle */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            style={{ x }}
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-[#00A3E0] rounded-full cursor-pointer"
            whileDrag={{ scale: 1.2 }}
            whileHover={{ scale: 1.1 }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <motion.button 
          onClick={togglePlaybackRate}
          className="text-white text-base px-3 py-1 rounded"
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          {playbackRate}x
        </motion.button>

        <motion.button 
          className="text-white p-2 rounded"
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-7 h-7" />
        </motion.button>

        <motion.button
          onClick={() => stepFrame('backward')}
          className="text-white text-2xl px-4 py-2 rounded"
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          ⋘
        </motion.button>

        <motion.button
          onClick={togglePlay}
          className="text-white p-2 rounded-full"
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? 
            <Pause className="w-10 h-10" /> : 
            <Play className="w-10 h-10" />
          }
        </motion.button>

        <motion.button
          onClick={() => stepFrame('forward')}
          className="text-white text-2xl px-4 py-2 rounded"
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          ⋙
        </motion.button>
      </div>
    </div>
  );
};

export default VideoControls;