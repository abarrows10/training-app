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
    <div className="fixed inset-0 bg-black">
      {/* Link Status Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
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
      <div className="h-screen flex flex-row">
        <div className="flex-1 relative">
          {!leftVideo.url ? (
            <VideoAnalysisUploader onFileSelect={(file) => handleFileSelect(file, 'left')} side="left" />
          ) : (
            <div className="h-full relative">
              <video
                ref={leftVideoRef}
                src={leftVideo.url}
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 z-10">
                <VideoControls videoRef={leftVideoRef} />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          {!rightVideo.url ? (
            <VideoAnalysisUploader onFileSelect={(file) => handleFileSelect(file, 'right')} side="right" />
          ) : (
            <div className="h-full relative">
              <video
                ref={rightVideoRef}
                src={rightVideo.url}
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 z-10">
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