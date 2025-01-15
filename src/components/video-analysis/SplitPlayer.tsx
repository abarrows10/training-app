"use client";

import React, { useState, useRef } from 'react';
import { X, MoreVertical, Link } from 'lucide-react';
import VideoAnalysisUploader from './VideoAnalysisUploader';
import VideoControls from './VideoControls';

interface VideoState {
  file: File | null;
  url: string | null;
}

const SplitPlayer = () => {
  const [leftVideo, setLeftVideo] = useState<VideoState>({ file: null, url: null });
  const [rightVideo, setRightVideo] = useState<VideoState>({ file: null, url: null });
  const [isLinked, setIsLinked] = useState(false);
  
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (file: File, side: 'left' | 'right') => {
    const url = URL.createObjectURL(file);
    if (side === 'left') {
      setLeftVideo({ file, url });
    } else {
      setRightVideo({ file, url });
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/50">
        <button className="text-white">
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-white text-lg">COMPARE</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsLinked(!isLinked)}
              className={`text-sm px-2 py-1 rounded ${
                isLinked ? 'text-yellow-400' : 'text-white'
              }`}
            >
              <Link className="w-4 h-4" />
            </button>
            <span className={`text-sm ${isLinked ? 'text-yellow-400' : 'text-white'}`}>
              {isLinked ? 'LINKED' : 'LINK'}
            </span>
          </div>
        </div>
        <button className="text-white">
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      {/* Videos Container */}
      <div className="flex-1 flex flex-col landscape:flex-row">
        <div className="flex-1">
          {!leftVideo.url ? (
            <VideoAnalysisUploader onFileSelect={(file) => handleFileSelect(file, 'left')} side="left" />
          ) : (
            <div className="relative h-full">
              <video
                ref={leftVideoRef}
                src={leftVideo.url}
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0">
                <VideoControls videoRef={leftVideoRef} />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          {!rightVideo.url ? (
            <VideoAnalysisUploader onFileSelect={(file) => handleFileSelect(file, 'right')} side="right" />
          ) : (
            <div className="relative h-full">
              <video
                ref={rightVideoRef}
                src={rightVideo.url}
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0">
                <VideoControls videoRef={rightVideoRef} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitPlayer;