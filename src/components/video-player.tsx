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

  useEffect(() => {
    if (!url || url === 'null') return;

    const { type, videoId } = parseVideoUrl(url);
    if (type && videoId) {
      let baseEmbedUrl = getEmbedUrl(type, videoId);
      
      // Add parameters based on video platform
      const params = new URLSearchParams({
        // YouTube specific
        ...(type === 'youtube' && {
          autoplay: '0',
          controls: '1',
          modestbranding: '1',
          rel: '0',
          origin: window.location.origin,
          enablejsapi: '1',
          widgetid: '1'
        }),
        // Vimeo specific
        ...(type === 'vimeo' && {
          title: '0',
          byline: '0',
          portrait: '0',
          dnt: '1'
        })
      });

      setEmbedUrl(`${baseEmbedUrl}?${params.toString()}`);
    }
  }, [url]);

  // If no video URL is provided, show placeholder
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

  // If we have a valid embed URL, show the iframe
  if (embedUrl) {
    return (
      <div className="w-full bg-[#18191A] rounded-lg overflow-hidden">
        <div className="relative aspect-video">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            title={title}
          />
        </div>
        <div className="p-3">
          <h3 className="text-white font-medium text-sm">{title}</h3>
        </div>
      </div>
    );
  }

  // If something went wrong parsing the URL, show an error state
  return (
    <div className="w-full bg-[#18191A] rounded-lg overflow-hidden">
      <div className="relative aspect-video">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400">
          <Video className="w-12 h-12 mb-2" />
          <span className="text-sm">Error loading video</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;