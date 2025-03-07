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

interface Drawing {
  mode: 'freehand' | 'line' | 'circle' | 'rectangle' | 'triangle' | 'arrow' | 'text';
  color: 'yellow' | 'red' | 'white' | 'blue';
  points: { x: number; y: number; }[];
  text?: string;
}

const SplitPlayer = () => {
  const [leftVideo, setLeftVideo] = useState<VideoState>({ file: null, url: null });
  const [rightVideo, setRightVideo] = useState<VideoState>({ file: null, url: null });
  const [isSynced, setIsSynced] = useState(false);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [syncOffsets, setSyncOffsets] = useState({ left: 0, right: 0 });
  const [leftDrawings, setLeftDrawings] = useState<Drawing[]>([]);
  const [rightDrawings, setRightDrawings] = useState<Drawing[]>([]);
  const [videoWidths, setVideoWidths] = useState({ left: 0, right: 0 });
  
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftCanvasRef = useRef<any>(null);
  const rightCanvasRef = useRef<any>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width / 2;
        setVideoWidths({ left: width, right: width });
        setCanvasDimensions({ width, height: containerRef.current.getBoundingClientRect().height });
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
      setLeftDrawings([]);
      setIsSynced(false);
    } else {
      if (rightVideo.url) URL.revokeObjectURL(rightVideo.url);
      setRightVideo({ file: null, url: null });
      setRightDrawings([]);
      setIsSynced(false);
    }
  };

  const handleSync = () => {
    const newSyncState = !isSynced;
    setIsSynced(newSyncState);
    
    if (newSyncState && leftVideoRef.current && rightVideoRef.current) {
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
        exportData.leftVideo = {
          url: leftVideo.url,
          drawings: leftDrawings
        };
      }

      if (rightVideo.url) {
        exportData.rightVideo = {
          url: rightVideo.url,
          drawings: rightDrawings
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
      {/* Top Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 items-center z-50">
        <motion.button
          onClick={() => setShowDrawingTools(!showDrawingTools)}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-white/20"
          whileTap={{ scale: 0.95 }}
        >
          <Pen className={`w-6 h-6 ${showDrawingTools ? 'text-yellow-400' : 'text-white'}`} />
        </motion.button>

        {(leftVideo.url || rightVideo.url) && (
          <>
            <motion.button
              onClick={handleSave}
              className="p-2 rounded-full bg-black/50 text-white hover:bg-white/20"
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-6 h-6" />
            </motion.button>

            <motion.button
              onClick={handleSync}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                isSynced 
                  ? 'bg-yellow-400 text-black' 
                  : 'bg-black/50 text-white hover:bg-white/20'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isSynced ? 'SYNCED' : 'SYNC'}
            </motion.button>
          </>
        )}
      </div>

      {/* Video Container */}
      <div ref={containerRef} className="flex-1 flex flex-row">
        <div className="flex-1 relative">
          {leftVideo.url && (
            <div className="absolute top-4 left-16 z-50 flex items-center gap-2">
              <button
                onClick={() => removeVideo('left')}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}
          
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
              {canvasDimensions.width > 0 && (
                <DrawingCanvas 
                  ref={leftCanvasRef}
                  width={canvasDimensions.width} 
                  height={canvasDimensions.height}
                  savedDrawings={leftDrawings}
                  onDrawingsChange={setLeftDrawings}
                  showTools={showDrawingTools}
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
              <VideoControls videoRef={leftVideoRef} containerWidth={videoWidths.left} />
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex-1 relative">
          {rightVideo.url && (
            <button
              onClick={() => removeVideo('right')}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 z-50"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          
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
              {canvasDimensions.width > 0 && (
                  <DrawingCanvas 
                    ref={rightCanvasRef}
                    width={canvasDimensions.width} 
                    height={canvasDimensions.height}
                    savedDrawings={rightDrawings}
                    onDrawingsChange={setRightDrawings}
                    showTools={showDrawingTools}
                  />
                )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
              <VideoControls videoRef={rightVideoRef} containerWidth={videoWidths.right} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitPlayer;