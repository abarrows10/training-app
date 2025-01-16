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
  const [syncOffsets, setSyncOffsets] = useState({ left: 0, right: 0 });
  
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
      setIsSynced(false);
    } else {
      if (rightVideo.url) URL.revokeObjectURL(rightVideo.url);
      setRightVideo({ file: null, url: null });
      setIsSynced(false);
    }
  };

  const handleSync = () => {
    const newSyncState = !isSynced;
    setIsSynced(newSyncState);
    
    if (newSyncState && leftVideoRef.current && rightVideoRef.current) {
      // Store the current times when syncing
      setSyncOffsets({
        left: leftVideoRef.current.currentTime,
        right: rightVideoRef.current.currentTime
      });
    }
  };

  const handleVideoTimeUpdate = (source: 'left' | 'right') => {
    if (!isSynced) return;

    const mainVideo = source === 'left' ? leftVideoRef.current : rightVideoRef.current;
    const syncedVideo = source === 'left' ? rightVideoRef.current : leftVideoRef.current;
    
    if (!mainVideo || !syncedVideo) return;

    const timeDiff = source === 'left' 
      ? syncOffsets.right - syncOffsets.left
      : syncOffsets.left - syncOffsets.right;

    syncedVideo.currentTime = mainVideo.currentTime + timeDiff;
  };

  const handleVideoPlay = (source: 'left' | 'right') => {
    if (!isSynced) return;

    const syncedVideo = source === 'left' ? rightVideoRef.current : leftVideoRef.current;
    if (syncedVideo) {
      syncedVideo.play();
    }
  };

  const handleVideoPause = (source: 'left' | 'right') => {
    if (!isSynced) return;

    const syncedVideo = source === 'left' ? rightVideoRef.current : leftVideoRef.current;
    if (syncedVideo) {
      syncedVideo.pause();
    }
  };

  const handlePlaybackRateChange = (source: 'left' | 'right') => {
    if (!isSynced) return;

    const mainVideo = source === 'left' ? leftVideoRef.current : rightVideoRef.current;
    const syncedVideo = source === 'left' ? rightVideoRef.current : leftVideoRef.current;
    
    if (mainVideo && syncedVideo) {
      syncedVideo.playbackRate = mainVideo.playbackRate;
    }
  };

  const handleSave = async () => {
    try {
      const exportData: any = {
        timestamp: new Date().toISOString(),
        syncEnabled: isSynced,
        syncOffsets: isSynced ? syncOffsets : null
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
      {/* Drawing Tools Toggle */}
      <motion.button
        onClick={() => setShowDrawingTools(!showDrawingTools)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white"
        whileHover={{ scale: 1.1 }}
      >
        <Pen className={`w-6 h-6 ${showDrawingTools ? 'text-yellow-400' : 'text-white'}`} />
      </motion.button>

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
                onPlay={() => handleVideoPlay('left')}
                onPause={() => handleVideoPause('left')}
                onTimeUpdate={() => handleVideoTimeUpdate('left')}
                onRateChange={() => handlePlaybackRateChange('left')}
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
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-white/20"
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
                onPlay={() => handleVideoPlay('right')}
                onPause={() => handleVideoPause('right')}
                onTimeUpdate={() => handleVideoTimeUpdate('right')}
                onRateChange={() => handlePlaybackRateChange('right')}
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
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-white/20"
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
        <>
          <div className="fixed bottom-48 left-1/2 -translate-x-1/2 z-50">
            <motion.button
              onClick={handleSave}
              className="px-6 py-2 rounded-full bg-white/20 text-white hover:bg-white/30"
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-6 h-6" />
            </motion.button>
          </div>

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
        </>
      )}
    </div>
  );
};

export default SplitPlayer;