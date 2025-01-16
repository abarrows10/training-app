"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Pen, Download, X } from 'lucide-react';
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
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftCanvasRef = useRef<any>(null);
  const rightCanvasRef = useRef<any>(null);

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

  const removeVideo = (side: 'left' | 'right') => {
    if (side === 'left') {
      if (leftVideo.url) URL.revokeObjectURL(leftVideo.url);
      setLeftVideo({ file: null, url: null });
    } else {
      if (rightVideo.url) URL.revokeObjectURL(rightVideo.url);
      setRightVideo({ file: null, url: null });
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

  const handleSave = async () => {
    try {
      const exportData: any = {
        timestamp: new Date().toISOString(),
        syncEnabled: isSynced
      };

      if (leftVideo.url) {
        const leftVideoBlob = await fetch(leftVideo.url).then(r => r.blob());
        exportData.leftVideo = {
          blob: leftVideoBlob,
          drawings: leftCanvasRef.current?.getDrawings()
        };
      }

      if (rightVideo.url) {
        const rightVideoBlob = await fetch(rightVideo.url).then(r => r.blob());
        exportData.rightVideo = {
          blob: rightVideoBlob,
          drawings: rightCanvasRef.current?.getDrawings()
        };
      }

      const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'video-analysis.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving analysis:', error);
      alert('Failed to save analysis. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col h-screen">
      {/* Top Navigation */}
      <div className="fixed top-4 left-0 right-0 flex justify-between items-center px-4 z-50">
        <motion.button
          onClick={() => setShowDrawingTools(!showDrawingTools)}
          className="p-2 rounded-full bg-black/50 text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Pen className={showDrawingTools ? 'text-yellow-400' : 'text-white'} />
        </motion.button>

        {(leftVideo.url || rightVideo.url) && (
          <motion.button
            onClick={handleSave}
            className="p-2 rounded-full bg-black/50 text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Download className="w-6 h-6" />
          </motion.button>
        )}
      </div>

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
              {canvasDimensions.width > 0 && showDrawingTools && (
                <DrawingCanvas 
                  ref={leftCanvasRef}
                  width={canvasDimensions.width} 
                  height={canvasDimensions.height} 
                />
              )}
              <button
                onClick={() => removeVideo('left')}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white"
              >
                <X className="w-6 h-6" />
              </button>
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
              {canvasDimensions.width > 0 && showDrawingTools && (
                <DrawingCanvas 
                  ref={rightCanvasRef}
                  width={canvasDimensions.width} 
                  height={canvasDimensions.height} 
                />
              )}
              <button
                onClick={() => removeVideo('right')}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 z-10">
                <VideoControls videoRef={rightVideoRef} />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {(leftVideo.url || rightVideo.url) && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50">
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