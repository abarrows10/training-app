"use client";

import React, { useState, useRef, useEffect } from 'react';
import VideoAnalysisUploader from './VideoAnalysisUploader';
import VideoControls from './VideoControls';
import DrawingCanvas from './DrawingCanvas';
import { motion } from 'framer-motion';

interface VideoState {
  file: File | null;
  url: string | null;
}

const SplitPlayer = () => {
  const [leftVideo, setLeftVideo] = useState<VideoState>({ file: null, url: null });
  const [rightVideo, setRightVideo] = useState<VideoState>({ file: null, url: null });
  const [isSynced, setIsSynced] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setCanvasDimensions({ width: width / 2, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleFileSelect = (file: File, side: 'left' | 'right') => {
    const url = URL.createObjectURL(file);
    if (side === 'left') {
      setLeftVideo({ file, url });
    } else {
      setRightVideo({ file, url });
    }
  };

  const handleSync = () => {
    const newSyncState = !isSynced;
    setIsSynced(newSyncState);
    
    if (newSyncState && leftVideoRef.current && rightVideoRef.current) {
      rightVideoRef.current.currentTime = leftVideoRef.current.currentTime;
      rightVideoRef.current.playbackRate = leftVideoRef.current.playbackRate;
      
      if (!leftVideoRef.current.paused) {
        rightVideoRef.current.play();
      }
    }
  };

  const handleVideoTimeUpdate = (mainVideo: HTMLVideoElement | null, syncedVideo: HTMLVideoElement | null) => {
    if (isSynced && mainVideo && syncedVideo) {
      syncedVideo.currentTime = mainVideo.currentTime;
    }
  };

  const handleVideoPlay = (mainVideo: HTMLVideoElement | null, syncedVideo: HTMLVideoElement | null) => {
    if (isSynced && mainVideo && syncedVideo) {
      syncedVideo.currentTime = mainVideo.currentTime;
      syncedVideo.playbackRate = mainVideo.playbackRate;
      syncedVideo.play();
    }
  };

  const handleVideoPause = (syncedVideo: HTMLVideoElement | null) => {
    if (isSynced && syncedVideo) {
      syncedVideo.pause();
    }
  };

  const handlePlaybackRateChange = (mainVideo: HTMLVideoElement | null, syncedVideo: HTMLVideoElement | null) => {
    if (isSynced && mainVideo && syncedVideo) {
      syncedVideo.playbackRate = mainVideo.playbackRate;
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col h-screen">
      <div ref={containerRef} className="flex-1 flex flex-row pb-32">
        <div className="flex-1 relative">
          {!leftVideo.url ? (
            <VideoAnalysisUploader onFileSelect={(file) => handleFileSelect(file, 'left')} side="left" />
          ) : (
            <motion.div 
              className="h-full relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <video
                ref={leftVideoRef}
                src={leftVideo.url}
                className="absolute inset-0 w-full h-full object-contain"
                playsInline
                onPlay={() => handleVideoPlay(leftVideoRef.current, rightVideoRef.current)}
                onPause={() => handleVideoPause(rightVideoRef.current)}
                onTimeUpdate={() => handleVideoTimeUpdate(leftVideoRef.current, rightVideoRef.current)}
                onRateChange={() => handlePlaybackRateChange(leftVideoRef.current, rightVideoRef.current)}
              />
              {canvasDimensions.width > 0 && (
                <DrawingCanvas width={canvasDimensions.width} height={canvasDimensions.height} />
              )}
              <div className="absolute bottom-0 left-0 right-0 z-10">
                <VideoControls videoRef={leftVideoRef} />
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex-1 relative">
          {!rightVideo.url ? (
            <VideoAnalysisUploader onFileSelect={(file) => handleFileSelect(file, 'right')} side="right" />
          ) : (
            <motion.div 
              className="h-full relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <video
                ref={rightVideoRef}
                src={rightVideo.url}
                className="absolute inset-0 w-full h-full object-contain"
                playsInline
                onPlay={() => handleVideoPlay(rightVideoRef.current, leftVideoRef.current)}
                onPause={() => handleVideoPause(leftVideoRef.current)}
                onTimeUpdate={() => handleVideoTimeUpdate(rightVideoRef.current, leftVideoRef.current)}
                onRateChange={() => handlePlaybackRateChange(rightVideoRef.current, leftVideoRef.current)}
              />
              {canvasDimensions.width > 0 && (
                <DrawingCanvas width={canvasDimensions.width} height={canvasDimensions.height} />
              )}
              <div className="absolute bottom-0 left-0 right-0 z-10">
                <VideoControls videoRef={rightVideoRef} />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {(leftVideo.url || rightVideo.url) && (
        <div className="fixed bottom-38 left-1/2 -translate-x-1/2 z-50">
          <motion.button
            onClick={handleSync}
            className={`px-6 py-2 rounded-full text-sm font-medium ${
              isSynced 
                ? 'bg-yellow-400 text-black' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {isSynced ? 'SYNCED' : 'SYNC'}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default SplitPlayer;