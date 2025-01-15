"use client";

import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <motion.div 
      className="relative aspect-video w-full bg-[#18191A] rounded-lg border border-[#3A3B3C] overflow-hidden"
      whileHover={{ borderColor: '#00A3E0' }}
    >
      <motion.button
        onClick={handleClick}
        className="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
        whileHover={{ color: '#00A3E0' }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
        >
          <Upload className="w-12 h-12 mb-2" />
          <span className="text-sm">Upload {side} video</span>
        </motion.div>
      </motion.button>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </motion.div>
  );
};

export default VideoAnalysisUploader;