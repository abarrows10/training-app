"use client";

import { useEffect, useState } from 'react';
import { Video } from 'lucide-react';
import { parseVideoUrl, getEmbedUrl } from '@/utils/videoUtils';

interface VideoPlayerProps {
  url: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!url || url === 'null') return;

    try {
      const { type, videoId } = parseVideoUrl(url);
      if (type && videoId) {
        const baseUrl = type === 'vimeo' ? url : getEmbedUrl(type, videoId);
        setEmbedUrl(baseUrl.replace('vimeo.com', 'player.vimeo.com/video'));
      }
    } catch (err) {
      setError(true);
    }
  }, [url]);

  if (!url || url === 'null' || error) {
    return (
      <div className="w-full bg-[#18191A] rounded-lg overflow-hidden">
        <div className="relative aspect-video">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Video className="w-12 h-12 mb-2" />
            <span className="text-sm">{error ? 'Video unavailable' : 'No video available yet'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#18191A] rounded-lg overflow-hidden">
      <div className="relative aspect-video">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => setError(true)}
          referrerPolicy="origin"
          title={title}
        />
      </div>
      <div className="p-3">
        <h3 className="text-white font-medium text-sm">{title}</h3>
      </div>
    </div>
  );
};

export default VideoPlayer;