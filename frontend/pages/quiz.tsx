import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Navbar from "../components/Navbar";
import QuizCard from "../components/QuizCard";
import API from "../src/api";

interface Quiz {
  id: number;
  question: string;
  options: string[];
  correctAnswer?: string;
}

interface EcoPointsReward {
  points: number;
  message: string;
  streak?: number;
}

// Custom hook for quiz management
const useQuiz = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/quiz/");
      setQuizzes(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  }, []);

  const submitQuiz = useCallback(async (answers: { [key: number]: string }) => {
    const payload = { answers: Object.values(answers).map((a) => ({ answer: a, correct: true })) };
    try {
      const res = await API.post<{
        score: number; success: boolean 
}>("/quiz/submit", payload);

      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return { quizzes, loading, error, submitQuiz, refetch: fetchQuizzes };
};

// Retro-styled progress bar
const RetroProgressBar = ({ current, total, streak }) => (
  <div className="relative mb-8">
    <div className="flex items-center justify-between mb-2">
      <div className="text-green-400 font-mono text-sm">
        QUESTION {current + 1}/{total}
      </div>
      {streak > 0 && (
        <div className="flex items-center space-x-1 bg-orange-500/20 border border-orange-400 rounded px-2 py-1">
          <span className="text-orange-400 text-xs">🔥</span>
          <span className="text-orange-400 font-mono text-xs">STREAK {streak}</span>
        </div>
      )}
    </div>
    
    <div className="h-4 bg-gray-800 border-2 border-green-400 rounded-lg overflow-hidden relative">
      <div 
        className="h-full bg-gradient-to-r from-green-500 to-cyan-400 transition-all duration-500 relative overflow-hidden"
        style={{ width: `${((current + 1) / total) * 100}%` }}
      >
        {/* Animated scanlines */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      </div>
      
      {/* Retro grid pattern */}
      <div className="absolute inset-0 opacity-30" 
           style={{ 
             backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(34, 197, 94, 0.3) 4px, rgba(34, 197, 94, 0.3) 6px)',
           }} 
      />
    </div>
  </div>
);

// Eco Points Popup Component
const EcoPointsPopup = ({ reward, isVisible, onClose }) => {
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setAnimationStage(0);
      const timer1 = setTimeout(() => setAnimationStage(1), 100);
      const timer2 = setTimeout(() => setAnimationStage(2), 600);
      const timer3 = setTimeout(() => {
        setAnimationStage(3);
        setTimeout(onClose, 500);
      }, 2500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black/80 transition-opacity duration-300 ${
        animationStage >= 1 ? 'opacity-100' : 'opacity-0'
      }`} />
      
      {/* Popup container */}
      <div className={`relative transform transition-all duration-500 ${
        animationStage >= 1 
          ? 'scale-100 opacity-100' 
          : 'scale-75 opacity-0'
      }`}>
        
        {/* Retro glow effect */}
        <div className="absolute -inset-8 bg-green-500/30 rounded-full blur-2xl animate-pulse" />
        
        {/* Main popup */}
        <div className="relative bg-black border-4 border-green-400 rounded-2xl p-8 max-w-sm mx-auto shadow-2xl">
          
          {/* Retro scanlines */}
          <div className="absolute inset-0 opacity-20 rounded-2xl overflow-hidden"
               style={{ 
                 backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 197, 94, 0.5) 2px, rgba(34, 197, 94, 0.5) 4px)',
               }} 
          />
          
          {/* Content */}
          <div className="relative text-center space-y-6">
            
            {/* Success icon with animation */}
            <div className={`transform transition-all duration-700 ${
              animationStage >= 2 ? 'scale-110 rotate-12' : 'scale-100'
            }`}>
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            </div>
            
            {/* Points display */}
            <div className="space-y-2">
              <div className="text-green-400 font-mono text-sm">CORRECT ANSWER!</div>
              <div className={`text-4xl font-bold text-cyan-400 font-mono transition-all duration-500 ${
                animationStage >= 2 ? 'animate-bounce' : ''
              }`}>
                +{reward.points} ECO
              </div>
              <div className="text-green-300 text-sm">{reward.message}</div>
            </div>
            
            {/* Streak bonus */}
            {reward.streak && reward.streak > 1 && (
              <div className="bg-orange-500/20 border border-orange-400 rounded-lg p-3">
                <div className="text-orange-400 font-mono text-xs">STREAK BONUS!</div>
                <div className="text-orange-300 text-sm">🔥 {reward.streak}x Multiplier Active</div>
              </div>
            )}
            
            {/* Animated particles */}
            <div className="absolute -top-4 -right-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 bg-cyan-400 rounded-full transition-all duration-1000 ${
                    animationStage >= 2 
                      ? `translate-x-${(i + 1) * 4} -translate-y-${(i + 1) * 4} opacity-0` 
                      : 'translate-x-0 translate-y-0 opacity-100'
                  }`}
                  style={{ 
                    animationDelay: `${i * 100}ms`,
                    left: `${i * 8}px`,
                    top: `${i * 8}px`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced quiz card wrapper
const RetroQuizCard = ({ quiz, selected, onSelect, isAnswered }) => (
  <div className="relative group">
    
    {/* Retro glow effect */}
    <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 via-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
    
    {/* Main card */}
    <div className="relative bg-black/90 border-2 border-green-400 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
      
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-10 rounded-2xl overflow-hidden"
           style={{ 
             backgroundImage: `
               repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(34, 197, 94, 0.3) 20px, rgba(34, 197, 94, 0.3) 22px),
               repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(34, 197, 94, 0.3) 20px, rgba(34, 197, 94, 0.3) 22px)
             `,
           }} 
      />
      
      {/* Content */}
      <div className="relative">
        <h3 className="text-xl font-bold text-green-400 mb-6 font-mono">
          {quiz.question}
        </h3>
        
        <div className="space-y-3">
          {quiz.options.map((option, index) => {
            const isSelected = selected === option;
            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
            
            return (
              <button
                key={option}
                onClick={() => !isAnswered && onSelect(option)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 group/option ${
                  isSelected 
                    ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300' 
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-green-400 hover:bg-green-400/10'
                } ${isAnswered ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:scale-[1.02]'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center font-mono text-sm font-bold transition-colors ${
                    isSelected 
                      ? 'border-cyan-400 bg-cyan-400 text-black' 
                      : 'border-gray-500 text-gray-400 group-hover/option:border-green-400 group-hover/option:text-green-400'
                  }`}>
                    {optionLetter}
                  </div>
                  <span className="flex-1">{option}</span>
                  {isSelected && (
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
      </div>
    </div>
  </div>
);

// Retro button component
const RetroButton = ({ children, onClick, disabled, variant = 'primary', className = "" }) => {
  const variants = {
    primary: "border-green-400 bg-green-400/20 text-green-400 hover:bg-green-400/30 hover:scale-105",
    secondary: "border-gray-500 bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 hover:scale-105",
    success: "border-cyan-400 bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 hover:scale-105",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 border-2 rounded-xl font-mono font-bold
        transition-all duration-300 shadow-lg
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default function Quiz() {
  const { t } = useTranslation("common");
  const { quizzes, loading, error, submitQuiz } = useQuiz();
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalEcoPoints, setTotalEcoPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [currentReward, setCurrentReward] = useState<EcoPointsReward | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuiz = quizzes[currentIndex];
  const isLastQuestion = currentIndex === quizzes.length - 1;
  const allQuestionsAnswered = Object.keys(answers).length === quizzes.length;

  // Calculate eco points for correct answer
  const calculateEcoPoints = useCallback((isCorrect: boolean, streak: number) => {
    if (!isCorrect) return { points: 0, message: "Better luck next time!", streak: 0 };
    
    const basePoints = 10;
    const streakMultiplier = Math.min(streak, 5); // Max 5x multiplier
    const totalPoints = basePoints * (1 + streakMultiplier * 0.5);
    
    const messages = [
      "Great job, eco-warrior! 🌱",
      "You're saving the planet! 🌍",
      "Eco knowledge activated! ⚡",
      "Sustainability superstar! ⭐",
      "Green genius mode! 💚",
    ];
    
    return {
      points: Math.round(totalPoints),
      message: messages[Math.floor(Math.random() * messages.length)],
      streak: streak
    };
  }, []);

  // Handle answer selection
  const handleAnswerSelect = useCallback((option: string) => {
    if (answeredQuestions.has(currentQuiz.id)) return;
    
    const newAnswers = { ...answers, [currentQuiz.id]: option };
    setAnswers(newAnswers);
    setAnsweredQuestions(prev => new Set([...prev, currentQuiz.id]));
    
    // Simulate correct answer check (in real app, this would come from API)
    const isCorrect = Math.random() > 0.3; // 70% chance of correct for demo
    
    if (isCorrect) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      const reward = calculateEcoPoints(true, newStreak);
      setCurrentReward(reward);
      setTotalEcoPoints(prev => prev + reward.points);
      setShowReward(true);
    } else {
      setCurrentStreak(0);
      const reward = calculateEcoPoints(false, 0);
      setCurrentReward(reward);
      setShowReward(true);
    }
  }, [answers, currentQuiz?.id, answeredQuestions, currentStreak, calculateEcoPoints]);

  const handleNext = useCallback(() => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, quizzes.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleSubmitQuiz = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const result = await submitQuiz(answers);
      
      // Show final score popup
      setCurrentReward({
        points: totalEcoPoints,
        message: `Quiz Complete! Total Score: ${result.score || 0}`,
        streak: currentStreak
      });
      setShowReward(true);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, submitQuiz, totalEcoPoints, currentStreak]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showReward) return; // Don't handle keys during reward popup
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (answers[currentQuiz?.id]) {
            handleNext();
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          e.preventDefault();
          const optionIndex = parseInt(e.key) - 1;
          if (currentQuiz?.options[optionIndex] && !answeredQuestions.has(currentQuiz.id)) {
            handleAnswerSelect(currentQuiz.options[optionIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showReward, handlePrevious, handleNext, answers, currentQuiz, answeredQuestions, handleAnswerSelect]);

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
          <p className="text-green-400 text-lg font-mono">{t("loading_quizzes")}</p>
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
          <h3 className="text-2xl font-bold text-red-400 font-mono">SYSTEM ERROR</h3>
          <p className="text-red-300">{error}</p>
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
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      
      <Navbar />
      
      <div className="relative max-w-4xl mx-auto p-6 pt-20">
        
        {/* Header with eco points */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text mb-4 font-mono">
            ECO QUIZ
          </h1>
          <div className="flex items-center justify-center space-x-6">
            <div className="bg-green-500/20 border-2 border-green-400 rounded-xl px-4 py-2">
              <div className="text-green-400 font-mono text-xs">TOTAL ECO POINTS</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">{totalEcoPoints}</div>
            </div>
            {currentStreak > 0 && (
              <div className="bg-orange-500/20 border-2 border-orange-400 rounded-xl px-4 py-2">
                <div className="text-orange-400 font-mono text-xs">STREAK</div>
                <div className="text-2xl font-bold text-orange-300 font-mono">🔥 {currentStreak}</div>
              </div>
            )}
          </div>
        </div>

        {quizzes.length > 0 && currentQuiz ? (
          <>
            <RetroProgressBar 
              current={currentIndex} 
              total={quizzes.length} 
              streak={currentStreak}
            />
            
            <RetroQuizCard
              quiz={currentQuiz}
              selected={answers[currentQuiz.id]}
              onSelect={handleAnswerSelect}
              isAnswered={answeredQuestions.has(currentQuiz.id)}
            />

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8">
              <RetroButton
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                variant="secondary"
              >
                ← PREVIOUS
              </RetroButton>

              <div className="text-center">
                <div className="text-green-400 font-mono text-sm">
                  Use 1-4 keys or ← → arrows
                </div>
              </div>

              {!isLastQuestion ? (
                <RetroButton
                  onClick={handleNext}
                  disabled={!answers[currentQuiz.id]}
                  variant="primary"
                >
                  NEXT →
                </RetroButton>
              ) : (
                <RetroButton
                  onClick={handleSubmitQuiz}
                  disabled={!allQuestionsAnswered || isSubmitting}
                  variant="success"
                  className={isSubmitting ? 'animate-pulse' : ''}
                >
                  {isSubmitting ? 'SUBMITTING...' : 'SUBMIT QUIZ'}
                </RetroButton>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-green-400 text-xl font-mono mt-12">
            {t("loading_quizzes")}
          </div>
        )}
      </div>

      {/* Eco Points Reward Popup */}
      <EcoPointsPopup
        reward={currentReward}
        isVisible={showReward}
        onClose={() => setShowReward(false)}
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