"use client";

import React from 'react';
import { Video } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  if (!url || url === 'null') {
    return (
      <div className="w-full bg-[#18191A] rounded-lg overflow-hidden">
        <div className="relative aspect-video">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Video className="w-12 h-12 mb-2" />
            <span className="text-sm">No video available yet</span>
          </div>
        </div>
      </div>
    );
  }

  const getVideoInfo = (url: string) => {
    // YouTube formats
    const youtubeWatchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?]+)/);
    const youtubeShortsMatch = url.match(/youtube\.com\/shorts\/([^&\?]+)/);
    const youtubeShortMatch = url.match(/youtu\.be\/([^&\?]+)/);
    
    if (youtubeWatchMatch || youtubeShortsMatch || youtubeShortMatch) {
      const videoId = youtubeWatchMatch?.[1] || youtubeShortsMatch?.[1] || youtubeShortMatch?.[1];
      return {
        type: 'youtube',
        id: videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`
      };
    }

    // Vimeo formats
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        id: vimeoMatch[1],
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      };
    }

    return null;
  };

  const videoInfo = getVideoInfo(url);

  if (!videoInfo) {
    return (
      <div className="w-full bg-[#18191A] rounded-lg overflow-hidden">
        <div className="relative aspect-video">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Video className="w-12 h-12 mb-2" />
            <span className="text-sm">Invalid video URL</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#18191A] rounded-lg overflow-hidden">
      <div className="relative aspect-video">
        <iframe
          src={videoInfo.embedUrl}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      
      <div className="p-3">
        <h3 className="text-white font-medium text-sm">{title}</h3>
      </div>
    </div>
  );
};

export default VideoPlayer;