"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

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

 const handleScrubberTouch = (e: React.TouchEvent | React.MouseEvent) => {
   const video = videoRef.current;
   const scrubber = scrubberRef.current;
   if (!video || !scrubber) return;

   const rect = scrubber.getBoundingClientRect();
   const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
   const x = clientX - rect.left;
   const percent = Math.max(0, Math.min(1, x / rect.width));
   const newTime = percent * duration;

   setCurrentTime(newTime);
   video.currentTime = newTime;
 };

 const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
   setIsDragging(true);
   handleScrubberTouch(e);
 };

 const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
   if (isDragging) {
     e.preventDefault();
     handleScrubberTouch(e);
   }
 };

 const handleTouchEnd = () => {
   setIsDragging(false);
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
   <div className="bg-black/50 backdrop-blur-sm px-4 py-3">
     <div className="relative mb-4">
       <div 
         className="absolute -top-8 px-2 py-1 bg-black/70 rounded text-white text-sm transform -translate-x-1/2"
         style={{ left: `${(currentTime / duration) * 100}%` }}
       >
         {formatTime(currentTime)}
       </div>

       <div 
         ref={scrubberRef}
         className="scrubber-container relative h-12 touch-none select-none"
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
         onMouseDown={handleTouchStart}
         onMouseMove={handleTouchMove}
         onMouseUp={handleTouchEnd}
         onMouseLeave={handleTouchEnd}
       >
         <div 
           className="absolute inset-y-0 left-0 bg-[#00A3E0]/30"
           style={{ width: `${(currentTime / duration) * 100}%` }} 
         />
         
         <div className="absolute inset-0 flex items-center">
           {Array.from({ length: 30 }).map((_, i) => (
             <div
               key={i}
               className={`flex-1 h-4 ${i % 5 === 0 ? 'bg-white/30' : 'bg-white/20'}`}
               style={{ margin: '0 1px' }}
             />
           ))}
         </div>

         <div
           className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-[#00A3E0] rounded-full cursor-pointer"
           style={{
             left: `${(currentTime / duration) * 100}%`,
             touchAction: 'none'
           }}
         />
       </div>
     </div>

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