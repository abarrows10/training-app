"use client";

import React, { useState, useRef } from 'react';
import { Link } from 'lucide-react';
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
    <div className="flex-1 relative">
      {/* Link Status Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur-sm rounded px-3 py-1">
          <button 
            onClick={() => setIsLinked(!isLinked)}
            className="flex items-center gap-2"
          >
            <Link className={`w-4 h-4 ${isLinked ? 'text-yellow-400' : 'text-white'}`} />
            <span className={`text-sm ${isLinked ? 'text-yellow-400' : 'text-white'}`}>
              {isLinked ? 'LINKED' : 'LINK'}
            </span>
          </button>
        </div>
      </div>

      {/* Videos Container */}
      <div className="h-full flex flex-col landscape:flex-row">
        <div className="flex-1">
          {!leftVideo.url ? (
            <VideoAnalysisUploader onFileSelect={(file) => handleFileSelect(file, 'left')} side="left" />
          ) : (
            <div className="relative h-full">
              <video
                ref={leftVideoRef}
                src={leftVideo.url}
                className="absolute inset-0 w-full h-full object-contain bg-black"
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
                className="absolute inset-0 w-full h-full object-contain bg-black"
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