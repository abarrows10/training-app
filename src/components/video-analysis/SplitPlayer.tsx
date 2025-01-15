"use client";

import React, { useState, useRef } from 'react';
import VideoAnalysisUploader from './VideoAnalysisUploader';
import VideoControls from './VideoControls';

interface VideoState {
  file: File | null;
  url: string | null;
}

interface HandleFileSelectParams {
  file: File;
  side: 'left' | 'right';
}

const SplitPlayer = () => {
  const [leftVideo, setLeftVideo] = useState<VideoState>({ file: null, url: null });
  const [rightVideo, setRightVideo] = useState<VideoState>({ file: null, url: null });
  
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
    <div className="grid grid-cols-2 gap-4 max-w-[95vw] mx-auto">
      <div>
        {!leftVideo.url ? (
          <VideoAnalysisUploader onFileSelect={(file) => handleFileSelect(file, 'left')} side="left" />
        ) : (
          <div>
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
              <video
                ref={leftVideoRef}
                src={leftVideo.url}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
            <VideoControls videoRef={leftVideoRef} />
          </div>
        )}
      </div>

      <div>
        {!rightVideo.url ? (
          <VideoAnalysisUploader onFileSelect={(file) => handleFileSelect(file, 'right')} side="right" />
        ) : (
          <div>
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
              <video
                ref={rightVideoRef}
                src={rightVideo.url}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
            <VideoControls videoRef={rightVideoRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitPlayer;