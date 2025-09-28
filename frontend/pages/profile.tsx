import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  points: number;
  level: number;
  quizzesTaken: number;
  joinDate: string;
  streak: number;
  totalXP: number;
  nextLevelXP: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function Profile() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [isEditing, setIsEditing] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  const [user, setUser] = useState<UserProfile>({
    name: "Aayush Borse",
    email: "aayush@example.com",
    avatar: "/images/avatar.png",
    points: 1240,
    level: 5,
    quizzesTaken: 18,
    joinDate: "2024-01-15",
    streak: 12,
    totalXP: 2850,
    nextLevelXP: 3000,
  });

  const achievements: Achievement[] = [
    { 
      id: '1',
      title: "Eco Warrior", 
      description: "Complete 10 eco challenges", 
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/></svg>,
      unlocked: true,
      rarity: 'epic'
    },
    { 
      id: '2',
      title: "Quiz Master", 
      description: "Score 90%+ on 5 quizzes", 
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9M10,16V19.08L13.08,16H20V4H4V16H10Z"/></svg>,
      unlocked: true,
      progress: 4,
      maxProgress: 5,
      rarity: 'rare'
    },
    { 
      id: '3',
      title: "Green Streak", 
      description: "15 day login streak", 
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/></svg>,
      unlocked: false,
      progress: 12,
      maxProgress: 15,
      rarity: 'common'
    },
    { 
      id: '4',
      title: "Legend", 
      description: "Reach level 10", 
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5,16L3,5H1V3H4L6,14L7,19H20V17H8L7,16H5M6,2V4H17L18.5,9H6V11H19L17,4V2H6Z"/></svg>,
      unlocked: false,
      progress: 5,
      maxProgress: 10,
      rarity: 'legendary'
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { id: 'achievements', label: 'Achievements', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
    { id: 'settings', label: 'Settings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ];

  useEffect(() => {
    setAnimateStats(true);
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const calculateProgress = () => {
    return ((user.totalXP % 1000) / 1000) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-4 md:p-6">
      {/* Header with floating back button */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => router.push("/")}
          className="group flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-black/80 backdrop-blur-xl text-gray-700 dark:text-gray-300 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-200/50 dark:border-white/10"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Home</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Main Profile Card */}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 mb-8 border border-gray-200/50 dark:border-white/10 overflow-hidden relative">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-20 left-1/3 w-12 h-12 bg-pink-500 rounded-full blur-2xl animate-pulse"></div>
          </div>

          {/* Profile Header */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 mb-8">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/50 shadow-2xl">
                <Image
                  src={user.avatar}
                  alt="User Avatar"
                  width={128}
                  height={128}
                  className="object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
              {/* Status indicator */}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full animate-pulse"></div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {user.name}
                </h1>
                <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full">
                  Level {user.level}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{user.email}</p>
              
              {/* Quick Stats Row */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>{user.streak} day streak</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                  </svg>
                  <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="mt-6 max-w-md">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>{user.totalXP} XP</span>
                  <span>{user.nextLevelXP} XP</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ width: `${calculateProgress()}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {user.nextLevelXP - user.totalXP} XP to next level
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="relative z-10">
            <div className="flex space-x-1 bg-gray-100/70 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-2 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedTab === tab.id
                      ? 'bg-white dark:bg-white/20 text-blue-600 dark:text-white shadow-lg scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white hover:scale-105'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {selectedTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Animated Stats Cards */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className={`text-3xl font-bold mb-2 transition-all duration-1000 ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    {user.points.toLocaleString()}
                  </h3>
                  <p className="text-blue-100 font-medium">Total Points</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className={`text-3xl font-bold mb-2 transition-all duration-1000 delay-200 ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    {user.level}
                  </h3>
                  <p className="text-purple-100 font-medium">Current Level</p>
                </div>

                <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-pink-500/25">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9Z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className={`text-3xl font-bold mb-2 transition-all duration-1000 delay-400 ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    {user.quizzesTaken}
                  </h3>
                  <p className="text-pink-100 font-medium">Quizzes Completed</p>
                </div>
              </div>
            )}

            {selectedTab === 'achievements' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 shadow-xl ${
                      achievement.unlocked
                        ? 'bg-white dark:bg-gray-800 hover:shadow-2xl'
                        : 'bg-gray-100 dark:bg-gray-800/50 opacity-75'
                    }`}
                  >
                    {/* Rarity border */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}></div>
                    
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl text-white bg-gradient-to-r ${getRarityColor(achievement.rarity)} ${
                        achievement.unlocked ? '' : 'grayscale'
                      }`}>
                        {achievement.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`text-lg font-bold ${achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                            {achievement.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white capitalize`}>
                            {achievement.rarity}
                          </span>
                        </div>
                        
                        <p className={`text-sm mb-3 ${achievement.unlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'}`}>
                          {achievement.description}
                        </p>

                        {achievement.progress !== undefined && achievement.maxProgress && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Progress</span>
                              <span className="font-medium">{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} transition-all duration-1000`}
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {achievement.unlocked && (
                          <div className="absolute top-4 right-4">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'settings' && (
              <div className="space-y-8">
                <div className="bg-white/50 dark:bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={user.name}
                          onChange={(e) => setUser({ ...user, name: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          onChange={(e) => setUser({ ...user, email: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Graph Placeholder */}
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/10">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Activity Overview</h3>
            <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Activity chart coming soon</p>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/10">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: 'Completed Quiz: "Climate Change"', time: '2 hours ago', xp: 15 },
                { action: 'Unlocked Achievement: "Eco Warrior"', time: '1 day ago', xp: 50 },
                { action: 'Watched Reel: "Ocean Conservation"', time: '2 days ago', xp: 10 },
                { action: 'Started Hunt: "Green Energy"', time: '3 days ago', xp: 25 },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl hover:scale-105 transition-all duration-300">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm font-semibold rounded-full">
                      +{activity.xp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8">
          <button className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group">
            <svg className="w-8 h-8 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
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