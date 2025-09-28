import React, { useState, useRef, useEffect, useCallback } from "react";

interface ReelCardProps {
  video_url: string;
  likes: number;
  id?: number;
  category?: string;
  title?: string;
  author?: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  comments_count?: number;
  shares_count?: number;
  duration?: string;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  isActive?: boolean;
}

const ReelCard = ({ 
  video_url, 
  likes,
  id = 1,
  category = "Eco Content",
  title = "Sustainable Living Tips",
  author = { name: "EcoCreator", avatar: "🌱", verified: true },
  comments_count = 0,
  shares_count = 0,
  duration = "0:30",
  onLike,
  onComment,
  onShare,
  isActive = false
}: ReelCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-play when active
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
    onLike?.();
  }, [isLiked, onLike]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setTotalDuration(video.duration);
    }
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = e.currentTarget;
    if (video && progressBar) {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newTime = (clickX / width) * totalDuration;
      video.currentTime = newTime;
    }
  }, [totalDuration]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className={`transform transition-all duration-700 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
    }`}>
      
      {/* Main Card Container */}
      <div className="relative group">
        
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/0 via-cyan-500/20 to-blue-500/0 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Card */}
        <div className="relative bg-black/90 border-2 border-green-400 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden max-w-sm mx-auto">
          
          {/* Retro grid background */}
          <div className="absolute inset-0 opacity-5 rounded-3xl overflow-hidden"
               style={{ 
                 backgroundImage: `
                   repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(34, 197, 94, 0.3) 20px, rgba(34, 197, 94, 0.3) 22px),
                   repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(34, 197, 94, 0.3) 20px, rgba(34, 197, 94, 0.3) 22px)
                 `,
               }} 
          />

          {/* Header */}
          <div className="relative p-4 border-b border-green-400/30">
            <div className="flex items-center justify-between">
              
              {/* Author Info */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-lg">{author.avatar}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-bold font-mono text-sm">{author.name}</span>
                    {author.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="text-green-400 text-xs font-mono">{category}</div>
                </div>
              </div>

              {/* Duration Badge */}
              <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-400 rounded-full text-cyan-400 text-xs font-mono">
                {duration}
              </div>
            </div>
          </div>

          {/* Video Container */}
          <div 
            className="relative aspect-video cursor-pointer group/video"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              src={video_url}
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
            
            {/* Video overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
            
            {/* Play/Pause overlay */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
            }`}>
              {!isPlaying && (
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Title overlay */}
            {title && (
              <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                <h3 className="text-white font-bold text-lg font-mono leading-tight drop-shadow-lg">
                  {title}
                </h3>
              </div>
            )}

            {/* Progress bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gray-800/50 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200 cursor-pointer"
                style={{ width: `${progress}%` }}
                onClick={handleSeek}
              />
            </div>

            {/* Advanced controls overlay */}
            {showControls && (
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                
                {/* Volume Control */}
                <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-xl rounded-full px-3 py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="text-white hover:text-cyan-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      {isMuted || volume === 0 ? (
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                      ) : (
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      )}
                    </svg>
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 h-1 bg-gray-600 rounded-lg appearance-none slider"
                  />
                </div>

                {/* Time display */}
                <div className="text-white text-xs font-mono bg-black/50 backdrop-blur-xl rounded-full px-3 py-1">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="relative p-4 border-t border-green-400/30">
            <div className="flex items-center justify-between">
              
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`group/like flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isLiked 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-red-500/10 hover:text-red-400 border border-gray-700'
                }`}
              >
                <svg 
                  className={`w-5 h-5 transition-all duration-300 group-hover/like:scale-110 ${
                    isLiked ? 'fill-current animate-pulse' : ''
                  }`} 
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-mono font-bold">{isLiked ? likes + 1 : likes}</span>
              </button>

              {/* Comment Button */}
              <button
                onClick={onComment}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-800/50 text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 border border-gray-700 transition-all duration-300 group/comment"
              >
                <svg className="w-5 h-5 transition-all duration-300 group-hover/comment:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-mono font-bold">{comments_count}</span>
              </button>

              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-800/50 text-gray-300 hover:bg-green-500/10 hover:text-green-400 border border-gray-700 transition-all duration-300 group/share"
                >
                  <svg className="w-5 h-5 transition-all duration-300 group-hover/share:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="font-mono font-bold">{shares_count}</span>
                </button>

                {/* Share Menu */}
                {showShareMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-40 bg-black/90 backdrop-blur-xl rounded-xl border border-green-400/30 shadow-2xl overflow-hidden">
                    {['Copy Link', 'Twitter', 'Facebook', 'WhatsApp'].map((platform) => (
                      <button
                        key={platform}
                        onClick={() => {
                          onShare?.();
                          setShowShareMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-green-400/10 transition-colors text-white font-mono text-sm"
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Eco Points indicator */}
            <div className="mt-3 flex items-center justify-center">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full border border-green-500/30">
                <span className="text-green-400 text-sm">🌱</span>
                <span className="text-green-400 font-mono font-bold text-sm">+10 Eco Points</span>
              </div>
            </div>
          </div>

          {/* Scanning line effect */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse opacity-30" 
               style={{ animationDuration: '3s' }} />
        </div>
      </div>

      {/* Click outside handler for share menu */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowShareMenu(false)}
        />
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default ReelCard;