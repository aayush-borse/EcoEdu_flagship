import React, { useState, useEffect, useCallback } from "react";

interface QuizCardProps {
  question: string;
  options: string[];
  selected?: string;
  onSelect?: (option: string) => void;
  isAnswered?: boolean;
  correctAnswer?: string;
  showCorrectAnswer?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  category?: string;
  timeLimit?: number;
  onTimeUp?: () => void;
}

const QuizCard = ({ 
  question, 
  options, 
  selected, 
  onSelect,
  isAnswered = false,
  correctAnswer,
  showCorrectAnswer = false,
  difficulty = 'medium',
  category = 'Eco Quiz',
  timeLimit,
  onTimeUp
}: QuizCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Timer logic
  useEffect(() => {
    if (timeLimit && timeRemaining && timeRemaining > 0 && !isAnswered) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            onTimeUp?.();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [timeLimit, timeRemaining, isAnswered, onTimeUp]);

  // Pulse effect for time warning
  useEffect(() => {
    if (timeRemaining && timeRemaining <= 10 && timeRemaining > 0) {
      setPulseAnimation(true);
      const timer = setTimeout(() => setPulseAnimation(false), 500);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const handleOptionSelect = useCallback((option: string) => {
    if (!isAnswered) {
      onSelect?.(option);
    }
  }, [isAnswered, onSelect]);

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return 'from-green-500 to-emerald-600';
      case 'medium': return 'from-blue-500 to-cyan-600';
      case 'hard': return 'from-orange-500 to-red-600';
      case 'expert': return 'from-purple-500 to-pink-600';
      default: return 'from-blue-500 to-cyan-600';
    }
  };

  const getOptionState = (option: string) => {
    if (showCorrectAnswer && correctAnswer) {
      if (option === correctAnswer) {
        return 'correct';
      } else if (option === selected && option !== correctAnswer) {
        return 'incorrect';
      } else if (option === selected) {
        return 'selected';
      }
    } else if (option === selected) {
      return 'selected';
    }
    return 'default';
  };

  const getOptionStyles = (option: string, index: number) => {
    const state = getOptionState(option);
    const letter = String.fromCharCode(65 + index); // A, B, C, D
    
    const baseStyles = "w-full text-left p-4 rounded-xl border-2 transition-all duration-300 group/option relative overflow-hidden";
    
    switch (state) {
      case 'correct':
        return `${baseStyles} border-green-400 bg-green-400/20 text-green-300 scale-[1.02] shadow-lg shadow-green-400/25`;
      case 'incorrect':
        return `${baseStyles} border-red-400 bg-red-400/20 text-red-300 animate-pulse`;
      case 'selected':
        return `${baseStyles} border-cyan-400 bg-cyan-400/20 text-cyan-300 scale-[1.02] shadow-lg shadow-cyan-400/25`;
      default:
        return `${baseStyles} border-gray-600 bg-gray-800/50 text-gray-300 hover:border-green-400 hover:bg-green-400/10 hover:text-green-300 ${
          !isAnswered ? 'cursor-pointer hover:scale-[1.01] hover:shadow-lg' : 'cursor-not-allowed opacity-75'
        }`;
    }
  };

  const timePercentage = timeLimit && timeRemaining ? (timeRemaining / timeLimit) * 100 : 100;

  return (
    <div className={`transform transition-all duration-700 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
    }`}>
      
      {/* Main Card Container */}
      <div className="relative group">
        
        {/* Glow effect based on difficulty */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${getDifficultyColor()} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500`} />
        
        {/* Card */}
        <div className={`relative bg-black/90 border-2 border-green-400 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden ${
          pulseAnimation ? 'animate-pulse border-red-400' : ''
        }`}>
          
          {/* Retro grid background */}
          <div className="absolute inset-0 opacity-10 rounded-2xl overflow-hidden"
               style={{ 
                 backgroundImage: `
                   repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(34, 197, 94, 0.3) 20px, rgba(34, 197, 94, 0.3) 22px),
                   repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(34, 197, 94, 0.3) 20px, rgba(34, 197, 94, 0.3) 22px)
                 `,
               }} 
          />
          
          {/* Header */}
          <div className="relative p-6 border-b border-green-400/30">
            <div className="flex items-center justify-between mb-4">
              
              {/* Category Badge */}
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 bg-gradient-to-r ${getDifficultyColor()} rounded-full text-black text-xs font-bold`}>
                  {difficulty.toUpperCase()}
                </div>
                <div className="text-green-400 text-sm font-mono">{category}</div>
              </div>

              {/* Timer */}
              {timeLimit && timeRemaining !== undefined && (
                <div className="flex items-center space-x-2">
                  <div className="text-cyan-400 font-mono text-sm">
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        timePercentage > 50 ? 'bg-green-500' :
                        timePercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${timePercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Question */}
            <h3 className="text-xl font-bold text-green-400 font-mono leading-relaxed">
              {question}
            </h3>
          </div>

          {/* Options */}
          <div className="relative p-6 space-y-3">
            {options.map((option, index) => {
              const state = getOptionState(option);
              const letter = String.fromCharCode(65 + index);
              
              return (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                  className={getOptionStyles(option, index)}
                >
                  {/* Scan line effect for selected options */}
                  {state !== 'default' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                  )}
                  
                  <div className="relative flex items-center space-x-4">
                    
                    {/* Option Letter */}
                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center font-mono text-sm font-bold transition-all duration-300 ${
                      state === 'correct' ? 'border-green-400 bg-green-400 text-black' :
                      state === 'incorrect' ? 'border-red-400 bg-red-400 text-black' :
                      state === 'selected' ? 'border-cyan-400 bg-cyan-400 text-black' :
                      'border-gray-500 text-gray-400 group-hover/option:border-green-400 group-hover/option:text-green-400'
                    }`}>
                      {letter}
                    </div>
                    
                    {/* Option Text */}
                    <span className="flex-1 font-medium">{option}</span>
                    
                    {/* Status Icon */}
                    {state === 'correct' && (
                      <div className="text-green-400 animate-bounce">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </div>
                    )}
                    
                    {state === 'incorrect' && (
                      <div className="text-red-400 animate-pulse">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      </div>
                    )}
                    
                    {state === 'selected' && !showCorrectAnswer && (
                      <div className="text-cyan-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer with hints or stats */}
          {isAnswered && showCorrectAnswer && (
            <div className="relative p-4 border-t border-green-400/30 bg-gray-800/30">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400 font-mono">
                  {selected === correctAnswer ? 'CORRECT! +15 XP' : 'INCORRECT! +5 XP'}
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Difficulty: {difficulty}</span>
                  <span>Category: {category}</span>
                </div>
              </div>
            </div>
          )}

          {/* Scanning line effect */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse opacity-30" 
               style={{ animationDuration: '3s' }} />
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      {!isAnswered && (
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-500 font-mono">
            Use 1-{options.length} keys for quick selection
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizCard;