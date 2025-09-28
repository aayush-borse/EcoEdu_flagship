import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Navbar from "../components/Navbar";
import API from "../src/api";

interface User {
  id: number;
  username: string;
  points: number;
  rank?: number;
  streak?: number;
  badges?: string[];
  isOnline?: boolean;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Custom hook for leaderboard management
const useLeaderboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/leaderboard/");
      
      // Enhance data with additional gaming elements
      const enhancedUsers = res.data.map((user: User, index: number) => ({
        ...user,
        rank: index + 1,
        streak: Math.floor(Math.random() * 20) + 1, // Simulated streak
        badges: generateRandomBadges(),
        isOnline: Math.random() > 0.3, // 70% chance of being online
      }));
      
      setUsers(enhancedUsers);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLeaderboard = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchLeaderboard();
    } finally {
      setRefreshing(false);
    }
  }, [fetchLeaderboard]);

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  return { users, loading, error, refreshLeaderboard, refreshing };
};

// Generate random badges for demo
const generateRandomBadges = (): string[] => {
  const badges = ['🌱', '🌍', '⚡', '🔥', '💚', '🌟', '🏆', '💎'];
  const count = Math.floor(Math.random() * 4);
  return badges.sort(() => Math.random() - 0.5).slice(0, count);
};

// Animated rank icon component
const RankIcon = ({ rank, points, isAnimated = false }) => {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
          border: 'border-yellow-400',
          glow: 'shadow-yellow-400/50',
          icon: '👑'
        };
      case 2:
        return {
          bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
          border: 'border-gray-400',
          glow: 'shadow-gray-400/50',
          icon: '🥈'
        };
      case 3:
        return {
          bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
          border: 'border-orange-400',
          glow: 'shadow-orange-400/50',
          icon: '🥉'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-green-500 to-cyan-500',
          border: 'border-green-400',
          glow: 'shadow-green-400/30',
          icon: '🏅'
        };
    }
  };

  const style = getRankStyle(rank);
  
  return (
    <div className="relative">
      <div className={`w-12 h-12 ${style.bg} border-2 ${style.border} rounded-full flex items-center justify-center shadow-lg ${style.glow} ${
        isAnimated ? 'animate-pulse' : ''
      } ${rank <= 3 ? 'shadow-2xl' : ''}`}>
        <span className="text-lg">{style.icon}</span>
      </div>
      
      {/* Rank number */}
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black border-2 border-green-400 rounded-full flex items-center justify-center">
        <span className="text-green-400 text-xs font-bold font-mono">{rank}</span>
      </div>
      
      {/* Special effects for top 3 */}
      {rank <= 3 && (
        <div className="absolute -inset-2 rounded-full animate-ping opacity-20" style={{
          background: rank === 1 ? '#facc15' : rank === 2 ? '#9ca3af' : '#fb923c'
        }} />
      )}
    </div>
  );
};

// Enhanced user card component
const LeaderboardCard = ({ user, index, isVisible }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div 
      className={`relative group transform transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-30 transition duration-500 rounded-2xl blur ${
        user.rank === 1 ? 'from-yellow-400 to-yellow-600' :
        user.rank === 2 ? 'from-gray-300 to-gray-500' :
        user.rank === 3 ? 'from-orange-400 to-orange-600' :
        'from-green-500 to-cyan-500'
      }`} />
      
      {/* Main card */}
      <div className="relative bg-black/90 border-2 border-green-400 rounded-2xl p-6 backdrop-blur-xl shadow-2xl hover:border-cyan-400 transition-all duration-300">
        
        {/* Retro grid pattern */}
        <div className="absolute inset-0 opacity-5 rounded-2xl overflow-hidden"
             style={{ 
               backgroundImage: `
                 repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(34, 197, 94, 0.3) 20px, rgba(34, 197, 94, 0.3) 22px),
                 repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(34, 197, 94, 0.3) 20px, rgba(34, 197, 94, 0.3) 22px)
               `,
             }} 
        />
        
        <div className="relative flex items-center justify-between">
          
          {/* Left side - Rank and user info */}
          <div className="flex items-center space-x-4">
            <RankIcon rank={user.rank!} points={user.points} />
            
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <span className={`text-xl font-bold font-mono ${
                  user.rank === 1 ? 'text-yellow-400' :
                  user.rank === 2 ? 'text-gray-300' :
                  user.rank === 3 ? 'text-orange-400' :
                  'text-green-400'
                }`}>
                  {user.username}
                </span>
                
                {/* Online indicator */}
                {user.isOnline && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs font-mono">ONLINE</span>
                  </div>
                )}
              </div>
              
              {/* Badges */}
              {user.badges && user.badges.length > 0 && (
                <div className="flex space-x-1">
                  {user.badges.map((badge, i) => (
                    <span key={i} className="text-sm opacity-80 hover:scale-125 transition-transform cursor-pointer">
                      {badge}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Streak info */}
              {user.streak && user.streak > 1 && (
                <div className="text-orange-400 text-sm font-mono">
                  🔥 {user.streak} streak
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Points and actions */}
          <div className="text-right space-y-2">
            <div className={`text-3xl font-bold font-mono ${
              user.rank === 1 ? 'text-yellow-400' :
              user.rank === 2 ? 'text-gray-300' :
              user.rank === 3 ? 'text-orange-400' :
              'text-cyan-400'
            }`}>
              {user.points.toLocaleString()}
            </div>
            <div className="text-green-400 text-sm font-mono">ECO POINTS</div>
            
            {/* Expand details button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-gray-400 hover:text-cyan-400 transition-colors font-mono"
            >
              {showDetails ? 'HIDE STATS' : 'SHOW STATS'}
            </button>
          </div>
        </div>
        
        {/* Expanded details */}
        {showDetails && (
          <div className="mt-6 pt-6 border-t border-green-400/30 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-cyan-400 text-lg font-bold font-mono">{Math.floor(user.points / 10)}</div>
              <div className="text-gray-400 text-xs font-mono">QUIZZES</div>
            </div>
            <div>
              <div className="text-green-400 text-lg font-bold font-mono">{user.streak}</div>
              <div className="text-gray-400 text-xs font-mono">STREAK</div>
            </div>
            <div>
              <div className="text-orange-400 text-lg font-bold font-mono">{user.badges?.length || 0}</div>
              <div className="text-gray-400 text-xs font-mono">BADGES</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Podium component for top 3
const Podium = ({ topThree }) => {
  if (!topThree || topThree.length < 3) return null;
  
  return (
    <div className="mb-12">
      <div className="flex items-end justify-center space-x-8 mb-8">
        
        {/* Second place */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-500 border-4 border-gray-400 rounded-full flex items-center justify-center shadow-2xl shadow-gray-400/50 mb-4 mx-auto">
            <span className="text-3xl">🥈</span>
          </div>
          <div className="bg-gray-400/20 border-2 border-gray-400 rounded-xl p-4 min-h-[100px] flex flex-col justify-end">
            <div className="text-gray-300 font-bold font-mono text-lg">{topThree[1].username}</div>
            <div className="text-2xl font-bold text-gray-300 font-mono">{topThree[1].points}</div>
            <div className="text-gray-400 text-sm font-mono">ECO POINTS</div>
          </div>
        </div>
        
        {/* First place */}
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-yellow-400 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-400/50 mb-4 mx-auto animate-pulse">
            <span className="text-4xl">👑</span>
          </div>
          <div className="bg-yellow-400/20 border-2 border-yellow-400 rounded-xl p-6 min-h-[120px] flex flex-col justify-end">
            <div className="text-yellow-400 font-bold font-mono text-xl">{topThree[0].username}</div>
            <div className="text-3xl font-bold text-yellow-400 font-mono">{topThree[0].points}</div>
            <div className="text-yellow-300 text-sm font-mono">ECO CHAMPION</div>
          </div>
        </div>
        
        {/* Third place */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 border-4 border-orange-400 rounded-full flex items-center justify-center shadow-2xl shadow-orange-400/50 mb-4 mx-auto">
            <span className="text-3xl">🥉</span>
          </div>
          <div className="bg-orange-400/20 border-2 border-orange-400 rounded-xl p-4 min-h-[100px] flex flex-col justify-end">
            <div className="text-orange-400 font-bold font-mono text-lg">{topThree[2].username}</div>
            <div className="text-2xl font-bold text-orange-400 font-mono">{topThree[2].points}</div>
            <div className="text-orange-300 text-sm font-mono">ECO POINTS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats overview component
const StatsOverview = ({ users }) => {
  const stats = useMemo(() => {
    if (!users.length) return { totalPoints: 0, avgPoints: 0, activeUsers: 0 };
    
    return {
      totalPoints: users.reduce((sum, user) => sum + user.points, 0),
      avgPoints: Math.round(users.reduce((sum, user) => sum + user.points, 0) / users.length),
      activeUsers: users.filter(user => user.isOnline).length,
    };
  }, [users]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="bg-black/90 border-2 border-green-400 rounded-2xl p-6 text-center">
        <div className="text-3xl font-bold text-cyan-400 font-mono">{stats.totalPoints.toLocaleString()}</div>
        <div className="text-green-400 text-sm font-mono">TOTAL ECO POINTS</div>
      </div>
      <div className="bg-black/90 border-2 border-green-400 rounded-2xl p-6 text-center">
        <div className="text-3xl font-bold text-green-400 font-mono">{stats.avgPoints.toLocaleString()}</div>
        <div className="text-green-400 text-sm font-mono">AVERAGE SCORE</div>
      </div>
      <div className="bg-black/90 border-2 border-green-400 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <div className="text-3xl font-bold text-green-400 font-mono">{stats.activeUsers}</div>
        </div>
        <div className="text-green-400 text-sm font-mono">ONLINE NOW</div>
      </div>
    </div>
  );
};

export default function Leaderboard() {
  const { t } = useTranslation("common");
  const { users, loading, error, refreshLeaderboard, refreshing } = useLeaderboard();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (users.length > 0) {
      const timer = setTimeout(() => setIsVisible(true), 200);
      return () => clearTimeout(timer);
    }
  }, [users]);

  const topThree = users.slice(0, 3);
  const restOfUsers = users.slice(3);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Navbar />
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-400 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <p className="text-green-400 text-lg font-mono">LOADING LEADERBOARD...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Navbar />
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 bg-red-500/20 border-4 border-red-400 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-red-400 font-mono">CONNECTION ERROR</h3>
          <p className="text-red-300">{error}</p>
          <button
            onClick={refreshLeaderboard}
            className="px-6 py-3 border-2 border-green-400 bg-green-400/20 text-green-400 rounded-xl font-mono font-bold hover:bg-green-400/30 transition-all duration-300"
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      
      {/* Retro background pattern */}
      <div className="absolute inset-0 opacity-10"
           style={{ 
             backgroundImage: `
               repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(34, 197, 94, 0.3) 50px, rgba(34, 197, 94, 0.3) 52px),
               repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(34, 197, 94, 0.3) 50px, rgba(34, 197, 94, 0.3) 52px)
             `,
           }} 
      />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      
      <Navbar />
      
      <div className="relative max-w-6xl mx-auto p-6 pt-20">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-green-400 to-cyan-400 bg-clip-text mb-6 font-mono">
            ECO LEADERBOARD
          </h1>
          <p className="text-green-400 text-lg font-mono mb-8">
            🌍 TOP ECO WARRIORS SAVING THE PLANET 🌍
          </p>
          
          {/* Refresh button */}
          <button
            onClick={refreshLeaderboard}
            disabled={refreshing}
            className={`px-6 py-3 border-2 border-cyan-400 bg-cyan-400/20 text-cyan-400 rounded-xl font-mono font-bold hover:bg-cyan-400/30 transition-all duration-300 ${
              refreshing ? 'animate-pulse' : ''
            }`}
          >
            {refreshing ? 'REFRESHING...' : 'REFRESH SCORES'}
          </button>
        </div>

        {/* Stats Overview */}
        <StatsOverview users={users} />

        {/* Podium for top 3 */}
        {topThree.length >= 3 && <Podium topThree={topThree} />}

        {/* Full leaderboard */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-green-400 font-mono mb-6 text-center">
            🏆 GLOBAL RANKINGS 🏆
          </h2>
          
          {users.map((user, index) => (
            <LeaderboardCard
              key={user.id}
              user={user}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Footer message */}
        <div className="mt-16 text-center">
          <div className="bg-black/90 border-2 border-green-400 rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="text-green-400 text-lg font-mono mb-4">
              💚 KEEP FIGHTING FOR OUR PLANET! 💚
            </div>
            <p className="text-gray-300 font-mono text-sm leading-relaxed">
              {t("leaderboard_message") || "Every quiz completed, every eco-friendly action taken, brings us closer to a sustainable future. Keep up the great work, eco-warriors!"}
            </p>
          </div>
        </div>
      </div>
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