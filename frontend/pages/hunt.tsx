import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Navbar from "../components/Navbar";
import API from "../src/api";

interface EcoCreature {
  id: number;
  name: string;
  type: 'common' | 'rare' | 'epic' | 'legendary';
  emoji: string;
  points: number;
  description: string;
  location: { lat: number; lng: number };
  distance?: number;
  discovered: boolean;
  captureRate: number;
  habitat: string;
  rarity: number;
}

interface UserStats {
  level: number;
  xp: number;
  nextLevelXp: number;
  totalCaptures: number;
  uniqueCaptures: number;
  streak: number;
  inventory: { [key: string]: number };
}

interface CaptureAttempt {
  success: boolean;
  creature: EcoCreature;
  xpGained: number;
  itemsFound: string[];
  levelUp?: boolean;
}

// Custom hook for geolocation
const useGeolocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setError(null);
      },
      (error) => {
        setError("Unable to get location");
        // Fallback to default location (demo purposes)
        setLocation({ lat: 18.5204, lng: 73.8567 }); // Pune coordinates
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, error };
};

// Generate random creatures around user location
const generateEcoCreatures = (userLocation: { lat: number; lng: number }): EcoCreature[] => {
  const creatures = [
    { name: "Carbon Sprite", emoji: "🌿", type: 'common', points: 10, habitat: "Urban", captureRate: 0.8, description: "A friendly spirit that absorbs CO2" },
    { name: "Solar Firefly", emoji: "☀️", type: 'common', points: 15, habitat: "Parks", captureRate: 0.7, description: "Powered by pure sunlight energy" },
    { name: "Wind Dancer", emoji: "💨", type: 'rare', points: 25, habitat: "Hills", captureRate: 0.6, description: "Harnesses wind power gracefully" },
    { name: "Aqua Guardian", emoji: "💧", type: 'rare', points: 30, habitat: "Rivers", captureRate: 0.5, description: "Protects water sources from pollution" },
    { name: "Forest Phoenix", emoji: "🌲", type: 'epic', points: 50, habitat: "Forests", captureRate: 0.3, description: "Regenerates damaged ecosystems" },
    { name: "Ocean Leviathan", emoji: "🌊", type: 'epic', points: 60, habitat: "Oceans", captureRate: 0.25, description: "Guardian of marine life" },
    { name: "Earth Titan", emoji: "🏔️", type: 'legendary', points: 100, habitat: "Mountains", captureRate: 0.1, description: "Ancient protector of the planet" },
    { name: "Aurora Spirit", emoji: "🌌", type: 'legendary', points: 150, habitat: "Polar", captureRate: 0.05, description: "Mystical being of pure energy" },
    { name: "Recycling Bot", emoji: "♻️", type: 'common', points: 12, habitat: "Cities", captureRate: 0.75, description: "Turns waste into treasure" },
    { name: "Bee Commander", emoji: "🐝", type: 'rare', points: 35, habitat: "Gardens", captureRate: 0.4, description: "Leads pollination missions" },
  ];

  return creatures.map((creature, index) => {
    const angle = (index / creatures.length) * 2 * Math.PI;
    const distance = Math.random() * 2000 + 100; // 100m to 2km
    const lat = userLocation.lat + (Math.cos(angle) * distance) / 111320;
    const lng = userLocation.lng + (Math.sin(angle) * distance) / (111320 * Math.cos(userLocation.lat));
    
    return {
      id: index + 1,
      ...creature,
      location: { lat, lng },
      distance: Math.round(distance),
      discovered: Math.random() > 0.7,
      rarity: creature.type === 'common' ? 1 : creature.type === 'rare' ? 2 : creature.type === 'epic' ? 3 : 4,
    } as EcoCreature;
  });
};

// Calculate distance between two points
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return Math.round(R * c);
};

// Creature card component
const CreatureCard = ({ creature, userLocation, onCapture, isCapturing, captureSuccess }) => {
  const distance = userLocation ? calculateDistance(
    userLocation.lat, userLocation.lng,
    creature.location.lat, creature.location.lng
  ) : creature.distance;

  const isInRange = distance <= 50; // 50 meter capture range
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  return (
    <div className={`relative group transform transition-all duration-500 ${
      isCapturing === creature.id ? 'scale-105 animate-pulse' : ''
    } ${captureSuccess === creature.id ? 'animate-bounce' : ''}`}>
      
      {/* Glow effect based on rarity */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${rarityColors[creature.type]} opacity-0 group-hover:opacity-30 rounded-2xl blur transition duration-500`} />
      
      {/* Main card */}
      <div className="relative bg-black/90 border-2 border-green-400 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
        
        {/* Rarity indicator */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold ${
          creature.type === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' :
          creature.type === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
          creature.type === 'rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
          'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
        }`}>
          {creature.type.toUpperCase()}
        </div>

        {/* Creature visual */}
        <div className="text-center mb-4">
          <div className={`text-6xl mb-2 ${isInRange ? 'animate-bounce' : ''}`}>
            {creature.emoji}
          </div>
          <h3 className="text-xl font-bold text-green-400 font-mono">{creature.name}</h3>
          <p className="text-sm text-gray-400 mb-2">{creature.description}</p>
          <div className="text-cyan-400 font-mono text-sm">{creature.habitat}</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div>
            <div className="text-lg font-bold text-cyan-400 font-mono">{creature.points}</div>
            <div className="text-xs text-gray-400">XP POINTS</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-400 font-mono">{distance}m</div>
            <div className="text-xs text-gray-400">DISTANCE</div>
          </div>
        </div>

        {/* Capture rate indicator */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Capture Rate</span>
            <span>{Math.round(creature.captureRate * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                creature.captureRate > 0.7 ? 'bg-green-500' :
                creature.captureRate > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${creature.captureRate * 100}%` }}
            />
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => onCapture(creature)}
          disabled={!isInRange || isCapturing === creature.id}
          className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
            !isInRange 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : isCapturing === creature.id
              ? 'bg-yellow-500 text-black animate-pulse'
              : 'bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:from-green-600 hover:to-cyan-600 hover:scale-105 shadow-lg'
          }`}
        >
          {!isInRange ? `GET CLOSER (${distance}m)` :
           isCapturing === creature.id ? 'CAPTURING...' :
           creature.discovered ? 'CAPTURE AGAIN' : 'CAPTURE!'}
        </button>
      </div>
    </div>
  );
};

// Capture animation component
const CaptureAnimation = ({ attempt, onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (attempt) {
      const stages = [
        () => setStage(1), // Throw animation
        () => setStage(2), // Capture attempt
        () => setStage(3), // Result
        () => setTimeout(onComplete, 1000)
      ];

      stages.forEach((stage, index) => {
        setTimeout(stage, index * 800);
      });
    }
  }, [attempt, onComplete]);

  if (!attempt) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        
        {/* Creature */}
        <div className={`text-8xl transition-all duration-800 ${
          stage >= 2 ? 'scale-150 opacity-50' : 'scale-100'
        }`}>
          {attempt.creature.emoji}
        </div>

        {/* Pokéball animation */}
        {stage >= 1 && (
          <div className={`text-4xl transition-all duration-500 ${
            stage >= 2 ? 'animate-spin' : 'animate-bounce'
          }`}>
            ⚪
          </div>
        )}

        {/* Result */}
        {stage >= 3 && (
          <div className="space-y-4">
            {attempt.success ? (
              <div className="space-y-2">
                <div className="text-4xl text-green-400 font-bold font-mono animate-pulse">
                  CAPTURED!
                </div>
                <div className="text-2xl text-cyan-400 font-mono">
                  +{attempt.xpGained} XP
                </div>
                {attempt.itemsFound.length > 0 && (
                  <div className="text-lg text-yellow-400">
                    Items found: {attempt.itemsFound.join(', ')}
                  </div>
                )}
                {attempt.levelUp && (
                  <div className="text-3xl text-purple-400 font-bold animate-bounce">
                    LEVEL UP!
                  </div>
                )}
              </div>
            ) : (
              <div className="text-4xl text-red-400 font-bold font-mono animate-pulse">
                ESCAPED!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Player stats component
const PlayerStats = ({ stats }) => (
  <div className="bg-black/90 border-2 border-green-400 rounded-2xl p-6 mb-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div>
        <div className="text-2xl font-bold text-cyan-400 font-mono">LV.{stats.level}</div>
        <div className="text-sm text-gray-400">LEVEL</div>
        <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">{stats.xp}/{stats.nextLevelXp} XP</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-green-400 font-mono">{stats.totalCaptures}</div>
        <div className="text-sm text-gray-400">CAPTURES</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-purple-400 font-mono">{stats.uniqueCaptures}</div>
        <div className="text-sm text-gray-400">SPECIES</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-orange-400 font-mono">🔥{stats.streak}</div>
        <div className="text-sm text-gray-400">STREAK</div>
      </div>
    </div>
  </div>
);

// Inventory component
const Inventory = ({ inventory, onUseItem }) => (
  <div className="bg-black/90 border-2 border-green-400 rounded-2xl p-6">
    <h3 className="text-xl font-bold text-green-400 font-mono mb-4">📦 INVENTORY</h3>
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {Object.entries(inventory).map(([item, count]) => {
        const itemEmojis = {
          'pokeball': '⚪',
          'superball': '🔴',
          'ultraball': '🟣',
          'berries': '🍓',
          'magnet': '🧲',
          'compass': '🧭',
        };
        
        return (
          <button
            key={item}
            onClick={() => onUseItem(item)}
            className="bg-gray-800 border border-green-400 rounded-lg p-3 hover:bg-green-400/20 transition-all duration-300 text-center"
          >
            <div className="text-2xl mb-1">{itemEmojis[item] || '📦'}</div>
            <div className="text-green-400 text-xs font-mono">{String(count)}</div>

          </button>
        );
      })}
    </div>
  </div>
);

// Daily challenges component
const DailyChallenges = ({ challenges, onClaimReward }) => (
  <div className="bg-black/90 border-2 border-green-400 rounded-2xl p-6">
    <h3 className="text-xl font-bold text-green-400 font-mono mb-4">📋 DAILY MISSIONS</h3>
    <div className="space-y-3">
      {challenges.map((challenge, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div className="flex-1">
            <div className="text-white font-medium">{challenge.description}</div>
            <div className="text-sm text-gray-400">{challenge.progress}/{challenge.target}</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
              />
            </div>
          </div>
          <div className="ml-4">
            {challenge.completed ? (
              <button
                onClick={() => onClaimReward(index)}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg hover:scale-105 transition-transform"
              >
                CLAIM
              </button>
            ) : (
              <div className="text-cyan-400 font-bold">+{challenge.reward} XP</div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function Hunt() {
  const { t } = useTranslation("common");
  const { location, error } = useGeolocation();
  const [creatures, setCreatures] = useState<EcoCreature[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    totalCaptures: 0,
    uniqueCaptures: 0,
    streak: 0,
    inventory: {
      pokeball: 5,
      superball: 2,
      berries: 3,
      magnet: 1,
      compass: 1,
    }
  });
  const [isCapturing, setIsCapturing] = useState<number | null>(null);
  const [captureAttempt, setCaptureAttempt] = useState<CaptureAttempt | null>(null);
  const [captureSuccess, setCaptureSuccess] = useState<number | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [dailyChallenges, setDailyChallenges] = useState([
    { description: "Capture 5 eco-creatures", progress: 0, target: 5, reward: 50, completed: false },
    { description: "Walk 2km while hunting", progress: 0, target: 2000, reward: 30, completed: false },
    { description: "Discover 3 new species", progress: 0, target: 3, reward: 75, completed: false },
  ]);

  // Generate creatures when location is available
  useEffect(() => {
    if (location) {
      const newCreatures = generateEcoCreatures(location);
      setCreatures(newCreatures);
    }
  }, [location]);

  // Capture creature function
  const captureCreature = useCallback(async (creature: EcoCreature) => {
    setIsCapturing(creature.id);
    
    // Simulate capture attempt with delay
    setTimeout(() => {
      const captureRoll = Math.random();
      const itemBonus = selectedItem === 'superball' ? 0.2 : selectedItem === 'ultraball' ? 0.4 : 0;
      const berryBonus = selectedItem === 'berries' ? 0.15 : 0;
      const success = captureRoll < (creature.captureRate + itemBonus + berryBonus);
      
      const xpGained = success ? creature.points + (creature.rarity * 5) : Math.floor(creature.points * 0.1);
      const itemsFound = success && Math.random() > 0.7 ? ['berries', 'pokeball'][Math.floor(Math.random() * 2)] : [];
      
      // Update user stats
      setUserStats(prev => {
        const newXp = prev.xp + xpGained;
        const newLevel = Math.floor(newXp / 100) + 1;
        const levelUp = newLevel > prev.level;
        
        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          nextLevelXp: newLevel * 100,
          totalCaptures: success ? prev.totalCaptures + 1 : prev.totalCaptures,
          uniqueCaptures: success && !creature.discovered ? prev.uniqueCaptures + 1 : prev.uniqueCaptures,
          streak: success ? prev.streak + 1 : 0,
          inventory: {
            ...prev.inventory,
            ...(itemsFound.length > 0 ? { [itemsFound[0]]: (prev.inventory[itemsFound[0]] || 0) + 1 } : {})
          }
        };
      });

      // Update creature as discovered if captured
      if (success) {
        setCreatures(prev => prev.map(c => 
          c.id === creature.id ? { ...c, discovered: true } : c
        ));
        setCaptureSuccess(creature.id);
        setTimeout(() => setCaptureSuccess(null), 2000);
      }

      // Update daily challenges
      setDailyChallenges(prev => prev.map(challenge => {
        if (challenge.description.includes("Capture") && success) {
          const newProgress = Math.min(challenge.progress + 1, challenge.target);
          return {
            ...challenge,
            progress: newProgress,
            completed: newProgress >= challenge.target
          };
        }
        if (challenge.description.includes("species") && success && !creature.discovered) {
          const newProgress = Math.min(challenge.progress + 1, challenge.target);
          return {
            ...challenge,
            progress: newProgress,
            completed: newProgress >= challenge.target
          };
        }
        return challenge;
      }));

      setCaptureAttempt({
        success,
        creature,
        xpGained,
        itemsFound: Array.isArray(itemsFound) ? itemsFound : [itemsFound],
        levelUp: false // We'll implement this properly
      });
      setIsCapturing(null);
    }, 2000);
  }, [selectedItem]);

  const useItem = useCallback((item: string) => {
    if (userStats.inventory[item] > 0) {
      setSelectedItem(item);
      setUserStats(prev => ({
        ...prev,
        inventory: {
          ...prev.inventory,
          [item]: prev.inventory[item] - 1
        }
      }));
      
      // Clear selected item after 60 seconds
      setTimeout(() => setSelectedItem(null), 60000);
    }
  }, [userStats.inventory]);

  const claimReward = useCallback((challengeIndex: number) => {
    const challenge = dailyChallenges[challengeIndex];
    if (challenge.completed) {
      setUserStats(prev => ({
        ...prev,
        xp: prev.xp + challenge.reward
      }));
      
      setDailyChallenges(prev => prev.map((ch, index) => 
        index === challengeIndex ? { ...ch, progress: 0, completed: false } : ch
      ));
    }
  }, [dailyChallenges]);

  if (error && !location) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Navbar />
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-2xl font-bold text-red-400">Location Required</h3>
          <p className="text-gray-300">Please enable location services to start hunting eco-creatures!</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      
      {/* Dynamic background based on time of day */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-green-900/20" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      <Navbar />
      
      <div className="relative max-w-7xl mx-auto p-4 pt-20">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text mb-4 font-mono">
            ECO HUNT
          </h1>
          <p className="text-green-400 text-lg font-mono">
            🌍 CATCH 'EM ALL FOR THE PLANET! 🌍
          </p>
        </div>

        {/* Player stats */}
        <PlayerStats stats={userStats} />

        {/* Active item indicator */}
        {selectedItem && (
          <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-xl p-4 mb-6 text-center">
            <div className="text-yellow-400 font-bold font-mono">
              🔥 {selectedItem.toUpperCase()} ACTIVE! Enhanced capture rate for 60 seconds
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <button
            onClick={() => setShowInventory(!showInventory)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
          >
            📦 INVENTORY ({Object.values(userStats.inventory).reduce((a, b) => a + b, 0)})
          </button>
          <button
            onClick={() => location && setCreatures(generateEcoCreatures(location))}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
          >
            🔄 REFRESH MAP
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">
            📡 RADAR SCAN
          </button>
        </div>

        {/* Inventory overlay */}
        {showInventory && (
          <div className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-green-400 font-mono">INVENTORY</h3>
                <button
                  onClick={() => setShowInventory(false)}
                  className="text-red-400 hover:text-red-300 text-2xl"
                >
                  ✕
                </button>
              </div>
              <Inventory inventory={userStats.inventory} onUseItem={useItem} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Creatures grid */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-green-400 font-mono mb-6 text-center">
              🔍 NEARBY ECO-CREATURES 🔍
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {creatures.map((creature) => (
                <CreatureCard
                  key={creature.id}
                  creature={creature}
                  userLocation={location}
                  onCapture={captureCreature}
                  isCapturing={isCapturing}
                  captureSuccess={captureSuccess}
                />
              ))}
            </div>
          </div>

          {/* Sidebar with challenges and map */}
          <div className="space-y-6">
            
            {/* Mini map */}
            <div className="bg-black/90 border-2 border-green-400 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-green-400 font-mono mb-4">🗺️ ECO-RADAR</h3>
              <div className="relative w-full h-48 bg-gray-900 rounded-xl border border-green-400 overflow-hidden">
                
                {/* Radar sweep animation */}
                <div className="absolute inset-0">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-spin origin-left opacity-50" />
                </div>
                
                {/* Creature blips */}
                {creatures.slice(0, 8).map((creature, index) => {
                  const angle = (index / 8) * 2 * Math.PI;
                  const radius = 30 + (creature.distance / 50);
                  const x = 50 + Math.cos(angle) * radius;
                  const y = 50 + Math.sin(angle) * radius;
                  
                  return (
                    <div
                      key={creature.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 text-lg animate-pulse ${
                        creature.type === 'legendary' ? 'text-yellow-400' :
                        creature.type === 'epic' ? 'text-purple-400' :
                        creature.type === 'rare' ? 'text-blue-400' :
                        'text-green-400'
                      }`}
                      style={{ 
                        left: `${Math.min(90, Math.max(10, x))}%`, 
                        top: `${Math.min(90, Math.max(10, y))}%`,
                        fontSize: creature.type === 'legendary' ? '20px' : '16px'
                      }}
                    >
                      {creature.emoji}
                    </div>
                  );
                })}
                
                {/* Distance rings */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-green-400/30 rounded-full" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-green-400/20 rounded-full" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-44 h-44 border border-green-400/10 rounded-full" />
              </div>
              
              {/* Radar stats */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-cyan-400 font-mono">
                    {creatures.filter(c => calculateDistance(
                      location?.lat || 0, location?.lng || 0,
                      c.location.lat, c.location.lng
                    ) <= 100).length}
                  </div>
                  <div className="text-xs text-gray-400">NEARBY</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-400 font-mono">
                    {creatures.filter(c => c.type === 'rare' || c.type === 'epic' || c.type === 'legendary').length}
                  </div>
                  <div className="text-xs text-gray-400">RARE+</div>
                </div>
              </div>
            </div>

            {/* Daily challenges */}
            <DailyChallenges challenges={dailyChallenges} onClaimReward={claimReward} />

            {/* Weather & Time bonus */}
            <div className="bg-black/90 border-2 border-green-400 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-green-400 font-mono mb-4">🌤️ CONDITIONS</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Weather Bonus</span>
                  <span className="text-cyan-400 font-mono">☀️ +15% XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Time Bonus</span>
                  <span className="text-green-400 font-mono">🌅 Dawn +10% Rare</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Location</span>
                  <span className="text-orange-400 font-mono">🏙️ Urban Zone</span>
                </div>
              </div>
            </div>

            {/* Achievement showcase */}
            <div className="bg-black/90 border-2 border-green-400 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-green-400 font-mono mb-4">🏆 RECENT ACHIEVEMENTS</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 bg-yellow-500/20 rounded-lg">
                  <span className="text-2xl">🥇</span>
                  <div>
                    <div className="text-yellow-400 font-bold text-sm">First Capture!</div>
                    <div className="text-gray-400 text-xs">Caught your first eco-creature</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-green-500/20 rounded-lg">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <div className="text-green-400 font-bold text-sm">Eco Warrior</div>
                    <div className="text-gray-400 text-xs">10 successful captures</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-purple-500/20 rounded-lg">
                  <span className="text-2xl">🔮</span>
                  <div>
                    <div className="text-purple-400 font-bold text-sm">Rare Hunter</div>
                    <div className="text-gray-400 text-xs">Discovered 5 rare species</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard preview */}
            <div className="bg-black/90 border-2 border-green-400 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-green-400 font-mono mb-4">👥 HUNTERS NEARBY</h3>
              <div className="space-y-2">
                {['EcoMaster42', 'GreenHunter', 'NatureLover'].map((name, index) => (
                  <div key={name} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-green-500' : 'bg-gray-500'
                      } animate-pulse`} />
                      <span className="text-white text-sm">{name}</span>
                    </div>
                    <div className="text-cyan-400 text-sm font-mono">
                      LV.{15 - index * 3}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-bold hover:scale-105 transition-transform text-sm">
                VIEW FULL LEADERBOARD
              </button>
            </div>

            {/* Special events */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-400 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-purple-400 font-mono mb-4">✨ SPECIAL EVENT</h3>
              <div className="text-center space-y-3">
                <div className="text-3xl animate-bounce">🌙</div>
                <div className="text-purple-300 font-bold">Lunar Eclipse Event</div>
                <div className="text-sm text-purple-200">Legendary creatures appear 3x more often!</div>
                <div className="text-xs text-gray-400">Ends in: 23h 45m</div>
                <div className="w-full bg-purple-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating action buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-30">
          <button className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform">
            📸
          </button>
          <button className="w-14 h-14 bg-gradient-to-br from-green-400 to-cyan-500 rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform">
            🎯
          </button>
          <button className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform animate-pulse">
            🔮
          </button>
        </div>

        {/* Capture streak indicator */}
        {userStats.streak > 0 && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-30">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 rounded-full shadow-2xl animate-bounce">
              <div className="text-white font-bold font-mono text-lg">
                🔥 {userStats.streak} STREAK!
              </div>
            </div>
          </div>
        )}

        {/* Level up notification */}
        {/* This would be triggered by level up logic */}

        {/* Emergency alerts */}
        <div className="fixed top-32 right-6 z-30 space-y-2">
          <div className="bg-red-500/90 border border-red-400 rounded-xl p-3 shadow-xl animate-pulse">
            <div className="text-white font-bold text-sm">⚠️ LEGENDARY NEARBY!</div>
            <div className="text-red-200 text-xs">Aurora Spirit detected 150m north</div>
          </div>
        </div>

        {/* Social features notification */}
        <div className="fixed top-48 right-6 z-30">
          <div className="bg-blue-500/90 border border-blue-400 rounded-xl p-3 shadow-xl">
            <div className="text-white font-bold text-sm">👥 FRIEND REQUEST</div>
            <div className="text-blue-200 text-xs">EcoMaster42 wants to team up!</div>
            <div className="flex space-x-2 mt-2">
              <button className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">Accept</button>
              <button className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">Decline</button>
            </div>
          </div>
        </div>
      </div>

      {/* Capture animation overlay */}
      <CaptureAnimation 
        attempt={captureAttempt} 
        onComplete={() => setCaptureAttempt(null)} 
      />

      {/* Background music controls (hidden but functional) */}
      <div className="fixed bottom-6 left-6 z-30">
        <button className="w-12 h-12 bg-black/50 border border-green-400 rounded-full flex items-center justify-center text-green-400 hover:bg-green-400/20 transition-colors">
          🎵
        </button>
      </div>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 left-4 bg-black/80 border border-gray-600 rounded p-2 text-xs text-gray-400 font-mono">
          <div>Location: {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Loading...'}</div>
          <div>Creatures: {creatures.length}</div>
          <div>Level: {userStats.level} ({userStats.xp}/{userStats.nextLevelXp} XP)</div>
          <div>Captures: {userStats.totalCaptures}</div>
          <div>Streak: {userStats.streak}</div>
        </div>
      )}
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