import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Navbar from "../components/Navbar";
import API from "../src/api";

interface Reel {
  id: number;
  video_url: string;
  likes: number;
  category: string;
}

interface Comment {
  id: string;
  text: string;
  timestamp: Date;
  user: string;
  avatar?: string;
}

// Custom hook for reels management
const useReels = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/reels/");
      setReels(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load reels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  return { reels, loading, error, refetch: fetchReels };
};

// Enhanced video player component
const VideoPlayer = ({ src, isActive, onVideoClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    onVideoClick?.();
  }, [onVideoClick]);

  return (
    <div 
      className="relative w-full h-full rounded-3xl overflow-hidden cursor-pointer group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Video overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 pointer-events-none" />
      
      {/* Play/Pause indicator */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        {!isPlaying && (
          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced action button component
const ActionButton = ({ icon, count, isActive, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`group relative flex flex-col items-center transition-all duration-300 ${className}`}
  >
    <div className={`w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 ${
      isActive 
        ? 'bg-white/30 border-white/50 text-white' 
        : 'bg-black/30 border-white/20 text-white/80 hover:bg-white/20 hover:border-white/40'
    }`}>
      {icon}
    </div>
    {count !== undefined && (
      <span className="text-xs text-white/90 font-medium mt-1 group-hover:text-white transition-colors">
        {count > 999 ? `${(count/1000).toFixed(1)}k` : count}
      </span>
    )}
  </button>
);

// Comments panel component
const CommentsPanel = ({ isOpen, onClose, comments, onAddComment, newComment, setNewComment }) => (
  <div className={`fixed inset-y-0 right-0 w-96 bg-black/95 backdrop-blur-2xl border-l border-white/10 transform transition-transform duration-500 z-50 ${
    isOpen ? 'translate-x-0' : 'translate-x-full'
  }`}>
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-white/10">
      <h3 className="text-xl font-semibold text-white">Comments</h3>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    {/* Comments list */}
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[calc(100vh-200px)]">
      {comments?.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-sm font-semibold text-white">
              {comment.user.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-green-400">
                {comment.user}
              </span>
              <span className="text-xs text-white/50">
                {formatTime(comment.timestamp)}
              </span>
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              {comment.text}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* Add comment */}
    <div className="p-6 border-t border-white/10">
      <div className="flex space-x-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onAddComment()}
          placeholder="Add a comment..."
          className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors placeholder-white/60 text-white"
        />
        <button
          onClick={onAddComment}
          disabled={!newComment.trim()}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm text-white"
        >
          Post
        </button>
      </div>
    </div>
  </div>
);

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return "now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

export default function Reels() {
  const { t } = useTranslation("common");
  const { reels, loading, error } = useReels();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likes, setLikes] = useState<{ [key: number]: number }>({});
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState<{ [key: number]: boolean }>({});
  const [showUI, setShowUI] = useState(true);
  const router = useRouter();

  // Initialize data when reels load
  useEffect(() => {
    if (reels.length > 0) {
      const initialLikes: { [key: number]: number } = {};
      const initialComments: { [key: number]: Comment[] } = {};
      const initialIsLiked: { [key: number]: boolean } = {};
      
      reels.forEach((reel) => {
        initialLikes[reel.id] = reel.likes;
        initialIsLiked[reel.id] = false;
        initialComments[reel.id] = [
          {
            id: `${reel.id}-1`,
            text: "This is amazing! Love the eco-friendly content 🌱",
            timestamp: new Date(Date.now() - 3600000),
            user: "EcoWarrior"
          },
          {
            id: `${reel.id}-2`,
            text: "Exactly what our planet needs right now 💚",
            timestamp: new Date(Date.now() - 7200000),
            user: "GreenFuture"
          },
          {
            id: `${reel.id}-3`,
            text: "So inspiring! Thanks for sharing this 🌍",
            timestamp: new Date(Date.now() - 10800000),
            user: "EcoLife"
          },
        ];
      });
      setLikes(initialLikes);
      setComments(initialComments);
      setIsLiked(initialIsLiked);
    }
  }, [reels]);

  // Auto-hide UI after inactivity
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      setShowUI(true);
      timer = setTimeout(() => setShowUI(false), 3000);
    };

    const handleActivity = () => resetTimer();
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('click', handleActivity);
    document.addEventListener('keydown', handleActivity);

    resetTimer();

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('click', handleActivity);
      document.removeEventListener('keydown', handleActivity);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          nextReel();
          break;
        case ' ':
          e.preventDefault();
          // Toggle play handled by video component
          break;
        case 'l':
          e.preventDefault();
          likeReel(reels[currentIndex]?.id);
          break;
        case 'c':
          e.preventDefault();
          setShowComments(!showComments);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, reels, showComments]);

  const nextReel = useCallback(() => {
    setShowComments(false);
    setNewComment("");
    if (currentIndex === reels.length - 1) {
      router.push("/quiz");
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, reels.length, router]);

  const prevReel = useCallback(() => {
    setShowComments(false);
    setNewComment("");
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const likeReel = useCallback((id: number) => {
    setIsLiked(prev => ({ ...prev, [id]: !prev[id] }));
    setLikes((prev) => ({ 
      ...prev, 
      [id]: isLiked[id] ? prev[id] - 1 : prev[id] + 1 
    }));
  }, [isLiked]);

  const addComment = useCallback(() => {
    if (newComment.trim() && reels[currentIndex]) {
      const comment: Comment = {
        id: `${reels[currentIndex].id}-${Date.now()}`,
        text: newComment.trim(),
        timestamp: new Date(),
        user: "You"
      };
      
      setComments(prev => ({
        ...prev,
        [reels[currentIndex].id]: [comment, ...(prev[reels[currentIndex].id] || [])]
      }));
      setNewComment("");
    }
  }, [newComment, reels, currentIndex]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/20 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-green-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-white/80 text-lg font-light">{t("loading_reels")}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Navbar />
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-white">Failed to load reels</h3>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    );
  }

  // No reels state
  if (!reels.length) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Navbar />
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V2a1 1 0 011 1v8a1 1 0 01-1 1H8a1 1 0 01-1-1V3a1 1 0 011-1m8 0H8m0 0v12a1 1 0 001 1h6a1 1 0 001-1V4z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-white">No reels available</h3>
          <p className="text-white/60">Check back later for new content!</p>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className={`transition-opacity duration-300 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
        <Navbar />
      </div>

      {/* Background blur when comments are open */}
      {showComments && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setShowComments(false)}
        />
      )}

      {/* Main content */}
      <div className="relative h-screen flex items-center justify-center">
        
        {/* Navigation buttons */}
        <div className={`absolute left-8 top-1/2 transform -translate-y-1/2 z-30 transition-all duration-300 ${
          showUI ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}>
          {currentIndex > 0 && (
            <button
              onClick={prevReel}
              className="w-14 h-14 bg-black/30 backdrop-blur-xl border border-white/20 rounded-full hover:bg-black/50 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-2xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        <div className={`absolute right-8 top-1/2 transform -translate-y-1/2 z-30 transition-all duration-300 ${
          showUI ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          {currentIndex < reels.length - 1 && (
            <button
              onClick={nextReel}
              className="w-14 h-14 bg-black/30 backdrop-blur-xl border border-white/20 rounded-full hover:bg-black/50 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-2xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Video container */}
        <div className="relative w-full max-w-md h-[85vh] mx-auto">
          <VideoPlayer 
            src={currentReel.video_url}
            isActive={true}
            onVideoClick={() => setShowUI(true)}
          />

          {/* Video overlay content */}
          <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${showUI ? 'opacity-100' : 'opacity-30'}`}>
            
            {/* Top overlay - Category */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-auto">
              <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
                <span className="text-sm font-medium">{currentReel.category}</span>
              </div>
              
              {/* Close button */}
              <button
                onClick={() => router.back()}
                className="w-10 h-10 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full hover:bg-black/60 transition-all duration-300 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Bottom overlay - Actions */}
            <div className="absolute bottom-6 right-6 flex flex-col space-y-4 pointer-events-auto">
              
              {/* Like button */}
              <ActionButton
                icon={
                  <svg 
                    className={`w-6 h-6 transition-all duration-300 ${
                      isLiked[currentReel.id] ? 'text-red-500 scale-110' : 'text-white'
                    }`} 
                    fill={isLiked[currentReel.id] ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                }
                count={likes[currentReel.id]}
                isActive={isLiked[currentReel.id]}
                onClick={() => likeReel(currentReel.id)}
              />

              {/* Comments button */}
              <ActionButton
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                }
                count={comments[currentReel.id]?.length || 0}
                isActive={showComments}
                onClick={() => setShowComments(!showComments)}
              />

              {/* Share button */}
              <ActionButton
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>}
                onClick={() => {
                  // Share functionality
                  navigator.share?.({
                    title: `EcoXP - ${currentReel.category}`,
                    url: window.location.href
                  });
                } } count={undefined} isActive={undefined}              />
            </div>

            {/* Preview comments at bottom left */}
            <div className="absolute bottom-6 left-6 max-w-xs pointer-events-auto">
              <div className="space-y-2">
                {comments[currentReel.id]?.slice(0, 2).map((comment, i) => (
                  <div key={comment.id} className="bg-black/30 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-green-400">{comment.user}</span>
                      <span className="text-xs text-white/90 truncate">{comment.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 transition-all duration-300 ${
          showUI ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'
        }`}>
          {reels.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-gradient-to-r from-green-500 to-blue-500"
                  : index < currentIndex
                  ? "w-4 bg-white/60"
                  : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Next video button */}
        <div className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${
          showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <button
            onClick={nextReel}
            className="px-6 py-3 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full hover:from-green-600 hover:via-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-2xl hover:scale-105 backdrop-blur-xl border border-white/20"
          >
            {currentIndex === reels.length - 1 ? t("go_to_quiz") : t("next_reel")}
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${
          showUI ? 'opacity-60 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 text-xs text-white/80">
            Use ↑↓ arrows, Space, L to like, C for comments
          </div>
        </div>
      </div>

      {/* Comments panel */}
      <CommentsPanel
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        comments={comments[currentReel.id]}
        onAddComment={addComment}
        newComment={newComment}
        setNewComment={setNewComment}
      />
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}