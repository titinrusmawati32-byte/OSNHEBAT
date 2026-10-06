import React from 'react';

interface YoutubeEmbedProps {
  videoId: string;
  title: string;
}

export const YoutubeEmbed: React.FC<YoutubeEmbedProps> = ({ videoId, title }) => {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-200 dark:border-slate-800">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};
