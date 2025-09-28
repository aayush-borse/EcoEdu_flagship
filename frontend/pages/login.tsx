import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [xpReward, setXpReward] = useState(0);
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formProgress, setFormProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievementUnlocked, setAchievementUnlocked] = useState(null);
  const [typingEffect, setTypingEffect] = useState('');
  const [fieldFocus, setFieldFocus] = useState('');
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  // Interactive 3D scenes for left side
  const scenes = [
    {
      title: "Welcome to the Future of Learning",
      subtitle: "Join 2.5M+ Earth Guardians",
      description: "Discover, learn, and save our planet through interactive adventures",
      icon: "🌍",
      gradient: "from-emerald-400 via-teal-500 to-cyan-600",
      animation: "planet-spin",
      stats: { guardians: "2.5M+", missions: "50K+", impact: "1B+ trees saved" },
      achievement: "Welcome Bonus: +50 XP"
    },
    {
      title: "Become an Eco Warrior",
      subtitle: "Level up your environmental knowledge",
      description: "Battle climate change with quizzes, challenges, and real-world missions",
      icon: "⚔️",
      gradient: "from-purple-500 via-pink-500 to-red-500",
      animation: "warrior-glow",
      stats: { warriors: "500K+", battles: "10M+", victories: "95% win rate" },
      achievement: "First Quest: +100 XP"
    },
    {
      title: "Hunt for Hidden Treasures",
      subtitle: "Explore mysteries of nature",
      description: "Unlock rare achievements, collect NFT badges, and climb global leaderboards",
      icon: "🏆",
      gradient: "from-yellow-400 via-orange-500 to-red-600",
      animation: "treasure-float",
      stats: { treasures: "1K+", collectors: "250K+", legendary: "100 NFTs" },
      achievement: "Treasure Hunter: +200 XP"
    }
  ];

  // Particle system for background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight;
    
    // Initialize particles
    particlesRef.current = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`
    }));
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);

  // Auto-rotate scenes with cinematic transitions
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % scenes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Typing effect for dynamic text
  useEffect(() => {
    const text = scenes[currentScene].title;
    let index = 0;
    setTypingEffect('');
    
    const typeTimer = setInterval(() => {
      setTypingEffect(text.substring(0, index));
      index++;
      if (index > text.length) {
        clearInterval(typeTimer);
      }
    }, 100);
    
    return () => clearInterval(typeTimer);
  }, [currentScene]);

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Form progress calculation
  useEffect(() => {
    const fields = isLogin ? ['email', 'password'] : ['name', 'email', 'password', 'confirmPassword'];
    const filledFields = fields.filter(field => formData[field].length > 0);
    setFormProgress((filledFields.length / fields.length) * 100);
  }, [formData, isLogin]);

  const handleSubmit = async () => {
    setLoading(true);
    
    // Simulate network delay with progress
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Trigger celebration sequence
    setShowConfetti(true);
    setXpReward(isLogin ? 50 : 150);
    setAchievementUnlocked(isLogin ? "Welcome Back Warrior!" : "New Guardian Registered!");
    setShowXpAnimation(true);
    
    setTimeout(() => {
      setShowConfetti(false);
      setShowXpAnimation(false);
      router.push('/');
    }, 4000);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getFieldXP = (fieldName) => {
    const xpMap = {
      name: 10,
      email: 15,
      password: 20,
      confirmPassword: 25
    };
    return xpMap[fieldName] || 5;
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-black">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`
              }}
            >
              🎉
            </div>
          ))}
        </div>
      )}

      {/* Epic XP Reward Animation */}
      {showXpAnimation && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-lg">
          <div className="text-center transform animate-pulse">
            {/* Achievement Badge */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-spin">
                <div className="w-28 h-28 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
              {/* Pulsing Rings */}
              <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-ping"></div>
              <div className="absolute inset-4 rounded-full border-2 border-orange-500 animate-ping" style={{animationDelay: '0.5s'}}></div>
            </div>
            
            {/* Achievement Text */}
            <h2 className="text-4xl font-bold text-white mb-4 animate-bounce">
              🎊 ACHIEVEMENT UNLOCKED! 🎊
            </h2>
            <p className="text-2xl text-yellow-400 font-bold mb-6">
              {achievementUnlocked}
            </p>
            
            {/* XP Counter */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 inline-block">
              <div className="text-6xl font-bold text-white mb-2">
                +{xpReward}
              </div>
              <div className="text-xl text-green-100">
                Experience Points
              </div>
            </div>
            
            {/* Level Up Effects */}
            <div className="mt-8 flex justify-center space-x-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce"
                  style={{animationDelay: `${i * 0.1}s`}}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Left Side - Interactive Cinematic Experience */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-0"
        />
        
        {/* Dynamic Gradient Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${scenes[currentScene].gradient} transition-all duration-2000 z-10`}
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Floating 3D Elements */}
        <div className="absolute inset-0 z-20">
          {/* Orbiting Elements */}
          <div className="absolute top-20 left-20 w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm animate-bounce" style={{animationDuration: '3s'}}></div>
          <div className="absolute top-40 right-32 w-12 h-12 bg-yellow-400/30 rounded-full backdrop-blur-sm animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-40 w-20 h-20 bg-pink-500/20 rounded-full backdrop-blur-sm animate-spin" style={{animationDuration: '8s'}}></div>
          
          {/* Geometric Shapes */}
          <div className="absolute top-1/3 left-10 w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 transform rotate-45 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-16 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-30 flex flex-col justify-center items-center text-white p-12 text-center">
          {/* Animated Main Icon */}
          <div className={`text-9xl mb-8 ${scenes[currentScene].animation === 'planet-spin' ? 'animate-spin' : scenes[currentScene].animation === 'warrior-glow' ? 'animate-pulse' : 'animate-bounce'}`} style={{animationDuration: '4s'}}>
            {scenes[currentScene].icon}
          </div>

          {/* Dynamic Text with Typing Effect */}
          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                {typingEffect}
              </span>
              <span className="animate-blink text-yellow-400">|</span>
            </h1>
            
            <div className="relative overflow-hidden">
              <p className="text-2xl font-semibold opacity-90 transform transition-all duration-1000 slide-in-right">
                {scenes[currentScene].subtitle}
              </p>
            </div>
            
            <div className="relative overflow-hidden">
              <p className="text-lg opacity-80 leading-relaxed transform transition-all duration-1000 slide-in-left" style={{transitionDelay: '0.2s'}}>
                {scenes[currentScene].description}
              </p>
            </div>

            {/* Achievement Preview */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <span className="font-medium">{scenes[currentScene].achievement}</span>
                </div>
                <div className="animate-bounce">🎁</div>
              </div>
            </div>

            {/* Live Statistics with Animations */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {Object.entries(scenes[currentScene].stats).map(([key, value], index) => (
                <div 
                  key={key} 
                  className="text-center transform transition-all duration-1000 hover:scale-110"
                  style={{animationDelay: `${index * 0.2}s`}}
                >
                  <div className="text-3xl font-bold animate-counter">{value}</div>
                  <div className="text-sm opacity-80 capitalize font-medium">{key}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Scene Navigation */}
          <div className="absolute bottom-12 flex space-x-3">
            {scenes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentScene(index)}
                className={`transition-all duration-500 hover:scale-125 ${
                  index === currentScene 
                    ? 'w-12 h-3 bg-white rounded-full shadow-lg' 
                    : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Parallax Floating Elements */}
        <div 
          className="absolute inset-0 z-10"
          style={{
            transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`
          }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full animate-pulse"
              style={{
                left: `${20 + i * 10}%`,
                top: `${10 + (i % 3) * 30}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + i * 0.3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Right Side - Gamified Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
        {/* Mobile Hero for Small Screens */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-90">
          <div className="flex items-center justify-center h-full text-white text-4xl">
            {scenes[currentScene].icon}
          </div>
        </div>
        
        <div className="relative z-10 px-8 sm:px-12 lg:px-16 xl:px-20 pt-20 lg:pt-0">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Form Progress</span>
              <span>{Math.round(formProgress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ width: `${formProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide-right"></div>
              </div>
            </div>
            {formProgress === 100 && (
              <div className="text-green-600 dark:text-green-400 text-sm mt-1 animate-bounce">
                ✨ Ready to launch! +{isLogin ? 50 : 150} XP waiting!
              </div>
            )}
          </div>

          {/* Animated Brand Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl mb-6 transform hover:scale-110 hover:rotate-12 transition-all duration-500 flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              {/* Orbiting Elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
            </div>
            
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent mb-2">
              EcoXP Universe
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {isLogin ? 'Welcome back, Earth Guardian! 🌍' : 'Begin your legendary journey! ⚡'}
            </p>
          </div>

          {/* Epic Form Toggle */}
          <div className="relative bg-gradient-to-r from-gray-100 via-white to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-3xl p-2 mb-8 shadow-inner">
            <div 
              className={`absolute top-2 bottom-2 w-1/2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-2xl transition-transform duration-500 ${
                isLogin ? 'transform translate-x-0' : 'transform translate-x-full'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
            </div>
            <div className="relative z-10 flex">
              <button
                onClick={() => setIsLogin(true)}
                className={`w-1/2 py-4 text-lg font-bold rounded-2xl transition-all duration-300 ${
                  isLogin ? 'text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:text-purple-600'
                }`}
              >
                🔑 Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`w-1/2 py-4 text-lg font-bold rounded-2xl transition-all duration-300 ${
                  !isLogin ? 'text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:text-purple-600'
                }`}
              >
                ⭐ Join Quest
              </button>
            </div>
          </div>

          {/* Gamified Form Fields */}
          <div className="space-y-6">
            {!isLogin && (
              <div className="transform transition-all duration-500 animate-slide-in-right">
                <label className="flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  <span>🧙‍♂️ Guardian Name</span>
                  <span className="text-xs bg-gradient-to-r from-green-500 to-blue-500 text-white px-2 py-1 rounded-full">
                    +{getFieldXP('name')} XP
                  </span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => setFieldFocus('name')}
                    onBlur={() => setFieldFocus('')}
                    className="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl"
                    placeholder="Enter your legendary name..."
                    required
                  />
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${fieldFocus === 'name' ? 'scale-125 text-purple-500' : 'text-gray-400'}`}>
                    👤
                  </div>
                  {formData.name && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 animate-bounce">
                      ✨
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                <span>📧 Magic Portal (Email)</span>
                <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full">
                  +{getFieldXP('email')} XP
                </span>
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFieldFocus('email')}
                  onBlur={() => setFieldFocus('')}
                  className="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl"
                  placeholder="guardian@ecoxp.com"
                  required
                />
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${fieldFocus === 'email' ? 'scale-125 text-blue-500' : 'text-gray-400'}`}>
                  ✉️
                </div>
                {formData.email && formData.email.includes('@') && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 animate-pulse">
                    ⚡
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                <span>🔐 Secret Spell (Password)</span>
                <span className="text-xs bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full">
                  +{getFieldXP('password')} XP
                </span>
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFieldFocus('password')}
                  onBlur={() => setFieldFocus('')}
                  className="w-full px-6 py-4 pl-14 pr-14 rounded-2xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl"
                  placeholder="Enter your secret spell..."
                  required
                />
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${fieldFocus === 'password' ? 'scale-125 text-red-500' : 'text-gray-400'}`}>
                  🗝️
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl hover:scale-125 transition-transform duration-200"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          formData.password.length > i * 2 
                            ? 'bg-gradient-to-r from-green-400 to-blue-500' 
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formData.password.length < 4 ? '🔓 Weak spell' : 
                     formData.password.length < 8 ? '⚡ Growing power' : '🔥 Legendary spell!'}
                  </p>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="transform transition-all duration-500 animate-slide-in-left">
                <label className="flex items-center justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  <span>🛡️ Confirm Secret Spell</span>
                  <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                    +{getFieldXP('confirmPassword')} XP
                  </span>
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => setFieldFocus('confirmPassword')}
                    onBlur={() => setFieldFocus('')}
                    className="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl"
                    placeholder="Repeat your secret spell..."
                    required
                  />
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${fieldFocus === 'confirmPassword' ? 'scale-125 text-purple-500' : 'text-gray-400'}`}>
                    🔒
                  </div>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 animate-bounce">
                      ✅
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center group cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" />
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    </div>
                  </div>
                  <span className="ml-3 text-gray-700 dark:text-gray-300 font-medium">Remember my magic ✨</span>
                </label>
                <button type="button" className="text-purple-600 hover:text-purple-500 dark:text-purple-400 font-bold hover:scale-105 transition-all duration-300">
                  🔮 Forgot spell?
                </button>
              </div>
            )}

            {/* Epic Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || formProgress < 100}
              className="group relative w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed text-xl overflow-hidden shadow-2xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  <span>🚀 Launching into EcoXP...</span>
                </div>
              ) : formProgress < 100 ? (
                <span>Complete form to unlock! 🔓</span>
              ) : (
                <div className="relative z-10">
                  <span className="flex items-center justify-center">
                    {isLogin ? '🌟 Sign In & Earn 50 XP' : '⚡ Join Quest & Earn 150 XP'}
                  </span>
                  {/* Animated Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                </div>
              )}
            </button>

            {/* XP Bonus Preview */}
            <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 rounded-3xl p-6 border-2 border-gradient-to-r from-yellow-200 to-orange-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                      {isLogin ? 'Welcome Back Bonus!' : 'New Guardian Rewards!'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isLogin ? 'Daily login streak continues' : 'Epic starter pack awaits'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    +{isLogin ? '50' : '150'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    XP Points
                  </div>
                </div>
              </div>
              
              {/* Bonus Items Preview */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {(isLogin ? 
                  [{icon: '⭐', label: 'XP Boost'}, {icon: '🔥', label: 'Streak'}, {icon: '🎯', label: 'Mission'}] :
                  [{icon: '🎖️', label: 'Badge'}, {icon: '💎', label: 'Gems'}, {icon: '🏆', label: 'Trophy'}]
                ).map((item, i) => (
                  <div key={i} className="text-center p-2 bg-white/50 dark:bg-black/20 rounded-xl">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Login Section */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-lg">
                <span className="px-6 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-bold">
                  ⚡ Quick Portal Access
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button className="group flex items-center justify-center px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg bg-white dark:bg-gray-800 text-lg font-bold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 hover:border-blue-400 transition-all duration-300 hover:scale-105">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <span>Google</span>
                </div>
                <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  +25 XP
                </div>
              </button>
              
              <button className="group flex items-center justify-center px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg bg-white dark:bg-gray-800 text-lg font-bold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:border-purple-400 transition-all duration-300 hover:scale-105">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">f</span>
                  </div>
                  <span>Facebook</span>
                </div>
                <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  +25 XP
                </div>
              </button>
            </div>
          </div>

          {/* Terms & Privacy */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <p className="mb-2">🛡️ By joining, you agree to our</p>
            <div className="space-x-4">
              <button className="text-purple-600 hover:text-purple-500 font-bold hover:underline transition-all duration-300">
                Terms of Adventure
              </button>
              <span>•</span>
              <button className="text-purple-600 hover:text-purple-500 font-bold hover:underline transition-all duration-300">
                Privacy Shield
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
              🌍 Join millions of Earth Guardians saving the planet through gamified learning!
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes slide-in-right {
          from { 
            opacity: 0; 
            transform: translateX(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes slide-in-left {
          from { 
            opacity: 0; 
            transform: translateX(-30px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes slide-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes counter {
          from { transform: scale(1); }
          50% { transform: scale(1.1); }
          to { transform: scale(1); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }
        
        .slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .animate-counter {
          animation: counter 2s ease-in-out infinite;
        }
        
        .animate-slide-right {
          animation: slide-right 2s linear infinite;
        }
        
        .animate-blink {
          animation: blink 1s infinite;
        }

        /* Parallax and 3D effects */
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .preserve-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #7c3aed, #db2777);
        }
      `}</style>
    </div>
  );
}