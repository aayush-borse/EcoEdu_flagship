import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import API from "../src/api";

interface Post {
  id: number;
  caption: string;
  image_url?: string;
  likes: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

// Gamification hook for user progress and achievements
const useGamification = () => {
  const [userLevel, setUserLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_visit',
      title: 'Welcome Explorer!',
      description: 'Welcome to EcoXP',
      icon: '🌱',
      unlocked: false
    },
    {
      id: 'eco_searcher',
      title: 'Eco Searcher',
      description: 'Use the search feature',
      icon: '🔍',
      unlocked: false
    },
    {
      id: 'community_member',
      title: 'Community Member',
      description: 'Explore community features',
      icon: '👥',
      unlocked: false
    }
  ]);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);

  const addXP = useCallback((points: number) => {
    setXp(prev => {
      const newXP = prev + points;
      const newLevel = Math.floor(newXP / 100) + 1;
      if (newLevel > userLevel) {
        setUserLevel(newLevel);
        // Show level up notification
        setTimeout(() => {
          setShowAchievement({
            id: 'level_up',
            title: `Level ${newLevel}!`,
            description: 'You leveled up!',
            icon: '⭐',
            unlocked: true
          });
        }, 500);
      }
      return newXP;
    });
  }, [userLevel]);

  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => {
      const updated = prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, unlocked: true }
          : achievement
      );
      
      const unlockedAchievement = updated.find(a => a.id === achievementId);
      if (unlockedAchievement && !prev.find(a => a.id === achievementId)?.unlocked) {
        setShowAchievement(unlockedAchievement);
        addXP(50);
      }
      
      return updated;
    });
  }, [addXP]);

  useEffect(() => {
    // Unlock first visit achievement
    const timer = setTimeout(() => {
      unlockAchievement('first_visit');
    }, 2000);
    return () => clearTimeout(timer);
  }, [unlockAchievement]);

  return {
    userLevel,
    xp,
    streak,
    achievements,
    showAchievement,
    setShowAchievement,
    addXP,
    unlockAchievement
  };
};

// Custom hook for posts management (enhanced with gamification)
const usePosts = (addXP: (points: number) => void) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/posts/");
      setPosts(res.data);
      setError(null);
      // Award XP for loading content
      addXP(10);
    } catch (err) {
      console.error(err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [addXP]);

  const like = useCallback(async (id: number) => {
    try {
      await API.post(`/posts/${id}/like`);
      fetchPosts();
      // Award XP for engagement
      addXP(5);
    } catch (err) {
      console.error(err);
    }
  }, [fetchPosts, addXP]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, like, refetch: fetchPosts };
};

// Achievement notification component
const AchievementNotification = ({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 transform animate-slide-in-right">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-xl shadow-2xl border-2 border-yellow-300 max-w-sm">
        <div className="flex items-center space-x-3">
          <span className="text-2xl animate-bounce">{achievement.icon}</span>
          <div>
            <h4 className="font-bold text-lg">Achievement Unlocked!</h4>
            <h5 className="font-semibold">{achievement.title}</h5>
            <p className="text-sm opacity-90">{achievement.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Gamified user stats display
const UserStats = ({ level, xp, streak }: { level: number; xp: number; streak: number }) => {
  const xpToNextLevel = 100 - (xp % 100);
  const progressPercent = (xp % 100);

  return (
    <div className="fixed top-4 left-4 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-gray-200/50 dark:border-gray-800/50">
      <div className="flex items-center space-x-4">
        {/* Level Badge */}
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
            {level}
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-xs">⭐</span>
          </div>
        </div>

        {/* XP Progress */}
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Level {level}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{xp} XP</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {xpToNextLevel} XP to next level
          </div>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="text-center">
            <div className="text-orange-500 text-lg">🔥</div>
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{streak}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Animated background component (enhanced with floating particles)
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-32 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse animation-delay-4000" />
    
    {/* Floating particles */}
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={`absolute w-2 h-2 bg-green-400/30 rounded-full animate-float`}
        style={{
          left: `${20 + i * 15}%`,
          top: `${30 + i * 10}%`,
          animationDelay: `${i * 0.5}s`,
          animationDuration: `${3 + i * 0.5}s`
        }}
      />
    ))}
  </div>
);

// Feature card component with gamification hooks
const FeatureCard = ({ icon, title, description, gradient, delay = 0, href, onInteraction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const handleClick = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      onInteraction();
    }
  };

  return (
    <Link href={href} onClick={handleClick}>
      <div 
        className={`group relative transform transition-all duration-1000 cursor-pointer ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        {/* Hover glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500`} />
        
        {/* Interaction indicator */}
        {hasInteracted && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-10 animate-bounce">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
        
        <div className="relative h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-3xl p-8 hover:bg-white/90 dark:hover:bg-gray-900/90 transition-all duration-500 shadow-xl hover:shadow-2xl group-hover:-translate-y-2 group-hover:scale-[1.02]">
          
          {/* Animated icon container */}
          <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <div className="text-white group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-300 transition-all duration-300">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 font-light leading-relaxed mb-6">
            {description}
          </p>

          {/* Call to action with XP indicator */}
          <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center space-x-2">
              <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-medium`}>
                Explore Now
              </span>
              <svg className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>+25</span>
              <span className="text-yellow-500">⭐</span>
            </div>
          </div>

          {/* Subtle animated accent line */}
          <div className={`h-1 w-0 bg-gradient-to-r ${gradient} rounded-full mt-6 group-hover:w-full transition-all duration-500`} />
        </div>
      </div>
    </Link>
  );
};

// Enhanced search component with gamification
const HeroSearch = ({ t, onSearch }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`relative group transition-all duration-500 ${isFocused ? 'scale-105' : ''}`}>
        {/* Dynamic background glow */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500 ${isFocused ? 'opacity-50' : ''}`} />
        
        <div className="relative flex bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t("search_placeholder")}
              className="w-full px-8 py-5 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-lg font-light"
            />
            {/* Search suggestions overlay */}
            {isFocused && searchValue && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-50">
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Suggestions</div>
                    <div className="text-xs text-gray-400">+5 XP each</div>
                  </div>
                  {['Eco tips', 'Sustainable living', 'Green energy', 'Climate action'].map((suggestion, i) => (
                    <div key={i} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300 transition-colors flex justify-between items-center">
                      <span>{suggestion}</span>
                      <span className="text-yellow-500">⭐</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleSearch}
            className="px-8 py-5 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white hover:from-green-600 hover:via-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl relative group overflow-hidden"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <span>{t("search")}</span>
              <span className="text-yellow-300">+10 XP</span>
            </span>
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { t } = useTranslation("common");
  const { 
    userLevel, 
    xp, 
    streak, 
    achievements, 
    showAchievement, 
    setShowAchievement, 
    addXP, 
    unlockAchievement 
  } = useGamification();
  
  const { posts, loading, error, like } = usePosts(addXP);

  const handleSearch = useCallback(() => {
    unlockAchievement('eco_searcher');
    addXP(10);
  }, [unlockAchievement, addXP]);

  const handleFeatureInteraction = useCallback((featureType: string) => {
    addXP(25);
    if (featureType === 'community') {
      unlockAchievement('community_member');
    }
  }, [addXP, unlockAchievement]);

  // Memoized feature data with navigation links and gamification
  const features = useMemo(() => [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: t("community"),
      description: t("community_desc") + " Join fellow eco-warriors in hunting for sustainable treasures and sharing discoveries.",
      gradient: "from-green-500 to-emerald-600",
      delay: 200,
      href: "/hunt",
      onInteraction: () => handleFeatureInteraction('community')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: t("learn"),
      description: t("learn_desc") + " Watch engaging eco-content, learn from reels, and expand your environmental knowledge.",
      gradient: "from-blue-500 to-indigo-600",
      delay: 400,
      href: "/reels",
      onInteraction: () => handleFeatureInteraction('learn')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: t("act"),
      description: t("act_desc") + " Compete with global eco-warriors and climb the sustainability leaderboard.",
      gradient: "from-purple-500 to-pink-600",
      delay: 600,
      href: "/leaderboard",
      onInteraction: () => handleFeatureInteraction('act')
    }
  ], [t, handleFeatureInteraction]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-black dark:to-gray-950">
      <Navbar />

      {/* User Stats Display */}
      <UserStats level={userLevel} xp={xp} streak={streak} />

      {/* Achievement Notification */}
      {showAchievement && (
        <AchievementNotification 
          achievement={showAchievement} 
          onClose={() => setShowAchievement(null)} 
        />
      )}

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 text-center overflow-hidden">
        <AnimatedBackground />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Main headline with staggered animation */}
          <div className="space-y-6 mb-12">
            <h1 className="text-6xl md:text-8xl font-thin tracking-tight text-gray-900 dark:text-white leading-tight">
              <span className="inline-block animate-fade-in-up">Welcome to</span>
              <br />
              <span className="inline-block font-medium bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
                EcoXP
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl font-light text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              {t("hero_description")}
            </p>
          </div>

          <div className="animate-fade-in-up animation-delay-600">
            <HeroSearch t={t} onSearch={handleSearch} />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-300 dark:border-gray-700 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-thin text-gray-900 dark:text-white mb-8 tracking-tight">
              Experience the Future
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-900/80 dark:to-black/80 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-thin text-gray-900 dark:text-white mb-8 tracking-tight">
              Community Stories
            </h2>
            <p className="text-xl font-light text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover inspiring content from our eco-conscious community
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-blue-500 rounded-full animate-spin mb-6" />
              <p className="text-gray-600 dark:text-gray-400 text-lg font-light">Loading stories...</p>
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Something went wrong</h3>
              <p className="text-gray-600 dark:text-gray-300 font-light">{error}</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <div 
                  key={post.id} 
                  className="group transform transition-all duration-500 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
                    <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500">
                      <PostCard {...post} onLike={() => like(post.id)} />
                      {/* XP indicator for interactions */}
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        +5 XP
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-12 shadow-xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
                No stories yet
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-300 font-light max-w-md mx-auto leading-relaxed">
                {t("empty_posts_message")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Additional Gamification Elements */}
      <section className="py-16 px-6 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8">
            Your Eco Journey
          </h3>
          
          {/* Achievement Progress */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {achievements.map((achievement, index) => (
              <div 
                key={achievement.id}
                className={`p-6 rounded-2xl border transition-all duration-500 ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800 shadow-lg' 
                    : 'bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`text-4xl mb-3 ${achievement.unlocked ? 'animate-bounce' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <h4 className={`font-semibold mb-2 ${
                  achievement.unlocked 
                    ? 'text-green-800 dark:text-green-300' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {achievement.title}
                </h4>
                <p className={`text-sm ${
                  achievement.unlocked 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {achievement.description}
                </p>
                {achievement.unlocked && (
                  <div className="mt-3 flex items-center justify-center space-x-1">
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Unlocked</span>
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {userLevel}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {xp}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {achievements.filter(a => a.unlocked).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {streak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
            </div>
          </div>

          {/* Progress motivation */}
          <div className="mt-12 p-6 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-2xl border border-green-200 dark:border-green-800">
            <h4 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-3">
              Keep Growing Your Impact! 🌱
            </h4>
            <p className="text-green-700 dark:text-green-400">
              Every action you take helps build a more sustainable future. Continue exploring, learning, and connecting with our eco-community!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Static props to load translations during build for SSR and SSG
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}

// Additional CSS classes for animations (add to your global CSS)
/*
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes fade-in-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.5s ease-out;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}

.animation-delay-600 {
  animation-delay: 600ms;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
*/