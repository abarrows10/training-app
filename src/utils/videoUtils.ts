"use client";

export const parseVideoUrl = (url: string): { type: 'youtube' | 'vimeo' | null; videoId: string | null } => {
  try {
    // Parse YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('shorts/')[1].split('?')[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
      } else {
        return { type: null, videoId: null };
      }
      return { type: 'youtube', videoId };
    }
    
    // Parse Vimeo URLs
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0].split('#')[0];
      return { type: 'vimeo', videoId };
    }

    return { type: null, videoId: null };
  } catch (error) {
    console.error('Error parsing video URL:', error);
    return { type: null, videoId: null };
  }
};

export const getVideoThumbnail = (type: 'youtube' | 'vimeo', videoId: string): string => {
  if (type === 'youtube') {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  } else if (type === 'vimeo') {
    return '/api/placeholder/320/180';
  }
  return '/api/placeholder/320/180';
};

// In getEmbedUrl in videoUtils.ts
export const getEmbedUrl = (type: 'youtube' | 'vimeo', videoId: string): string => {
  if (type === 'youtube') {
    return `https://www.youtube.com/embed/${videoId}`;
  } else if (type === 'vimeo') {
    return `https://player.vimeo.com/video/${videoId}?dnt=1`;
  }
  return '';
};