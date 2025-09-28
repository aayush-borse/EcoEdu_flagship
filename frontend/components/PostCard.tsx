import React, { useState, useEffect, useCallback } from "react";
import { Heart, MessageCircle, Share2, ExternalLink, Bookmark, MoreHorizontal } from "lucide-react";

interface PostCardProps {
  id: number;
  caption: string;
  image_url?: string;
  likes: number;
  comments_count?: number;
  shares_count?: number;
  onLike: () => void;
  onComment?: () => void;
  onShare?: () => void;
  link?: string;
  author?: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  timestamp?: string;
  category?: string;
  ecoPoints?: number;
}

export default function PostCard({
  id,
  caption,
  image_url,
  likes,
  comments_count = 0,
  shares_count = 0,
  onLike,
  onComment,
  onShare,
  link,
  author = { name: "EcoWarrior", avatar: "🌱" },
  timestamp = "2h ago",
  category = "Sustainability",
  ecoPoints = 0,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [likesCount, setLikesCount] = useState(likes);
  const [showEcoPoints, setShowEcoPoints] = useState(false);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    // Show eco points animation for new likes
    if (!isLiked && ecoPoints > 0) {
      setShowEcoPoints(true);
      setTimeout(() => setShowEcoPoints(false), 2000);
    }
    
    onLike();
  }, [isLiked, onLike, ecoPoints]);

  const handleShare = useCallback(() => {
    setShowShareMenu(!showShareMenu);
    onShare?.();
  }, [showShareMenu, onShare]);

  const shareOptions = [
    { name: 'Copy Link', icon: '🔗', action: () => navigator.clipboard?.writeText(window.location.href) },
    { name: 'Twitter', icon: '🐦', action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`) },
    { name: 'Facebook', icon: '📘', action: () => window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`) },
    { name: 'WhatsApp', icon: '💬', action: () => window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`) },
  ];

  return (
    <div className={`relative group transform transition-all duration-700 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
    }`}>
      
      {/* Eco Points Notification */}
      {showEcoPoints && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-gradient-to-r from-green-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-bounce shadow-lg">
            +{ecoPoints} ECO POINTS! 🌱
          </div>
        </div>
      )}

      {/* Main Card Container */}
      <div className="relative">
        
        {/* Hover glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-green-500/0 via-cyan-500/20 to-blue-500/0 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Card */}
        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-800/50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:-translate-y-2 max-w-sm mx-auto">
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-xl">
              {category}
            </span>
          </div>

          {/* Menu Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 bg-black/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-all duration-300"
            >
              <MoreHorizontal size={16} />
            </button>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden">
                <button 
                  onClick={() => setIsSaved(!isSaved)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors flex items-center space-x-2 text-gray-700 dark:text-gray-300"
                >
                  <Bookmark size={16} className={isSaved ? 'fill-current text-yellow-500' : ''} />
                  <span>{isSaved ? 'Unsave' : 'Save Post'}</span>
                </button>
                <button className="w-full px-4 py-3 text-left hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <ExternalLink size={16} />
                  <span>Open Original</span>
                </button>
              </div>
            )}
          </div>

          {/* Image Container */}
          <div className="relative overflow-hidden">
            {link ? (
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block relative group/image"
              >
                <img
                  src={image_url || "/api/placeholder/400/300"}
                  alt={caption}
                  className="w-full h-64 object-cover transition-all duration-700 group-hover/image:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 right-4 opacity-0 group-hover/image:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/image:translate-y-0">
                  <div className="bg-white/20 backdrop-blur-xl rounded-full p-2 border border-white/30">
                    <ExternalLink size={16} className="text-white" />
                  </div>
                </div>
              </a>
            ) : (
              <div className="relative group/image">
                <img
                  src={image_url || "/api/placeholder/400/300"}
                  alt={caption}
                  className="w-full h-64 object-cover transition-all duration-700 group-hover/image:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            
            {/* Author Info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-lg">{author.avatar}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{author.name}</h4>
                  {author.verified && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{timestamp}</p>
              </div>
            </div>

            {/* Caption */}
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-light">
              {caption}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`group/like flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isLiked 
                    ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                    : 'bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-red-500/10 hover:text-red-500 border border-gray-200/50 dark:border-gray-700/50'
                }`}
              >
                <Heart 
                  size={18} 
                  className={`transition-all duration-300 group-hover/like:scale-110 ${
                    isLiked ? 'fill-current animate-pulse' : ''
                  }`} 
                />
                <span className="font-medium">{likesCount}</span>
              </button>

              {/* Comment Button */}
              <button
                onClick={onComment}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-blue-500/10 hover:text-blue-500 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 group/comment"
              >
                <MessageCircle size={18} className="transition-all duration-300 group-hover/comment:scale-110" />
                <span className="font-medium">{comments_count}</span>
              </button>

              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-green-500/10 hover:text-green-500 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 group/share"
                >
                  <Share2 size={18} className="transition-all duration-300 group-hover/share:scale-110" />
                  <span className="font-medium">{shares_count}</span>
                </button>

                {/* Share Menu */}
                {showShareMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden">
                    {shareOptions.map((option, index) => (
                      <button
                        key={option.name}
                        onClick={() => {
                          option.action();
                          setShowShareMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors flex items-center space-x-3 text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-lg">{option.icon}</span>
                        <span className="font-medium">{option.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Eco Points Indicator */}
            {ecoPoints > 0 && (
              <div className="flex items-center justify-center pt-3 border-t border-gray-200/30 dark:border-gray-700/30">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full border border-green-500/30">
                  <span className="text-green-400 text-sm">🌱</span>
                  <span className="text-green-400 font-medium text-sm">+{ecoPoints} Eco Points</span>
                </div>
              </div>
            )}
          </div>

          {/* Subtle animated accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>

      {/* Click outside handler for menus */}
      {(showMenu || showShareMenu) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowMenu(false);
            setShowShareMenu(false);
          }}
        />
      )}
    </div>
  );
}