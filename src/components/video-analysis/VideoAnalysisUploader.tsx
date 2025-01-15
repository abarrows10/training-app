"use client";

import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface VideoAnalysisUploaderProps {
  onFileSelect: (file: File) => void;
  side: 'left' | 'right';
}

const VideoAnalysisUploader: React.FC<VideoAnalysisUploaderProps> = ({ onFileSelect, side }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onFileSelect(file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative aspect-video w-full bg-[#18191A] rounded-lg border border-[#3A3B3C] overflow-hidden">
      <button
        onClick={handleClick}
        className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 hover:text-[#00A3E0] transition-colors"
      >
        <Upload className="w-12 h-12 mb-2" />
        <span className="text-sm">Upload {side} video</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default VideoAnalysisUploader;