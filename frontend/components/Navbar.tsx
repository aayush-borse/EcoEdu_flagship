import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useState, useEffect, useRef, useCallback } from "react";

export default function Navbar() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [glowPosition, setGlowPosition] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [totalXP, setTotalXP] = useState(1250); // Demo XP
  const [userLevel, setUserLevel] = useState(12); // Demo level
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showProfile, setShowProfile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [particleAnimation, setParticleAnimation] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Demo auth state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [user, setUser] = useState(null); // Current user data
  const navRef = useRef(null);
  const indicatorRef = useRef(null);

  // Enhanced navigation links with gaming elements
  const links = [
    { 
      href: "/", 
      label: t("home"), 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ), 
      xp: 5,
      color: "from-green-500 to-emerald-500",
      badge: "🏠"
    },
    { 
      href: "/reels", 
      label: t("reels"), 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ), 
      xp: 10,
      color: "from-purple-500 to-pink-500",
      badge: "🎬"
    },
    { 
      href: "/quiz", 
      label: t("quiz"), 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ), 
      xp: 15,
      color: "from-blue-500 to-cyan-500",
      badge: "🧠"
    },
    { 
      href: "/leaderboard", 
      label: t("leaderboard"), 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ), 
      xp: 20,
      color: "from-yellow-500 to-orange-500",
      badge: "🏆"
    },
    { 
      href: "/hunt", 
      label: t("hunt"), 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ), 
      xp: 25,
      color: "from-red-500 to-pink-500",
      badge: "🎯"
    },
  ];

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      message: 'Eco Warrior - Completed 50 quizzes',
      time: '2m ago',
      icon: '🏆',
      unread: true
    },
    {
      id: 2,
      type: 'social',
      title: 'Friend Request',
      message: 'EcoMaster42 wants to be your friend',
      time: '5m ago',
      icon: '👥',
      unread: true
    },
    {
      id: 3,
      type: 'event',
      title: 'Special Event',
      message: 'Double XP Weekend starts now!',
      time: '1h ago',
      icon: '⚡',
      unread: false
    }
  ];

  // Mock user data when signed in
  useEffect(() => {
    // Simulate checking auth state
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (authToken) {
      setIsAuthenticated(true);
      setUser({
        name: 'EcoWarrior',
        email: 'user@ecoxp.com',
        avatar: 'E',
        level: userLevel,
        xp: totalXP,
        joinedDate: '2024-01-15'
      });
    }
  }, [userLevel, totalXP]);

  // Handle authentication
  const handleSignIn = useCallback(async (email: string, password: string) => {
    // Simulate API call
    setTimeout(() => {
      setIsAuthenticated(true);
      setUser({
        name: email.split('@')[0],
        email: email,
        avatar: email.charAt(0).toUpperCase(),
        level: 1,
        xp: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      });
      setShowAuthModal(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', 'demo-token');
      }
    }, 1000);
  }, []);

  const handleSignOut = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    setShowProfile(false);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Find active index based on current route
  useEffect(() => {
    const currentIndex = links.findIndex(link => link.href === router.pathname);
    setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [router.pathname]);

  const changeLanguage = useCallback((lng: string) => {
    router.push(router.pathname, router.asPath, { locale: lng });
  }, [router]);

  const handleLinkClick = useCallback((index: number, xp: number) => {
    setActiveIndex(index);
    setTotalXP(prev => prev + xp);
    setXpGained(xp);
    setShowXpAnimation(true);
    setParticleAnimation(true);
    
    // Reset animations
    setTimeout(() => setShowXpAnimation(false), 2000);
    setTimeout(() => setParticleAnimation(false), 1000);
  }, []);

  const handleMouseEnter = useCallback((index: number, event: any) => {
    setHoverIndex(index);
    const rect = event.currentTarget.getBoundingClientRect();
    const navRect = navRef.current?.getBoundingClientRect();
    if (navRect) {
      setGlowPosition(rect.left - navRect.left + rect.width / 2);
    }
  }, []);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadNotifications(0);
    }
  }, [showNotifications]);

  return (
    <>
      {/* Particle System */}
      {particleAnimation && (
        <div className="fixed inset-0 pointer-events-none z-[90]">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${10 + Math.random() * 20}%`,
                animationDelay: `${i * 50}ms`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      )}

      {/* Enhanced XP Notification */}
      {showXpAnimation && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] pointer-events-none">
          <div className="relative">
            {/* Main notification */}
            <div className="animate-bounce bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold backdrop-blur-xl border border-white/30 relative overflow-hidden">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              
              <div className="relative flex items-center space-x-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-lg font-mono">+{xpGained} XP</span>
                <div className="text-2xl">⚡</div>
              </div>
            </div>
            
            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-ping"
                style={{
                  left: `${-20 + Math.random() * 140}%`,
                  top: `${-10 + Math.random() * 120}%`,
                  animationDelay: `${i * 200}ms`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Level Up Animation (triggered on level milestones) */}
      {totalXP % 500 < 50 && showXpAnimation && (
        <div className="fixed inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 z-[95] flex items-center justify-center pointer-events-none">
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text">
              LEVEL UP!
            </div>
            <div className="text-2xl text-white mt-2">Level {userLevel + 1}</div>
          </div>
        </div>
      )}

      <nav 
        ref={navRef}
        className={`relative bg-black/80 backdrop-blur-2xl border-b border-white/10 shadow-2xl sticky top-0 z-50 overflow-hidden transition-all duration-500 ${
          isScrolled ? 'shadow-cyan-500/10 border-cyan-500/20' : ''
        }`}
        style={{
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        }}
      >
        {/* Dynamic background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90" />
        
        {/* Animated grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{ 
            backgroundImage: `
              repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(34, 197, 94, 0.3) 50px, rgba(34, 197, 94, 0.3) 52px),
              repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(34, 197, 94, 0.3) 50px, rgba(34, 197, 94, 0.3) 52px)
            `,
          }} 
        />
        
        {/* Hover glow effect */}
        <div 
          className="absolute top-0 h-full w-40 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent transition-all duration-700 ease-out"
          style={{
            left: `${glowPosition - 80}px`,
            opacity: hoverIndex >= 0 ? 1 : 0,
          }}
        />

        <div className="relative px-8 py-4 flex items-center max-w-7xl mx-auto">
          
          {/* Enhanced Brand */}
          <div className="cursor-default select-none group">
            <Link href="/">
              <div className="relative flex items-center space-x-3">
                {/* Animated logo */}
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500 border border-white/20">
                  <span className="text-xl font-bold text-white">🌱</span>
                </div>
                
                {/* Brand text */}
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent transition-all duration-500 group-hover:scale-105 font-mono">
                    EcoXP
                  </h1>
                  <div className="text-xs text-gray-400 font-mono">SAVE THE PLANET</div>
                </div>
                
                {/* Glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-green-500/0 via-cyan-500/20 to-blue-500/0 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
          </div>

          {/* Player Stats - Level & XP (only when authenticated) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4 ml-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-mono">
                    <span className="text-cyan-400">LV.</span>
                    <span className="text-white font-bold">{userLevel}</span>
                  </div>
                  <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                      style={{ width: `${(totalXP % 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 font-mono">{totalXP}</div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic spacer */}
          <div className="flex-grow" />

          {/* Futuristic Navigation Pills */}
          <div className="relative flex items-center bg-white/5 backdrop-blur-xl rounded-2xl p-2 border border-white/10 shadow-2xl">
            
            {/* Active indicator with morphing effect */}
            <div
              ref={indicatorRef}
              className="absolute bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-2xl transition-all duration-500 ease-out border border-white/30"
              style={{
                height: '44px',
                width: '84px',
                left: `${8 + activeIndex * 88}px`,
                opacity: activeIndex >= 0 ? 1 : 0,
                boxShadow: activeIndex >= 0 ? '0 8px 32px rgba(6, 182, 212, 0.4)' : 'none',
              }}
            />

            {links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative z-10 group"
                onMouseEnter={(e) => handleMouseEnter(index, e)}
                onMouseLeave={() => setHoverIndex(-1)}
                onClick={() => handleLinkClick(index, link.xp)}
              >
                <div className="flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-300 hover:scale-110 cursor-pointer min-w-[84px] h-[44px] relative">
                  
                  {/* Icon with enhanced animations */}
                  <div className={`transition-all duration-300 group-hover:scale-125 relative ${
                    router.pathname === link.href
                      ? "text-white drop-shadow-lg"
                      : "text-gray-300 group-hover:text-white"
                  }`}>
                    {link.icon}
                    
                    {/* Active pulse effect */}
                    {router.pathname === link.href && (
                      <div className="absolute inset-0 animate-ping rounded-full bg-cyan-400/20" />
                    )}
                  </div>
                  
                  {/* Label with better visibility */}
                  <span className={`hidden sm:block text-xs font-medium mt-1 transition-all duration-300 font-mono ${
                    router.pathname === link.href
                      ? "text-white font-bold"
                      : "text-gray-400 group-hover:text-white"
                  }`}>
                    {link.label}
                  </span>

                  {/* Enhanced XP Badge */}
                  <div className={`absolute -top-1 -right-1 bg-gradient-to-r ${link.color} text-black text-xs rounded-full px-2 py-0.5 font-bold transition-all duration-300 shadow-lg border border-white/20 ${
                    hoverIndex === index ? 'scale-125 animate-pulse' : 'scale-90'
                  }`}>
                    <span className="font-mono">+{link.xp}</span>
                  </div>

                  {/* Emoji badge on hover */}
                  {hoverIndex === index && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce">
                      {link.badge}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Right Side Enhanced Controls */}
          <div className="flex items-center space-x-4 ml-6">
            
            {/* Notifications (only when authenticated) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="relative w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 shadow-lg"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a5.98 5.98 0 01-1.5-4.5V8a6 6 0 00-12 0v1a5.98 5.98 0 01-1.5 4.5L0 17h5m10 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  
                  {/* Notification badge */}
                  {unreadNotifications > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse border-2 border-black">
                      {unreadNotifications}
                    </div>
                  )}
                </button>

                {/* Notifications dropdown */}
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-black/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-[60] overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-white font-bold font-mono">NOTIFICATIONS</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0">
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">{notification.icon}</div>
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">{notification.title}</div>
                              <div className="text-gray-400 text-sm mt-1">{notification.message}</div>
                              <div className="text-gray-500 text-xs mt-2">{notification.time}</div>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Language Switcher */}
            <div className="relative group">
              <select
                value={router.locale}
                onChange={(e) => changeLanguage(e.target.value)}
                className="appearance-none bg-white/10 backdrop-blur-xl text-white px-4 py-2.5 pr-10 rounded-xl cursor-pointer border border-white/20 transition-all duration-300 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-lg font-mono"
                aria-label="Select language"
              >
                <option value="en" className="bg-black text-white">EN</option>
                <option value="hi" className="bg-black text-white">हिं</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Authentication Section */}
            {isAuthenticated ? (
              /* Enhanced Profile Button - When Signed In */
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="group relative"
                  title="Profile"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 flex items-center justify-center cursor-pointer transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/25 border-2 border-white/30 relative overflow-hidden">
                    
                    {/* Avatar */}
                    <div className="text-lg font-bold text-white z-10">{user?.avatar || 'E'}</div>
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    
                    {/* Level indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black border-2 border-black">
                      {userLevel}
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />
                </button>

                {/* Profile dropdown */}
                {showProfile && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-black/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-[60] overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {user?.avatar || 'E'}
                        </div>
                        <div>
                          <div className="text-white font-bold">{user?.name || 'EcoWarrior'}</div>
                          <div className="text-cyan-400 text-sm font-mono">Level {userLevel}</div>
                        </div>
                      </div>
                      
                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-cyan-400 font-bold font-mono">{totalXP}</div>
                          <div className="text-gray-400 text-xs">TOTAL XP</div>
                        </div>
                        <div>
                          <div className="text-green-400 font-bold font-mono">47</div>
                          <div className="text-gray-400 text-xs">ECO SCORE</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Link href="/profile" className="block w-full p-3 text-white hover:bg-white/10 rounded-xl transition-colors text-left">
                        👤 Profile Settings
                      </Link>
                      <Link href="/achievements" className="block w-full p-3 text-white hover:bg-white/10 rounded-xl transition-colors text-left">
                        🏆 Achievements
                      </Link>
                      <Link href="/stats" className="block w-full p-3 text-white hover:bg-white/10 rounded-xl transition-colors text-left">
                        📊 Statistics
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="block w-full p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Sign In/Up Buttons - When Not Authenticated */
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setShowAuthModal(true);
                  }}
                  className="px-4 py-2 text-white hover:text-cyan-400 transition-colors font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced bottom accent line with animation */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
        </div>
        
        {/* Scanning line effect */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse opacity-30" 
             style={{ animationDuration: '3s' }} />
      </nav>

      {/* Click outside handlers */}
      {(showNotifications || showProfile || showAuthModal) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
            if (!showAuthModal) setShowAuthModal(false);
          }}
        />
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {authMode === 'signin' ? 'Welcome Back!' : 'Join EcoXP'}
                </h2>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-400 mt-2">
                {authMode === 'signin' 
                  ? 'Sign in to continue your eco journey' 
                  : 'Start saving the planet today!'
                }
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const email = formData.get('email') as string;
                const password = formData.get('password') as string;
                handleSignIn(email, password);
              }}>
                
                {/* Email Field */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Password Field */}
                <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 hover:scale-[1.02] shadow-lg mb-4"
                >
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>

                {/* Toggle Auth Mode */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                  >
                    {authMode === 'signin' 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>
              </form>

              {/* Social Login Options */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-center text-gray-400 text-sm mb-4">Or continue with</div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center space-x-2 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-colors">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-black text-xs font-bold">G</div>
                    <span className="text-white text-sm">Google</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-colors">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">f</div>
                    <span className="text-white text-sm">Facebook</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        nav {
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
        }
        
        @keyframes scan {
          0% { left: -100px; }
          100% { left: 100%; }
        }
      `}</style>
    </>
  );
}