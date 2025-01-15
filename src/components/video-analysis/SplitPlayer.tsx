"use client";

import React, { useState, useRef } from 'react';
import { Link } from 'lucide-react';
import VideoAnalysisUploader from './VideoAnalysisUploader';
import VideoControls from './VideoControls';
import { motion, AnimatePresence } from 'framer-motion';

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
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div 
            className="bg-black/50 backdrop-blur-sm rounded px-3 py-1"
            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          >
            <motion.button 
              onClick={() => setIsLinked(!isLinked)}
              className="flex items-center gap-2"
              whileTap={{ scale: 0.95 }}
            >
              <Link className={`w-4 h-4 ${isLinked ? 'text-yellow-400' : 'text-white'}`} />
              <span className={`text-sm ${isLinked ? 'text-yellow-400' : 'text-white'}`}>
                {isLinked ? 'LINKED' : 'LINK'}
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="h-screen flex flex-row">
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
              />
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
              />
              <div className="absolute bottom-0 left-0 right-0 z-10">
                <VideoControls videoRef={rightVideoRef} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitPlayer;