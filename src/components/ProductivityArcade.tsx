/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Flame, Sparkles, Zap, Timer, Play, Pause, RotateCcw, 
  Dices, HelpCircle, Gift, Compass, ChevronRight, Award, 
  Sprout, Sword, Skull, Plus, CheckCircle, Volume2, VolumeX, RefreshCw,
  BookOpen, ChevronLeft, Layers, Heart, Brain
} from 'lucide-react';
import { QuizQuestion, generateDailyChallenge } from '../data/quizBank';

// Web Audio sound synthesizer for retro game effects
class GameSound {
  private static muted: boolean = false;

  public static toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  public static isMuted() {
    return this.muted;
  }

  private static getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      return AudioCtx ? new AudioCtx() : null;
    } catch (e) {
      console.warn('AudioContext not supported or blocked in this context:', e);
      return null;
    }
  }

  public static playClick() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  public static playSuccess() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.05, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playTone(523.25, 0, 0.1); // C5
    playTone(659.25, 0.1, 0.1); // E5
    playTone(783.99, 0.2, 0.1); // G5
    playTone(1046.50, 0.3, 0.25); // C6
  }

  public static playHit() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  public static playFanfare() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.06, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playTone(587.33, 0, 0.15); // D5
    playTone(587.33, 0.15, 0.15); // D5
    playTone(587.33, 0.3, 0.15); // D5
    playTone(783.99, 0.45, 0.4); // G5
  }

  public static playCardFlip() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }
}

// Level name helper matching Level to titles
const getTitleForLevel = (lvl: number): string => {
  if (lvl === 1) return 'Beginner';
  if (lvl === 2) return 'Strategist';
  if (lvl === 3) return 'Engineer';
  if (lvl === 4) return 'Architect';
  return 'Mastermind';
};

export const ProductivityArcade: React.FC = () => {
  const { 
    userXP, level, streak, badges, setBadges, addXP, incrementStat, showToast, 
    tasks, habits, updateTaskStatus, completeHabit, statistics 
  } = useApp();

  const [activeGame, setActiveGame] = useState<'pomodoro' | 'habit' | 'learning' | 'crusher'>('pomodoro');
  const [soundMuted, setSoundMuted] = useState(false);

  // Confetti local state
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; color: string; size: number; delay: number }>>([]);

  const triggerConfetti = () => {
    GameSound.playFanfare();
    const colors = ['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#10b981', '#eab308'];
    const newConfetti = Array.from({ length: 60 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100, // percentage width
      y: Math.random() * 40 - 20, // start above the viewport
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 6,
      delay: Math.random() * 1.5
    }));
    setConfetti(newConfetti);
    setTimeout(() => {
      setConfetti([]);
    }, 4500);
  };

  const toggleMute = () => {
    const isMutedNow = GameSound.toggleMute();
    setSoundMuted(isMutedNow);
    showToast(isMutedNow ? 'Sound effects muted' : 'Sound effects unmuted', 'success');
  };

  // --------------------------------------------------------
  // GAME 1: POMODORO CHAMPION
  // --------------------------------------------------------
  const [pomoTime, setPomoTime] = useState(1500); // 25 mins in seconds
  const [pomoActive, setPomoActive] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false); // Default to false in production
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (pomoActive && pomoTime > 0) {
      timerRef.current = setInterval(() => {
        setPomoTime(prev => {
          if (prev <= 1) {
            setPomoActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            // Completed!
            addXP(25, 'Finished Pomodoro Focus Session');
            incrementStat('hoursFocused', 0.5);
            triggerConfetti();
            showToast('🏆 Focus cycle completed! +25 XP', 'success');
            return isDemoMode ? 10 : 1500;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pomoActive, pomoTime, isDemoMode]);

  const togglePomo = () => {
    GameSound.playClick();
    setPomoActive(!pomoActive);
  };

  const resetPomo = () => {
    GameSound.playClick();
    setPomoActive(false);
    setPomoTime(isDemoMode ? 10 : 1500);
  };

  const switchMode = (demo: boolean) => {
    GameSound.playClick();
    setPomoActive(false);
    setIsDemoMode(demo);
    setPomoTime(demo ? 10 : 1500);
  };

  const formatPomoTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --------------------------------------------------------
  // GAME 2: HABIT HERO
  // --------------------------------------------------------
  const [habitCombos, setHabitCombos] = useState<Record<string, number>>({});

  const triggerHabitSlay = (habitId: string, title: string) => {
    GameSound.playSuccess();
    
    // Add XP
    addXP(10, `Slayed Habit Combo: ${title}`);
    completeHabit(habitId);

    // Increment local combo meter
    setHabitCombos(prev => ({
      ...prev,
      [habitId]: (prev[habitId] || 0) + 1
    }));

    showToast(`🔥 Combo Extended! +10 XP earned!`, 'success');
  };

  // --------------------------------------------------------
  // GAME 3: LEARNING EXPLORER - DAILY QUIZ ROTATION SYSTEM
  // --------------------------------------------------------
  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getYesterdayDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateString(d);
  };

  const [dailyQuestions, setDailyQuestions] = useState<QuizQuestion[]>([]);
  const [quizStreak, setQuizStreak] = useState<number>(() => {
    return Number(localStorage.getItem('lifepilot_quizStreak') || '0');
  });
  const [quizScore, setQuizScore] = useState<number | null>(() => {
    const savedScore = localStorage.getItem('lifepilot_quizScore');
    return savedScore !== null ? Number(savedScore) : null;
  });
  const [quizCompletedToday, setQuizCompletedToday] = useState<boolean>(() => {
    const lastCompletedDate = localStorage.getItem('lifepilot_quizCompletedDate');
    return lastCompletedDate === getLocalDateString();
  });
  const [quizActive, setQuizActive] = useState(false);
  const [isTomorrowPreview, setIsTomorrowPreview] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);
  
  // Real-time local countdown clock until midnight
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next midnight
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize daily quiz pack
  useEffect(() => {
    const todayStr = getLocalDateString();
    const lastQuizDate = localStorage.getItem('lifepilot_lastQuizDate');
    let questions: QuizQuestion[] = [];

    if (lastQuizDate === todayStr) {
      const savedQuiz = localStorage.getItem('lifepilot_dailyQuiz');
      if (savedQuiz) {
        try {
          questions = JSON.parse(savedQuiz);
        } catch (e) {
          questions = generateDailyChallenge(todayStr);
        }
      } else {
        questions = generateDailyChallenge(todayStr);
      }
    } else {
      // New day! Generate brand new daily quiz pack
      questions = generateDailyChallenge(todayStr);
      localStorage.setItem('lifepilot_dailyQuiz', JSON.stringify(questions));
      localStorage.setItem('lifepilot_lastQuizDate', todayStr);
      
      // Reset daily session score
      localStorage.removeItem('lifepilot_quizScore');
      setQuizScore(null);
      setQuizCompletedToday(false);

      // Check streak breakage
      const lastCompletedDate = localStorage.getItem('lifepilot_quizCompletedDate');
      const yesterdayStr = getYesterdayDateString();
      if (lastCompletedDate && lastCompletedDate !== todayStr && lastCompletedDate !== yesterdayStr) {
        localStorage.setItem('lifepilot_quizStreak', '0');
        setQuizStreak(0);
      }
    }

    setDailyQuestions(questions);
  }, []);

  const handleOptionSelect = (idx: number) => {
    if (quizSubmitted) return;
    GameSound.playCardFlip();
    setSelectedOption(idx);
  };

  const handleQuizSubmit = () => {
    if (selectedOption === null || quizSubmitted || dailyQuestions.length === 0) return;
    const currentQuestion = dailyQuestions[currentQuizIndex];
    const correct = selectedOption === currentQuestion.answer;
    
    setQuizCorrect(correct);
    setQuizSubmitted(true);
    
    // Save this answer locally in progress
    setQuizAnswers(prev => ({
      ...prev,
      [currentQuizIndex]: selectedOption
    }));

    if (correct) {
      GameSound.playSuccess();
      if (!isTomorrowPreview) {
        addXP(currentQuestion.reward, `Correct Quiz Answer: ${currentQuestion.name}`);
        incrementStat('lessonsWatched', 1);
        showToast(`✨ Quiz Correct! +15 XP rewarded!`, 'success');
      } else {
        showToast(`✨ Quiz Correct! (Tomorrow's Preview Mode - No XP earned)`, 'success');
      }
    } else {
      GameSound.playHit();
      showToast(`❌ Try studying the guide before proceeding.`, 'success');
    }
  };

  const handleNextQuiz = () => {
    GameSound.playClick();
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizCorrect(false);

    if (currentQuizIndex < dailyQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Finished all questions!
      const correctAnswersCount = dailyQuestions.reduce((acc, q, idx) => {
        const selected = quizAnswers[idx];
        return selected === q.answer ? acc + 1 : acc;
      }, 0);

      if (isTomorrowPreview) {
        // Preview mode finish
        showToast('🎉 Practice session completed! Great job training your brain.', 'success');
        setQuizActive(false);
        setIsTomorrowPreview(false);
        setCurrentQuizIndex(0);
        setQuizAnswers({});
        // Reload today's quiz
        const todayStr = getLocalDateString();
        const savedQuiz = localStorage.getItem('lifepilot_dailyQuiz');
        if (savedQuiz) {
          try {
            setDailyQuestions(JSON.parse(savedQuiz));
          } catch (e) {
            setDailyQuestions(generateDailyChallenge(todayStr));
          }
        } else {
          setDailyQuestions(generateDailyChallenge(todayStr));
        }
      } else {
        // Actual challenge finish
        const todayStr = getLocalDateString();
        localStorage.setItem('lifepilot_quizCompletedDate', todayStr);
        localStorage.setItem('lifepilot_quizScore', String(correctAnswersCount));
        setQuizScore(correctAnswersCount);
        setQuizCompletedToday(true);
        setQuizActive(false);
        triggerConfetti();

        // Award streak and bonus rewards
        let newStreak = quizStreak;
        const lastCompletedDate = localStorage.getItem('lifepilot_quizCompletedDate');
        const yesterdayStr = getYesterdayDateString();

        if (quizStreak === 0) {
          newStreak = 1;
        } else if (lastCompletedDate === yesterdayStr) {
          newStreak += 1;
        } else if (lastCompletedDate !== todayStr) {
          newStreak = 1;
        }
        
        localStorage.setItem('lifepilot_quizStreak', String(newStreak));
        setQuizStreak(newStreak);

        // First quiz completed today: +50 XP
        addXP(50, "First Daily Learning Challenge Completed Today");
        showToast("🔥 Daily Challenge complete! +50 Bonus XP awarded!", "success");

        // Perfect score: +100 XP
        if (correctAnswersCount === dailyQuestions.length) {
          addXP(100, "Perfect Score on Daily Learning Challenge");
          showToast("🌟 Perfect Score! +100 Bonus XP awarded!", "success");
        }

        // 7-day streak Achievement unlocked: Quiz Explorer
        if (newStreak >= 7 && !badges.includes('Quiz Explorer')) {
          setBadges(prev => {
            const nextBadges = [...prev, 'Quiz Explorer'];
            localStorage.setItem('badges', JSON.stringify(nextBadges));
            return nextBadges;
          });
          addXP(150, "Achievement Unlocked: Quiz Explorer (7-Day Streak)");
          showToast("🏆 Achievement Unlocked: Quiz Explorer! +150 XP rewarded!", "success");
        }
      }
    }
  };

  const handleStartDailyQuiz = () => {
    GameSound.playClick();
    setIsTomorrowPreview(false);
    setCurrentQuizIndex(0);
    setQuizAnswers({});
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizCorrect(false);
    setQuizActive(true);
  };

  const handleShuffleTomorrowPreview = () => {
    GameSound.playClick();
    // Use tomorrow's date to generate the challenge
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrow);
    const previewQuiz = generateDailyChallenge(tomorrowStr);
    
    setDailyQuestions(previewQuiz);
    setIsTomorrowPreview(true);
    setCurrentQuizIndex(0);
    setQuizAnswers({});
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizCorrect(false);
    setQuizActive(true);
    showToast("🔮 Tomorrow's Preview Mode started! Answers will not award XP.", 'success');
  };

  // --------------------------------------------------------
  // GAME 4: TASK CRUSHER
  // --------------------------------------------------------
  const [slashedTaskId, setSlashedTaskId] = useState<string | null>(null);

  const handleCrushTask = (taskId: string, title: string) => {
    GameSound.playHit();
    setSlashedTaskId(taskId);
    
    setTimeout(() => {
      GameSound.playSuccess();
      addXP(20, `Crushed Task: ${title}`);
      updateTaskStatus(taskId, 'Done');
      setSlashedTaskId(null);
      showToast(`⚔️ Task crushed! +20 XP awarded!`, 'success');
    }, 450);
  };

  return (
    <div className="space-y-6 relative min-h-[80vh] p-4">
      {/* Dynamic Confetti Overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        {confetti.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 1, x: `${c.x}%`, y: `${c.y}vh`, rotate: 0 }}
            animate={{ 
              y: '100vh', 
              rotate: 360,
              opacity: [1, 1, 0] 
            }}
            transition={{ 
              duration: 3.0, 
              delay: c.delay,
              ease: "linear"
            }}
            className="absolute rounded-md"
            style={{
              backgroundColor: c.color,
              width: c.size,
              height: c.size,
            }}
          />
        ))}
      </div>

      {/* HEADER HERO BANNER */}
      <div className="bg-slate-950/80 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-indigo-500/20">
            🎮
          </div>
          <div>
            <h2 className="font-display font-black text-2xl text-white flex items-center space-x-2">
              <span>Productivity Arena</span>
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase px-2.5 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full animate-pulse">Arcade Active</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed max-w-xl">
              Immersive, micro-gamified engines built to train deep focus, cement daily habits, and turn checklists into visual conquest.
            </p>
          </div>
        </div>

        {/* Global XP Progression Status */}
        <div className="flex items-center gap-6 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
          <div className="flex-1 md:w-56 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <span>Level {level}</span>
                <span className="text-indigo-300">({getTitleForLevel(level)})</span>
              </span>
              <span className="font-mono text-white">{userXP} XP</span>
            </div>
            
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500" 
                style={{ 
                  width: `${Math.min(100, (level === 5 ? 100 : ((userXP - (level === 1 ? 0 : level === 2 ? 100 : level === 3 ? 250 : level === 4 ? 500 : 1000)) / (level === 1 ? 100 : level === 2 ? 150 : level === 3 ? 250 : level === 4 ? 500 : 1000)) * 100))}%` 
                }}
              />
            </div>
          </div>

          <button 
            onClick={toggleMute}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
            title={soundMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* GAME SELECTOR CONTAINER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'pomodoro', name: 'Pomodoro Champion', icon: Timer, color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5', desc: 'Focus Bursts' },
          { id: 'habit', name: 'Habit Hero', icon: Flame, color: 'border-amber-500/30 text-amber-400 bg-amber-500/5', desc: 'Combo Streaks' },
          { id: 'learning', name: 'Learning Explorer', icon: BookOpen, color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5', desc: 'Topic Quizzes' },
          { id: 'crusher', name: 'Task Crusher', icon: Sword, color: 'border-pink-500/30 text-pink-400 bg-pink-500/5', desc: 'Slicing Action' }
        ].map((game) => {
          const GameIcon = game.icon;
          const isSelected = activeGame === game.id;
          return (
            <button
              key={game.id}
              onClick={() => {
                GameSound.playClick();
                setActiveGame(game.id as any);
              }}
              className={`p-4 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden ${
                isSelected 
                  ? 'bg-slate-950/80 border-indigo-500/60 shadow-xl' 
                  : 'bg-slate-950/30 border-white/5 hover:bg-slate-900/40'
              }`}
            >
              {isSelected && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-pink-500" />}
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl border ${game.color}`}>
                  <GameIcon size={20} className={isSelected ? 'animate-bounce' : ''} />
                </div>
                <ChevronRight size={16} className={`text-slate-600 transition-transform ${isSelected ? 'translate-x-1 text-indigo-400' : ''}`} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{game.name}</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">{game.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE GAME CANVAS */}
      <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-6 md:p-8 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeGame === 'pomodoro' && (
            <motion.div
              key="pomo"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full"
            >
              {/* Left Side: interactive circular dial */}
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative w-64 h-64 flex items-center justify-center bg-slate-900 rounded-full border border-white/10 shadow-2xl">
                  {/* Outer glowing ticking progress ring */}
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="110"
                      stroke="rgba(255,255,255,0.02)"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="128"
                      cy="128"
                      r="110"
                      stroke="#6366f1"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 110}
                      animate={{ 
                        strokeDashoffset: (2 * Math.PI * 110) * (1 - pomoTime / (isDemoMode ? 10 : 1500)) 
                      }}
                      transition={{ ease: "linear", duration: 1 }}
                    />
                  </svg>

                  {/* Dynamic Time Counter */}
                  <div className="text-center space-y-1 z-10">
                    <span className="text-4xl font-black font-mono tracking-tight text-white block">
                      {formatPomoTime(pomoTime)}
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block">
                      {pomoActive ? 'Focus Block Ticking' : 'Focus Paused'}
                    </span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={togglePomo}
                    className={`px-6 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg ${
                      pomoActive 
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/10' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10'
                    }`}
                  >
                    {pomoActive ? <Pause size={14} /> : <Play size={14} />}
                    <span>{pomoActive ? 'Pause' : 'Start Focus'}</span>
                  </button>

                  <button 
                    onClick={resetPomo}
                    className="p-2.5 rounded-2xl bg-slate-900 border border-white/10 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              {/* Right Side: details and presentation presets */}
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">Mini Game 1</span>
                  <h3 className="text-2xl font-black text-white mt-1">Pomodoro Champion</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mt-2">
                    Start focus loops to train your cognitive flow states. Complete focus blocks to level up your mental agility score!
                  </p>
                </div>

                <div className="text-xs text-indigo-300 flex items-center space-x-1">
                  <span>💎 Rewards:</span>
                  <span className="font-mono font-bold">+25 XP Focus Session</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeGame === 'habit' && (
            <motion.div
              key="habit"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full"
            >
              {/* Left Side: habits combo selection */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">Active Habits</span>
                <h3 className="text-xl font-bold text-white">Combo Multiplier Streaks</h3>
                
                <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-2 pt-2">
                  {habits.length === 0 ? (
                    <div className="text-xs text-slate-500 italic p-4 text-center border border-white/5 rounded-2xl bg-slate-900/30">
                      No habits loaded. Please add some habits in Growth Hub or Planner first.
                    </div>
                  ) : (
                    habits.map((h) => {
                      const currentCombo = habitCombos[h.id] || 0;
                      return (
                        <div key={h.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-white/5 text-xs">
                          <div>
                            <p className="font-bold text-white">{h.title}</p>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">
                              Streak: {h.streak} days
                            </span>
                          </div>

                          <div className="flex items-center space-x-3">
                            {currentCombo > 0 && (
                              <span className="text-xs px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full font-mono font-bold animate-bounce">
                                COMBO x{currentCombo}
                              </span>
                            )}
                            <button
                              onClick={() => triggerHabitSlay(h.id, h.title)}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl cursor-pointer shadow-md text-[11px]"
                            >
                              Slay Habit!
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Side: rules and details */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">Mini Game 2</span>
                  <h3 className="text-2xl font-black text-white mt-1">Habit Hero</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mt-2">
                    Completing your habits triggers streak multiplier multipliers. Build habit combos to extend your continuous streak and lock-in bonus consistency points!
                  </p>
                </div>

                <div className="p-4 bg-amber-500/5 rounded-3xl border border-amber-500/10 text-xs text-amber-300/90 leading-relaxed">
                  💡 **Streak Multiplier Rule:** Completing a habit increases your combo level, increasing the speed of future experience point generation. Maintaining streaks prevents decay!
                </div>

                <div className="text-xs text-amber-400 flex items-center space-x-1">
                  <span>💎 Rewards:</span>
                  <span className="font-mono font-bold">+10 XP per Habit Slayed</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeGame === 'learning' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full"
            >
              {/* Header Container */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 mb-6 space-y-3 md:space-y-0">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center space-x-2">
                    <span className="text-emerald-400">Today's Learning Challenge</span>
                    {isTomorrowPreview && (
                      <span className="text-[9px] uppercase tracking-wider font-mono font-black bg-purple-500/10 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded-full animate-pulse">
                        Preview Mode
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
                    <Brain size={14} className="text-emerald-400" />
                    <span>Daily Brain XP • Refreshes every 24 hours</span>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Next reset in</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">{timeLeft}</span>
                </div>
              </div>

              {/* Main Canvas content switcher */}
              {!quizActive ? (
                /* SCREEN 1: STATS OR START STATE */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full">
                  {/* Left Side: Empty State or Score Summary Card */}
                  <div className="p-6 bg-slate-900/60 rounded-3xl border border-white/5 flex flex-col items-center text-center space-y-4">
                    {quizCompletedToday ? (
                      <>
                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
                          <CheckCircle size={32} className="animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">Daily Challenge Completed!</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            You've trained your brain for today. Great job keeping your mind sharp!
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full pt-2">
                          <div className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl">
                            <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Today's Score</span>
                            <span className="text-lg font-black font-mono text-emerald-400">{quizScore !== null ? quizScore : 0} / {dailyQuestions.length}</span>
                          </div>
                          <div className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl">
                            <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Current Streak</span>
                            <span className="text-lg font-black font-mono text-amber-400 flex items-center justify-center space-x-1">
                              <span>🔥</span>
                              <span>{quizStreak} {quizStreak === 1 ? 'Day' : 'Days'}</span>
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3.5 bg-slate-950/40 border border-white/5 text-slate-400 rounded-2xl">
                          <Brain size={32} />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">No quiz attempted today.</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Ready to train your brain? Boost your software expertise, maintain your streak, and earn dynamic bonus XP.
                          </p>
                        </div>
                        <div className="w-full pt-2">
                          <button
                            onClick={handleStartDailyQuiz}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/10 cursor-pointer"
                          >
                            Start Daily Challenge
                          </button>
                        </div>
                      </>
                    )}

                    {/* Preview Button (always accessible) */}
                    <div className="w-full pt-1">
                      <button
                        onClick={handleShuffleTomorrowPreview}
                        className="w-full py-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Shuffle Tomorrow's Preview
                      </button>
                    </div>
                  </div>

                  {/* Right Side: details and presentation presets */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">Mini Game 3</span>
                      <h3 className="text-2xl font-black text-white">Learning Explorer</h3>
                      <p className="text-sm text-slate-300 leading-relaxed mt-2">
                        Practice on dynamic curated engineering categories updated every 24 hours. Keep your streak active to unlock rare accolades!
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 text-xs text-slate-300/90 leading-relaxed space-y-2">
                      <p className="font-bold text-emerald-400">🎁 Learning Explorer Bonuses:</p>
                      <ul className="space-y-1.5 pl-1.5 list-disc list-inside">
                        <li>Correct answers: <span className="font-mono font-bold text-emerald-400">+15 XP</span></li>
                        <li>Daily challenge completed: <span className="font-mono font-bold text-emerald-400">+50 XP</span></li>
                        <li>Perfect score: <span className="font-mono font-bold text-emerald-400">+100 XP</span></li>
                        <li>7-Day Streak Award: <span className="font-mono font-bold text-amber-400">🏆 Quiz Explorer Achievement</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                /* SCREEN 2: ACTIVE QUIZ PANEL */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start w-full">
                  {/* Left Side: Topic multiple choice question */}
                  <div className="space-y-4 p-5 bg-slate-900/60 rounded-3xl border border-white/5">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-xs font-mono text-emerald-400 tracking-wider font-bold uppercase">
                        DOMAIN: {dailyQuestions[currentQuizIndex]?.category || 'Curriculum'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Question {currentQuizIndex + 1} / {dailyQuestions.length}
                      </span>
                    </div>

                    {isTomorrowPreview && (
                      <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[11px] text-purple-300 font-medium text-center">
                        🔮 Practice Preview Mode — No real XP or score will be recorded.
                      </div>
                    )}

                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-slate-400 tracking-wider font-semibold uppercase bg-slate-950/40 border border-white/5 px-2.5 py-1 rounded-md inline-block">
                        {dailyQuestions[currentQuizIndex]?.name}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-relaxed">
                        {dailyQuestions[currentQuizIndex]?.question}
                      </h4>

                      <div className="space-y-2 pt-1">
                        {dailyQuestions[currentQuizIndex]?.options.map((opt, oidx) => {
                          const isSelected = selectedOption === oidx;
                          const isCorrectAnswer = oidx === dailyQuestions[currentQuizIndex].answer;
                          
                          let cardStyle = 'border-white/5 bg-slate-950/40 text-slate-300 hover:bg-slate-900/40';
                          if (isSelected) cardStyle = 'border-emerald-500/60 bg-emerald-500/5 text-emerald-300';
                          if (quizSubmitted) {
                            if (isCorrectAnswer) cardStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
                            else if (isSelected) cardStyle = 'border-rose-500 bg-rose-500/10 text-rose-300';
                          }

                          return (
                            <button
                              key={oidx}
                              onClick={() => handleOptionSelect(oidx)}
                              disabled={quizSubmitted}
                              className={`w-full p-3 rounded-2xl border text-left text-xs transition-all flex justify-between items-center ${cardStyle} ${!quizSubmitted ? 'cursor-pointer hover:border-slate-700' : 'cursor-default'}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrectAnswer && (
                                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Correct</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit & Next buttons */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => {
                          GameSound.playClick();
                          setQuizActive(false);
                          setIsTomorrowPreview(false);
                        }}
                        className="px-3.5 py-1.5 bg-slate-950 border border-white/5 text-slate-400 hover:text-white rounded-xl text-[11px] font-semibold cursor-pointer transition-colors"
                      >
                        Quit Session
                      </button>

                      {quizSubmitted ? (
                        <button
                          onClick={handleNextQuiz}
                          className="px-4 py-2 bg-emerald-600 border border-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-700 transition-colors"
                        >
                          {currentQuizIndex === dailyQuestions.length - 1 ? 'Finish Challenge' : 'Next Question'}
                        </button>
                      ) : (
                        <button
                          onClick={handleQuizSubmit}
                          disabled={selectedOption === null}
                          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                            selectedOption !== null 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                              : 'bg-slate-900 border border-white/5 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Submit Answer
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Side: rules and details */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">Lesson Guide</span>
                      <h3 className="text-2xl font-black text-white mt-1">Concept Mastery</h3>
                      <p className="text-sm text-slate-300 leading-relaxed mt-2">
                        Examine the core components of the question. Upon submitting, read the dedicated micro-lesson guide to cement your knowledge!
                      </p>
                    </div>

                    {quizSubmitted && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 text-xs text-slate-300 leading-relaxed"
                      >
                        <span className="font-bold text-emerald-400 block mb-1">💡 Study Lesson:</span>
                        {dailyQuestions[currentQuizIndex]?.lesson}
                      </motion.div>
                    )}

                    <div className="text-xs text-emerald-400 flex items-center space-x-1">
                      <span>💎 Rewards:</span>
                      <span className="font-mono font-bold">
                        {isTomorrowPreview ? 'No XP Awarded (Practice Mode)' : '+15 XP per Correct Lesson Quiz'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeGame === 'crusher' && (
            <motion.div
              key="crush"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full"
            >
              {/* Left Side: active tasks list crusher */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-pink-400">Roadmap Tasks</span>
                <h3 className="text-xl font-bold text-white">Slash & Crush Tasks</h3>
                
                <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-2 pt-2">
                  {tasks.filter(t => t.status !== 'Done').length === 0 ? (
                    <div className="text-xs text-slate-500 italic p-4 text-center border border-white/5 rounded-2xl bg-slate-900/30">
                      No active tasks remaining to crush! Excellent job! Add some more roadmap tasks in Growth Hub.
                    </div>
                  ) : (
                    tasks.filter(t => t.status !== 'Done').map((t) => {
                      const isSlashed = slashedTaskId === t.id;
                      return (
                        <div key={t.id} className="relative overflow-hidden p-3 rounded-2xl bg-slate-900/50 border border-white/5 text-xs flex items-center justify-between">
                          {/* Slashing Animation Overlay */}
                          <AnimatePresence>
                            {isSlashed && (
                              <motion.div 
                                initial={{ x: '-100%', skewX: -45, opacity: 1 }}
                                animate={{ x: '100%', opacity: [1, 1, 0] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.35, ease: "easeInOut" }}
                                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-pink-500 via-white to-indigo-500 z-20 pointer-events-none"
                              />
                            )}
                          </AnimatePresence>

                          <div className={isSlashed ? 'line-through opacity-50 transition-all duration-300' : ''}>
                            <p className="font-bold text-white">{t.title}</p>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">
                              Priority: {t.priority}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCrushTask(t.id, t.title)}
                            disabled={slashedTaskId !== null}
                            className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-md text-[11px] flex items-center space-x-1"
                          >
                            <Sword size={12} />
                            <span>Crush!</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Side: rules and details */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-pink-400">Mini Game 4</span>
                  <h3 className="text-2xl font-black text-white mt-1">Task Crusher</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mt-2">
                    Action-packed task manager where checklists meet tactile slashing! Complete a task to experience retro combat sword swings, satisfying visual slashes, and experience growth multipliers.
                  </p>
                </div>

                <div className="p-4 bg-pink-500/5 rounded-3xl border border-pink-500/10 text-xs text-pink-300/90 leading-relaxed">
                  🛡️ **Tactile Conquest:** Each task crushed adds to your combat record. Crushing 100 total tasks unlocks the legendary **Productivity Beast** badge!
                </div>

                <div className="text-xs text-pink-400 flex items-center space-x-1">
                  <span>💎 Rewards:</span>
                  <span className="font-mono font-bold">+20 XP per Task Slashed</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
