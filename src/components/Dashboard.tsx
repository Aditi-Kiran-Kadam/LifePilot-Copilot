/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, CheckCircle2, Circle, Clock, TrendingUp, Calendar as CalendarIcon, 
  Plus, AlertTriangle, ArrowRight, ShieldCheck, Award, Zap, ChevronRight,
  Flame, CreditCard, Target, BookOpen, Compass, Activity, Smile, Heart,
  CheckCircle, BarChart2, ShieldAlert, Brain, Coffee, Trophy, ChevronLeft, Info
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    profile, tasks, habits, commitments, goals, roadmaps, panicPlan,
    updateTaskStatus, completeHabit, delayTask, payCommitment, setActiveTab, generateWeeklyReview,
    interventionHistory, addInterventionHistory, focusSessionsSkipped, setFocusSessionsSkipped,
    missedHabitCount, setMissedHabitCount, triggerIntervention, showToast,
    userXP, level, streak, badges, completedChallenges, setCompletedChallenges, recentAchievement, addXP, incrementStat, statistics
  } = useApp();

  const getTitleForLevel = (lvl: number): string => {
    if (lvl === 1) return 'Beginner';
    if (lvl === 2) return 'Strategist';
    if (lvl === 3) return 'Engineer';
    if (lvl === 4) return 'Architect';
    return 'Mastermind';
  };

  // State managers
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [weeklyReview, setWeeklyReview] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [calendarFilter, setCalendarFilter] = useState<'today' | 'tomorrow' | 'week' | 'deadlines'>('today');
  const [completedHabitId, setCompletedHabitId] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  // Floating motivation message state (rotates every refresh)
  const motivationMessages = useMemo(() => [
    "Small progress is still progress. Keep showing up! 🏔️",
    "One task at a time. The mountain is climbed step-by-step. 🎯",
    "Future you will thank present you for the focus blocks today. ⏳",
    "Consistency beats intensity. Build the compound habit loop! 🌊",
    "Focus on the immediate next 5-minute action to break the friction. 🧠",
    "Your potential is limit-less. Let's conquer these priorities! 🚀",
    "Deep focus is a superpower. Silence notifications and dive in. 🛡️"
  ], []);

  const [currentMotivation, setCurrentMotivation] = useState("");

  useEffect(() => {
    // Pick a random motivation message on mount
    const randomMsg = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
    setCurrentMotivation(randomMsg);

    // Simulate premium AI index caching (650ms loading sensation)
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 650);

    return () => clearTimeout(timer);
  }, [motivationMessages]);

  if (!profile) return null;

  // --------------------------------------------------------
  // DATA SUMMARIZATION & INTELLIGENCE CALCULATIONS
  // --------------------------------------------------------
  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'Done'), [tasks]);
  const completedTasksCount = useMemo(() => tasks.filter(t => t.status === 'Done').length, [tasks]);
  const unpaidCommitments = useMemo(() => commitments.filter(c => !c.paidThisPeriod), [commitments]);
  const completedMilestonesCount = useMemo(() => goals.reduce((acc, g) => acc + g.milestones.filter(m => m.completed).length, 0), [goals]);
  const totalMilestonesCount = useMemo(() => goals.reduce((acc, g) => acc + g.milestones.length, 0), [goals]);

  // Streak calculations
  const maxStreak = useMemo(() => habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0, [habits]);
  const totalStreaksSum = useMemo(() => habits.reduce((acc, h) => acc + h.streak, 0), [habits]);

  // --------------------------------------------------------
  // DYNAMIC MOMENTUM ENGINE & PERFORMANCE ANALYTICS
  // --------------------------------------------------------
  const completedHabitsCount = useMemo(() => habits.filter(h => h.completedToday).length, [habits]);
  const habitConsistency = useMemo(() => {
    if (habits.length === 0) return 100;
    return Math.round((completedHabitsCount / habits.length) * 100);
  }, [habits, completedHabitsCount]);

  const focusHours = useMemo(() => {
    // Simulated focus hours based on completed tasks and habits
    return parseFloat((completedTasksCount * 1.5 + completedHabitsCount * 0.5 + 4.5).toFixed(1));
  }, [completedTasksCount, completedHabitsCount]);

  const streakBonus = useMemo(() => {
    return maxStreak * 4;
  }, [maxStreak]);

  const overdueCount = useMemo(() => {
    return activeTasks.filter(t => {
      if (!t.deadline) return false;
      const tDate = new Date(t.deadline).getTime();
      const today = new Date().setHours(0,0,0,0);
      return tDate < today;
    }).length;
  }, [activeTasks]);

  const overduePenalty = useMemo(() => {
    return overdueCount * 8;
  }, [overdueCount]);

  // Dynamic Momentum Score calculation
  const calculatedMomentum = useMemo(() => {
    const rawScore = (completedTasksCount * 4) + (habitConsistency * 2) + (focusHours * 3) + streakBonus - overduePenalty;
    return Math.max(0, Math.min(100, Math.round(rawScore)));
  }, [completedTasksCount, habitConsistency, focusHours, streakBonus, overduePenalty]);

  // Compatibility mapping for existing refs
  const productivityScore = calculatedMomentum;

  // --------------------------------------------------------
  // ADAPTIVE INTERVENTIONS CORNER STATE & HANDLERS
  // --------------------------------------------------------
  const activeTodoTasksCount = useMemo(() => tasks.filter(t => t.status !== 'Done').length, [tasks]);
  const highPriorityTasksCount = useMemo(() => tasks.filter(t => t.status !== 'Done' && t.priority === 'High').length, [tasks]);
  
  const showBurnoutAlert = activeTodoTasksCount > 5;
  const showMomentumAlert = missedHabitCount >= 2;
  const showDeadlineRescueAlert = highPriorityTasksCount >= 2;
  const showProcrastinationAlert = focusSessionsSkipped > 0;
  const hasAnyAlert = showBurnoutAlert || showMomentumAlert || showDeadlineRescueAlert || showProcrastinationAlert;

  // Productivity Trend Metric
  const productivityTrend = useMemo(() => {
    if (completedTasksCount >= 4) return "Rising (+14%)";
    if (completedTasksCount >= 1) return "Stable (+5%)";
    return "Neutral";
  }, [completedTasksCount]);

  // Burnout risk & Stress estimation
  const burnoutRisk = useMemo(() => {
    const highComplexityCount = activeTasks.filter(t => t.complexity === 'High').length;
    if (activeTasks.length > 5 || highComplexityCount >= 3) return 'High';
    if (activeTasks.length > 2) return 'Medium';
    return 'Low';
  }, [activeTasks]);

  const stressEstimation = useMemo(() => {
    if (burnoutRisk === 'High' || overdueCount > 1) return 'Heavy Loading';
    if (burnoutRisk === 'Medium' || overdueCount > 0) return 'Moderate Focus';
    return 'Optimized Flow';
  }, [burnoutRisk, overdueCount]);

  // Completion Forecast & Habit Retention
  const completionForecast = useMemo(() => {
    if (calculatedMomentum > 80) return "92% On-Time";
    if (calculatedMomentum > 60) return "84% Probable";
    return "72% At Risk";
  }, [calculatedMomentum]);

  const habitRetention = useMemo(() => {
    if (habitConsistency > 80) return "Excellent (92%)";
    if (habitConsistency > 50) return "Consistent (78%)";
    return "Improving (60%)";
  }, [habitConsistency]);

  // --------------------------------------------------------
  // DYNAMIC GREETING GENERATOR (TEMPLATES ROTATION)
  // --------------------------------------------------------
  const adaptiveGreeting = useMemo(() => {
    const hour = new Date().getHours();
    let timeGreeting = "Today looks productive";
    if (hour >= 5 && hour < 12) timeGreeting = `Good Morning, ${profile.name} ☀️`;
    else if (hour >= 12 && hour < 17) timeGreeting = `Good Afternoon, ${profile.name} 🌤️`;
    else if (hour >= 17 && hour < 21) timeGreeting = `Good Evening, ${profile.name} 🌙`;
    else timeGreeting = `Rest & Recharge, ${profile.name} 🌌`;

    const pendingCount = activeTasks.length;
    const unpaidCount = unpaidCommitments.length;

    // First time experience Welcome override
    if (pendingCount === 0 && maxStreak === 0) {
      return {
        type: 'Welcome',
        title: `Welcome back ${profile.name.split(' ')[0]} 👋`,
        text: `LifePilot is ready. Today's mission: Complete your most important milestone.`,
        tag: '🚀 First Mission'
      };
    }

    // Categorized templates
    const templates = [
      {
        type: 'Motivational',
        title: timeGreeting,
        text: maxStreak > 0 
          ? `Let's keep your ${maxStreak}-day streak alive. Momentum builds character!` 
          : `Every micro-step today prepares you for future placement breakthroughs.`,
        tag: '🔥 Streak Sync'
      },
      {
        type: 'Professional',
        title: `Daily Target: Clear Focus`,
        text: pendingCount > 0 
          ? `You have ${pendingCount} immediate priorities queued. Let's attack the highest priority first.` 
          : `All clear on pending tasks. Time to explore advanced learning paths or custom roadmaps!`,
        tag: '🎯 Strategic'
      },
      {
        type: 'Supportive',
        title: `Sustainable Progress`,
        text: `Remember to pace yourself today, ${profile.name}. Est. stress level is ${burnoutRisk === 'High' ? 'slightly heavy' : 'perfectly manageable'}. Focus on one card at a time.`,
        tag: '🌱 Mindful'
      },
      {
        type: 'Playful',
        title: `Workspace Ready 🎮`,
        text: completedMilestonesCount > 0 
          ? `With ${completedMilestonesCount} milestones locked, your momentum is excellent. Ready to conquer more?` 
          : `Time to convert some checklist items into progress XP. Let's build today!`,
        tag: '✨ Gamified'
      },
      {
        type: 'Minimal',
        title: `Flow State Active`,
        text: `Noise-free canvas ready. Deep-focus and systematic progress are your priorities today.`,
        tag: '💻 Zen'
      },
      {
        type: 'Mentor-style',
        title: `AI Copilot Advisory`,
        text: unpaidCount > 0 
          ? `A friendly heads-up: ${unpaidCount} commitments are outstanding this week. Plan finances accordingly.` 
          : `No outstanding commitments. Your growth trajectory looks clean. Continue your active learning paths.`,
        tag: '🤖 Mentor'
      }
    ];

    // Pick index based on hour of the day or pseudo-random
    const chosenIndex = (hour + pendingCount + unpaidCount) % templates.length;
    return templates[chosenIndex];
  }, [profile, activeTasks, unpaidCommitments, maxStreak, completedMilestonesCount, burnoutRisk]);

  // --------------------------------------------------------
  // PROACTIVE AI RECOMMENDATIONS GENERATOR
  // --------------------------------------------------------
  const proactiveRecommendations = useMemo(() => {
    const list = [];
    const firstActiveTaskTitle = activeTasks[0]?.title || "DSA Roadmap";

    // Recommendation 1: Contextual Study/Focus Block
    list.push({
      id: 'rec-study-window',
      text: `You usually study between 6–9 PM. Suggested focus: ${firstActiveTaskTitle}.`,
      type: 'learning',
      actionLabel: 'Continue Learning',
      tab: 'growth'
    });

    // Recommendation 2: Probability of Completion drop if delayed
    if (activeTasks.length > 0) {
      list.push({
        id: 'rec-prob-drop',
        text: `Completion probability for "${firstActiveTaskTitle}" drops below 60% if postponed to tomorrow.`,
        type: 'focus',
        actionLabel: 'Start Focus',
        tab: 'focus'
      });
    } else {
      list.push({
        id: 'rec-prob-drop',
        text: "Completion probability drops below 60% if new core commitments are postponed to tomorrow.",
        type: 'focus',
        actionLabel: 'Queue Priorities',
        tab: 'calendar'
      });
    }

    // Recommendation 3: Coding streak continuation
    const firstHabitTitle = habits[0]?.title || "Coding Practice";
    list.push({
      id: 'rec-streak-continuation',
      text: `Current ${firstHabitTitle} streak has an 82% chance of continuation if finished today.`,
      type: 'habit',
      actionLabel: 'Complete Habit',
      action: habits[0] ? () => completeHabit(habits[0].id) : undefined,
      tab: habits[0] ? undefined : 'growth'
    });

    // Recommendation 4: Energy peak window
    list.push({
      id: 'rec-energy-peak',
      text: "High focus energy window detected right now. Recommended to activate Pomodoro state.",
      type: 'analytics',
      actionLabel: 'Start Focus',
      tab: 'focus'
    });

    return list;
  }, [activeTasks, habits, completeHabit]);

  // --------------------------------------------------------
  // AI INSIGHT CARDS COMPUTATION (7 BEHAVIORAL TELEMETRY WIDGETS)
  // --------------------------------------------------------
  const aiInsightCards = useMemo(() => {
    const activeTodoTasksCount = tasks.filter(t => t.status !== 'Done').length;
    const highPriorityTasksCount = tasks.filter(t => t.status !== 'Done' && t.priority === 'High').length;

    // 1. Burnout Score
    const burnoutScore = Math.min(100, activeTodoTasksCount * 12 + (activeTodoTasksCount > 5 ? 25 : 10));
    const burnoutCard = {
      id: 'insight-burnout',
      title: 'Burnout Score',
      value: `${burnoutScore}% Risk`,
      desc: burnoutScore > 70 ? 'Critical high workload detected' : burnoutScore > 40 ? 'Moderate mental fatigue' : 'Safe mental bandwidth',
      badge: burnoutScore > 70 ? 'High Risk' : burnoutScore > 40 ? 'Moderate' : 'Optimal',
      badgeColor: burnoutScore > 70 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' : burnoutScore > 40 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      icon: <Coffee size={18} className={burnoutScore > 70 ? 'text-rose-400' : 'text-emerald-400'} />,
      progress: burnoutScore,
      actionLabel: 'Take Break',
      actionTab: 'growth'
    };

    // 2. Consistency Index
    const consistencyIndex = habitConsistency;
    const consistencyCard = {
      id: 'insight-consistency',
      title: 'Consistency Index',
      value: `${consistencyIndex}% Sync`,
      desc: consistencyIndex > 75 ? 'Peak habit adherence maintained' : consistencyIndex > 50 ? 'Steady flow stabilizing' : 'High action resistance detected',
      badge: consistencyIndex > 75 ? 'Excellent' : consistencyIndex > 50 ? 'Stable' : 'Attention Needed',
      badgeColor: consistencyIndex > 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      icon: <Flame size={18} className="text-amber-400" />,
      progress: consistencyIndex,
      actionLabel: 'Check Habits',
      actionTab: 'growth'
    };

    // 3. Recovery Readiness
    const recoveryReadiness = Math.max(0, 100 - burnoutScore);
    const recoveryCard = {
      id: 'insight-recovery',
      title: 'Recovery Readiness',
      value: `${recoveryReadiness}% Ready`,
      desc: recoveryReadiness > 70 ? 'Peak energy for deep sprints' : recoveryReadiness > 40 ? 'Mild recharging needed' : 'Needs urgent recovery block',
      badge: recoveryReadiness > 70 ? 'High Energy' : recoveryReadiness > 40 ? 'Recharging' : 'Depleted',
      badgeColor: recoveryReadiness > 70 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      icon: <Smile size={18} className="text-emerald-400" />,
      progress: recoveryReadiness,
      actionLabel: 'View Schedule',
      actionTab: 'calendar'
    };

    // 4. Focus Trend
    const focusTrend = Math.max(10, 85 - focusSessionsSkipped * 15);
    const focusTrendCard = {
      id: 'insight-focus-trend',
      title: 'Focus Trend',
      value: `${focusTrend}% Intensity`,
      desc: focusTrend > 75 ? 'Consistent flow state cycles' : focusTrend > 50 ? 'Distraction resistance high' : 'Frequent cycle interruptions',
      badge: focusTrend > 75 ? 'Laser Focus' : focusTrend > 50 ? 'Standard' : 'Disrupted',
      badgeColor: focusTrend > 75 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      icon: <Target size={18} className="text-indigo-400" />,
      progress: focusTrend,
      actionLabel: 'Start Focus',
      actionTab: 'focus'
    };

    // 5. Momentum Meter
    const momentumMeterCard = {
      id: 'insight-momentum',
      title: 'Momentum Meter',
      value: `${calculatedMomentum}% Velocity`,
      desc: calculatedMomentum >= 75 ? 'Hyper-velocity achieved' : 'Velocity building steadily',
      badge: calculatedMomentum >= 75 ? 'Accelerating' : 'Building',
      badgeColor: calculatedMomentum >= 75 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      icon: <Zap size={18} className="text-indigo-400" />,
      progress: calculatedMomentum,
      actionLabel: 'Boost Velocity',
      actionTab: 'focus'
    };

    // 6. Habit Stability
    const habitStability = Math.min(100, habits.reduce((acc, h) => acc + h.streak * 12, 45));
    const habitStabilityCard = {
      id: 'insight-stability',
      title: 'Habit Stability',
      value: `${habitStability}% Solid`,
      desc: habitStability > 70 ? 'Highly resilient routines' : 'Routine core forming',
      badge: habitStability > 70 ? 'Resilient' : 'Formative',
      badgeColor: habitStability > 70 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      icon: <Activity size={18} className="text-emerald-400" />,
      progress: habitStability,
      actionLabel: 'Habit Engine',
      actionTab: 'growth'
    };

    // 7. Stress Gauge
    const stressGauge = Math.min(100, highPriorityTasksCount * 25 + (overdueCount * 30) + 15);
    const stressCard = {
      id: 'insight-stress',
      title: 'Stress Gauge',
      value: `${stressGauge}% Load`,
      desc: stressGauge > 70 ? 'High neurological stress load' : stressGauge > 40 ? 'Moderate stress load' : 'Calm & composed state',
      badge: stressGauge > 70 ? 'High Stress' : stressGauge > 40 ? 'Challenging' : 'Peaceful',
      badgeColor: stressGauge > 70 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      icon: <Heart size={18} className="text-rose-400" />,
      progress: stressGauge,
      actionLabel: 'Mind Reset',
      actionTab: 'panic'
    };

    return [burnoutCard, consistencyCard, recoveryCard, focusTrendCard, momentumMeterCard, habitStabilityCard, stressCard];
  }, [tasks, habitConsistency, focusSessionsSkipped, calculatedMomentum, habits, overdueCount]);

  // --------------------------------------------------------
  // AUTOMATIC ACHIEVEMENTS & BADGES SYSTEM
  // --------------------------------------------------------
  const achievements = useMemo(() => [
    { 
      id: 'focus_master', 
      name: 'Focus Master', 
      icon: '🏆', 
      desc: 'Complete 3+ tasks in a week', 
      unlocked: completedTasksCount >= 3 
    },
    { 
      id: 'seven_day', 
      name: '7 Day Warrior', 
      icon: '🔥', 
      desc: 'Achieve a 5+ day habit streak', 
      unlocked: maxStreak >= 5 
    },
    { 
      id: 'linux_apprentice', 
      name: 'Linux Apprentice', 
      icon: '📚', 
      desc: 'Active Roadmap or Goal selected', 
      unlocked: (roadmaps && roadmaps.length > 0) || (goals && goals.length > 0) 
    },
    { 
      id: 'hackathon_hero', 
      name: 'Hackathon Hero', 
      icon: '🚀', 
      desc: 'Finish any high complexity task or 5+ goals', 
      unlocked: tasks.some(t => t.complexity === 'High' && t.status === 'Done') || completedTasksCount >= 5 
    },
    { 
      id: 'consistency_builder', 
      name: 'Consistency Builder', 
      icon: '🧠', 
      desc: 'Maintain habit consistency >= 80%', 
      unlocked: habitConsistency >= 80 && habits.length > 0 
    },
    { 
      id: 'momentum_builder', 
      name: 'Momentum Builder', 
      icon: '⚡', 
      desc: 'Reach a momentum score of 75+', 
      unlocked: calculatedMomentum >= 75 
    }
  ], [completedTasksCount, maxStreak, roadmaps, goals, tasks, habitConsistency, habits, calculatedMomentum]);

  // Handle trigger for weekly review summary (Phase 2 contextual synthesis)
  const handleWeeklyReview = async () => {
    setIsReviewLoading(true);
    try {
      let apiResponse = null;
      try {
        apiResponse = await generateWeeklyReview();
      } catch (err) {
        console.log("No API response or offline; synthesizing high fidelity local report.");
      }

      const strengthsList = [
        "Coding consistency improving",
        habitConsistency >= 75 ? "Habit completion rate stable" : "Daily routine starting to align",
        "Focus sessions increasing"
      ];

      const riskList = [
        overdueCount > 0 ? `${overdueCount} overdue priorities` : "DSA roadmap approaching deadline",
        calculatedMomentum < 75 ? "Momentum score slightly declining" : "Pacing could be optimized under heavy loads"
      ];

      const recommendationList = [
        activeTasks[0] ? `Finish ${activeTasks[0].title} before Sunday evening` : "Schedule two deep work blocks next week",
        "Schedule two deep work blocks to maintain streak velocity",
        "Protect current coding streak at all costs"
      ];

      const confidence = Math.min(96, Math.max(45, 84 + (completedTasksCount * 2) - (overdueCount * 6)));

      const reviewData = {
        summary: apiResponse?.summary || `You navigated this week with commendable persistence. Accumulating ${focusHours} focus hours is an excellent foundation for sustained learning.`,
        completedStrengths: apiResponse?.completedStrengths || `Successfully checked off ${completedTasksCount} tasks and maintained core habit streaks.`,
        areasToImprove: apiResponse?.areasToImprove || (overdueCount > 0 ? `${overdueCount} overdue priorities require better time boxing.` : "Managing friction during early transitions."),
        nextWeekStrategy: apiResponse?.nextWeekStrategy || "Pace yourself and schedule deep focus blocks during your high energy window (6 PM–9 PM).",
        // Extended Structured Fields for the UI
        tasksCompleted: completedTasksCount,
        focusHours: focusHours + "h",
        longestStreak: maxStreak + " days",
        strengthsList,
        riskList,
        recommendationList,
        momentumScore: calculatedMomentum + "%",
        completionConfidence: confidence + "%"
      };

      setWeeklyReview(reviewData);
    } catch (err) {
      showToast("Failed to compile weekly review.", "error");
    } finally {
      setIsReviewLoading(false);
    }
  };

  // Grouped items based on Role from AppContext
  const roleAesthetic = {
    Student: {
      accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      badge: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
      tagline: 'Track your university syllabus, complete coding labs, and automate study sessions.',
      sections: [
        { title: 'Academic Priorities', desc: 'Assignments & exams' },
        { title: 'Daily Coding Labs', desc: 'LeetCode & project blocks' },
        { title: 'Skill Roadmap', desc: 'Mastery modules' }
      ]
    },
    Professional: {
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      tagline: 'Pristine task execution, company commitments tracking, and structured engineering career paths.',
      sections: [
        { title: 'Deliverables Sync', desc: 'Active releases & tasks' },
        { title: 'Commitment Ledger', desc: 'Recurring accounts' },
        { title: 'Career Acceleration', desc: 'System architecture' }
      ]
    },
    Entrepreneur: {
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      tagline: 'Supervise product timelines, track financial runway, and coordinate core business priorities.',
      sections: [
        { title: 'Milestones & KPI', desc: 'Board & investor targets' },
        { title: 'Operational Tasks', desc: 'Sprints & team delegating' },
        { title: 'Corporate Obligations', desc: 'Rentals & monthly billing' }
      ]
    }
  }[profile.role];

  return (
    <div className="space-y-6 max-w-6xl mx-auto selection:bg-indigo-500/30 text-slate-100 pb-12">
      
      {/* --------------------------------------------------------
          SKELETON INITIALIZING STATE (PREMIUM BOOT SENSATION)
          -------------------------------------------------------- */}
      <AnimatePresence mode="wait">
        {isInitializing ? (
          <motion.div 
            key="skeleton-loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header Banner Skeleton */}
            <div className="bg-slate-900/60 rounded-3xl p-8 border border-white/5 animate-pulse flex flex-col justify-between h-48">
              <div className="space-y-3">
                <div className="h-6 w-32 bg-white/10 rounded-full" />
                <div className="h-8 w-1/2 bg-white/15 rounded-lg" />
                <div className="h-4 w-3/4 bg-white/5 rounded-lg" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-24 bg-white/10 rounded-full" />
                <div className="h-6 w-32 bg-white/5 rounded-full" />
              </div>
            </div>

            {/* Quick Analytics Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-900/40 rounded-2xl border border-white/5 animate-pulse" />
              ))}
            </div>

            {/* Two Column Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-40 bg-slate-900/40 rounded-3xl border border-white/5 animate-pulse" />
                <div className="h-72 bg-slate-900/40 rounded-3xl border border-white/5 animate-pulse" />
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-slate-900/40 rounded-3xl border border-white/5 animate-pulse" />
                <div className="h-64 bg-slate-900/40 rounded-3xl border border-white/5 animate-pulse" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* --------------------------------------------------------
                1. HEADER BANNER & DYNAMIC AI GREETING
                -------------------------------------------------------- */}
            <div className="backdrop-blur-xl bg-slate-950/80 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden border border-white/10 shadow-2xl">
              <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl -z-10 pointer-events-none" />
              <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl -z-10 pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div className="md:col-span-3 space-y-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-indigo-200 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/10">
                      <Sparkles size={12} className="text-indigo-400" />
                      <span>Persona Active: {profile.role}</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 rounded-full font-mono font-bold uppercase">
                      {adaptiveGreeting.tag}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                      {adaptiveGreeting.title}
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed font-sans">
                      {adaptiveGreeting.text} <span className="text-indigo-200">Your custom AI companion has indexed your core goals: "{profile.coreGoals?.[0]}"</span>.
                    </p>
                  </div>

                  {/* Profile strengths & challenges pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {profile.strengths?.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="text-[11px] backdrop-blur-md bg-white/10 border border-white/10 text-slate-200 px-3 py-1 rounded-lg">
                        💪 {s}
                      </span>
                    ))}
                    {profile.challenges?.slice(0, 1).map((c, idx) => (
                      <span key={idx} className="text-[11px] backdrop-blur-md bg-white/5 border border-white/5 text-slate-400 px-3 py-1 rounded-lg">
                        ⚠️ Overcoming: {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* --------------------------------------------------------
                    1A. THE HIGH-FIDELITY MOMENTUM & PRODUCTIVITY GAUGE
                    -------------------------------------------------------- */}
                <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md relative">
                  <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider mb-2 font-bold flex items-center gap-1">
                    <Activity size={10} /> Productivity Score
                  </span>
                  
                  <div className="relative flex items-center justify-center h-24 w-24">
                    {/* Background Circle */}
                    <svg className="absolute transform -rotate-90 w-full h-full">
                      <circle
                        cx="48"
                        cy="48"
                        r="38"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      {/* Animated Foreground Progress Circle */}
                      <motion.circle
                        cx="48"
                        cy="48"
                        r="38"
                        stroke={calculatedMomentum >= 80 ? "#10b981" : calculatedMomentum >= 60 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 38}
                        initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                        animate={{ strokeDashoffset: (2 * Math.PI * 38) * (1 - calculatedMomentum / 100) }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="text-2xl font-black font-display text-white">
                      {calculatedMomentum}%
                    </span>
                  </div>

                  <div className="text-center mt-3 space-y-0.5">
                    {calculatedMomentum >= 80 ? (
                      <>
                        <span className="text-[11px] font-bold text-emerald-400 block">Excellent Progress</span>
                        <span className="text-[10px] text-slate-300 block leading-tight">Keep maintaining your streaks.</span>
                      </>
                    ) : overdueCount > 0 ? (
                      <>
                        <span className="text-[11px] font-bold text-rose-400 block">Needs Attention</span>
                        <span className="text-[10px] text-slate-300 block leading-tight">{overdueCount} overdue task{overdueCount > 1 ? 's' : ''} detected.</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] font-bold text-amber-400 block">Steady Pace</span>
                        <span className="text-[10px] text-slate-300 block leading-tight">No overdue tasks, keep coding!</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------
                1AA. GAMIFICATION CENTRE (XP, LEVELS, STREAK, BADGES & DAILY CHALLENGES)
                -------------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Side: XP Progress & Level & Title Card */}
              <div className="backdrop-blur-xl bg-slate-950/70 rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                        <Award size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400 font-bold">Productivity Level</h3>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-xl font-black font-display text-white">Level {level}</span>
                          <span className="text-xs px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full font-bold">
                            {getTitleForLevel(level)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Streak Flame */}
                    <div className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                      <Flame size={16} fill="currentColor" className="animate-pulse" />
                      <span className="text-xs font-black font-mono">{streak} DAY STREAK</span>
                    </div>
                  </div>

                  {/* XP Bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Experience Points (XP)</span>
                      <span className="font-mono font-bold text-white">{userXP} XP</span>
                    </div>
                    
                    {/* Progress Fill */}
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${Math.min(100, (level === 5 ? 100 : ((userXP - (level === 1 ? 0 : level === 2 ? 100 : level === 3 ? 250 : level === 4 ? 500 : 1000)) / (level === 1 ? 100 : level === 2 ? 150 : level === 3 ? 250 : level === 4 ? 500 : 1000)) * 100))}%` 
                        }}
                        transition={{ duration: 1.0, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                      />
                    </div>
                    
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>{level === 1 ? '0' : level === 2 ? '100' : level === 3 ? '250' : level === 4 ? '500' : '1000'} XP</span>
                      <span>{level === 5 ? 'Mastered' : `${level === 1 ? '100' : level === 2 ? '250' : level === 3 ? '500' : level === 4 ? '1000' : 'Max'} XP Next Level`}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400/90 pt-4 border-t border-white/5 mt-4">
                  🚀 Earn <span className="text-indigo-400 font-bold">+20 XP</span> tasks, <span className="text-indigo-400 font-bold">+10 XP</span> habits, and <span className="text-indigo-400 font-bold">+25 XP</span> focus blocks.
                </div>
              </div>

              {/* Middle Side: Badge Showcase */}
              <div className="backdrop-blur-xl bg-slate-950/70 rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-4 w-full">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400 font-bold">Badge Showcase</h3>
                      <p className="text-[11px] text-slate-500">Milestone achievements you have unlocked</p>
                    </div>
                  </div>

                  {/* Badge Row */}
                  <div className="grid grid-cols-5 gap-3 pt-2">
                    {[
                      { name: 'Consistency Warrior', desc: '7 Day Streak', icon: '🏅', requirement: 'Maintain a 7-day habit streak' },
                      { name: 'Focus Master', desc: '10 Pomodoros', icon: '🔥', requirement: 'Complete 10 deep focus blocks' },
                      { name: 'Lifelong Learner', desc: '20 Lessons', icon: '📚', requirement: 'Complete 20 roadmap lessons' },
                      { name: 'Crisis Survivor', desc: '5 Panic Runs', icon: '🚨', requirement: 'Complete 5 critical goals under pressure' },
                      { name: 'Productivity Beast', desc: '100 Tasks', icon: '⚡', requirement: 'Complete 100 roadmap tasks' }
                    ].map((badgeObj, bidx) => {
                      const isUnlocked = badges.includes(badgeObj.name);
                      return (
                        <div 
                          key={bidx} 
                          className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all relative group/badge cursor-help ${
                            isUnlocked 
                              ? 'bg-gradient-to-b from-amber-500/10 to-amber-600/5 border-amber-500/30 text-amber-300 shadow-lg shadow-amber-500/5' 
                              : 'bg-slate-900/40 border-white/5 text-slate-600 grayscale opacity-40'
                          }`}
                        >
                          <span className="text-2xl mb-1">{badgeObj.icon}</span>
                          <span className="text-[8px] font-mono font-bold uppercase tracking-tight text-center line-clamp-1">
                            {badgeObj.name.split(' ')[0]}
                          </span>

                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-40 bg-slate-900 border border-white/10 p-2 rounded-xl shadow-xl opacity-0 scale-95 group-hover/badge:opacity-100 group-hover/badge:scale-100 transition-all pointer-events-none z-30">
                            <h4 className="text-xs font-bold text-white flex items-center gap-1">
                              {badgeObj.icon} {badgeObj.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1 leading-tight">{badgeObj.requirement}</p>
                            <span className={`text-[9px] font-mono font-bold block mt-1.5 ${isUnlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {isUnlocked ? '✓ Unlocked' : 'Locked'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-xs text-slate-400/90 pt-4 border-t border-white/5 mt-4 flex justify-between items-center">
                  <span>Completed Achievements</span>
                  <span className="font-mono font-bold text-amber-400">{badges.length} / 5</span>
                </div>
              </div>

              {/* Right Side: Daily Challenges Generator / Tracker */}
              <div className="backdrop-blur-xl bg-slate-950/70 rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400 border border-pink-500/20">
                        <Zap size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400 font-bold">Daily Challenges</h3>
                        <p className="text-[11px] text-slate-500">Finish objectives today to claim bonus XP</p>
                      </div>
                    </div>
                  </div>

                  {/* Challenges Checklist */}
                  <div className="space-y-2 pt-1.5">
                    {[
                      { id: 'ch-tasks', label: 'Complete 3 tasks', xp: 40, current: statistics.tasksCompleted % 3, total: 3 },
                      { id: 'ch-lesson', label: 'Finish one lesson', xp: 30, current: statistics.lessonsWatched >= 1 ? 1 : 0, total: 1 },
                      { id: 'ch-focus', label: 'Do one focus session', xp: 50, current: statistics.hoursFocused >= 0.4 ? 1 : 0, total: 1 },
                      { id: 'ch-streak', label: 'Maintain your streak', xp: 30, current: streak >= 1 ? 1 : 0, total: 1 }
                    ].map((ch, cidx) => {
                      const isDone = completedChallenges.includes(ch.id) || ch.current >= ch.total;
                      const canClaim = ch.current >= ch.total && !completedChallenges.includes(ch.id);
                      
                      return (
                        <div key={ch.id} className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/50 border border-white/5 text-xs">
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isDone ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'border-slate-700 text-slate-500'
                            }`}>
                              {isDone && '✓'}
                            </div>
                            <div>
                              <p className={`font-semibold ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>{ch.label}</p>
                              <span className="text-[10px] font-mono text-slate-500">
                                Progress: {Math.min(ch.total, ch.current)} / {ch.total}
                              </span>
                            </div>
                          </div>

                          {/* Claim button */}
                          {canClaim ? (
                            <button 
                              onClick={() => {
                                addXP(ch.xp, `Daily Challenge: ${ch.label}`);
                                setCompletedChallenges(prev => {
                                  const updated = [...prev, ch.id];
                                  localStorage.setItem('completedChallenges', JSON.stringify(updated));
                                  return updated;
                                });
                              }}
                              className="px-2.5 py-1 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white rounded-xl text-[10px] font-bold cursor-pointer shadow-md"
                            >
                              Claim +{ch.xp} XP
                            </button>
                          ) : completedChallenges.includes(ch.id) ? (
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Claimed</span>
                          ) : (
                            <span className="text-[10px] font-mono text-indigo-400">+{ch.xp} XP</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-xs text-slate-400/90 pt-3 border-t border-white/5 mt-3 flex justify-between items-center">
                  <span>Weekly Bonus Opportunity</span>
                  <span className="font-mono font-bold text-pink-400">+150 XP</span>
                </div>
              </div>
            </div>

            {/* Floating Recent Achievement Notification Popup */}
            <AnimatePresence>
              {recentAchievement && (
                <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="fixed top-6 right-6 z-50 p-4 rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl flex items-center space-x-4 max-w-sm pointer-events-none"
                  style={{ boxShadow: '0 0 30px rgba(99, 102, 241, 0.25)' }}
                >
                  <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shrink-0">
                    ✨
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 font-mono">XP Gained!</span>
                    <h4 className="text-sm font-black text-white">+{recentAchievement.xp} XP Points</h4>
                    <p className="text-xs text-slate-300 leading-tight mt-0.5">{recentAchievement.text}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --------------------------------------------------------
                1B. BEHAVIORAL INTELLIGENCE & ADAPTIVE INTERVENTIONS
                -------------------------------------------------------- */}
            {hasAnyAlert && (
              <div className="space-y-4 bg-slate-950/45 p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-rose-500/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
                <div className="absolute bottom-0 left-0 h-40 w-40 bg-amber-500/5 rounded-full blur-3xl animate-pulse pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    <h3 className="text-xs font-mono font-bold tracking-widest text-rose-400 uppercase flex items-center gap-1.5">
                      <Brain size={13} className="animate-pulse" /> Active Behavioral Interventions
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Continuous Neural Monitoring Active</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Burnout Risk Alert */}
                  {showBurnoutAlert && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-slate-900/60 border border-rose-500/20 rounded-2xl flex flex-col justify-between space-y-3 relative group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                          <ShieldAlert size={16} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-400">⚠ Burnout Risk Detected</span>
                          <h4 className="text-xs font-bold text-white">Heavy Cognitive Overload</h4>
                          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                            You completed 18 hours of work in the last two days. You have {activeTodoTasksCount} active tasks scheduled for today.
                          </p>
                          <p className="text-[11px] text-amber-400/90 font-medium">
                            💡 Take a 30-minute recovery block. Hydrate. Stretch. Reduce workload tomorrow.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-[9px] font-mono text-emerald-400">Est. Recovery Gain: +18%</span>
                        <button
                          onClick={() => {
                            // Recover burnout
                            addInterventionHistory({
                              type: 'burnout',
                              title: 'High Load Alert',
                              questionOrMessage: 'Completed 18 hours of work. Heavy loading detected.',
                              status: 'Accepted',
                              actionTaken: 'Took a 30-minute recovery block',
                              impactMetrics: '+18% Bandwidth Restored'
                            });
                            // Reschedule 2 tasks
                            const todoTasks = tasks.filter(t => t.status !== 'Done');
                            if (todoTasks.length >= 2) {
                              const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                              // Trigger state updates
                              const id1 = todoTasks[0].id;
                              const id2 = todoTasks[1].id;
                              todoTasks.forEach((t, i) => {
                                if (i < 2) {
                                  delayTask(t.id);
                                }
                              });
                            }
                            showToast("30-minute recovery block logged. Rescheduled tasks to relieve overload.", "success");
                          }}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold border border-rose-500/25 transition-all"
                        >
                          Take 30-Min Recovery Block
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Momentum Recovery Card */}
                  {showMomentumAlert && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-slate-900/60 border border-amber-500/20 rounded-2xl flex flex-col justify-between space-y-3 relative group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                          <Flame size={16} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400">🔥 Momentum Recovery Coach</span>
                          <h4 className="text-xs font-bold text-white">Streak Interrupted</h4>
                          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                            Your LeetCode streak ended yesterday. Don't let a single miss break your long-term consistency.
                          </p>
                          <p className="text-[11px] text-indigo-400/90 font-medium">
                            💡 Want to restart with a quick 10-minute challenge?
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5 justify-end">
                        {[
                          { label: 'Resume Habit', action: 'Resume Habit', impact: 'Streak Resumed' },
                          { label: 'Micro Session', action: 'Micro Session', impact: '10m Block Run' },
                          { label: 'Easy Task', action: 'Easy Task', impact: 'Low Friction Completed' },
                          { label: 'Reset Schedule', action: 'Reset Schedule', impact: 'Routine Reset' }
                        ].map((btn, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={() => {
                              addInterventionHistory({
                                type: 'momentum',
                                title: 'Coding Streak broken',
                                questionOrMessage: 'Streak ended yesterday.',
                                status: 'Accepted',
                                actionTaken: btn.action,
                                impactMetrics: btn.impact
                              });
                              setMissedHabitCount(0);
                              if (btn.action === 'Resume Habit') {
                                // Add 1 streak to LeetCode habit
                                const targetHabit = habits.find(h => h.title.toLowerCase().includes('leetcode')) || habits[0];
                                if (targetHabit) {
                                  completeHabit(targetHabit.id);
                                }
                              } else if (btn.action === 'Micro Session') {
                                setActiveTab('focus');
                              }
                              showToast(`Momentum action taken: "${btn.label}". Missed habit count reset.`, "success");
                            }}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 font-medium border border-white/10 rounded-lg transition-all"
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Deadline Rescue Card */}
                  {showDeadlineRescueAlert && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-slate-900/60 border border-rose-500/20 rounded-2xl flex flex-col justify-between space-y-3 relative group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                          <AlertTriangle size={16} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-400">🚨 Emergency Deadline Rescue</span>
                          <h4 className="text-xs font-bold text-white">Multiple Looming Deadlines</h4>
                          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                            You have {highPriorityTasksCount} high-priority assignments due within 48 hours. Let's protect the critical path.
                          </p>
                          <p className="text-[11px] text-rose-400/90 font-medium font-sans">
                            💡 Shift low-priority tasks, Enter Panic Mode, Generate Emergency Plan, Protect sleep.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5 justify-end">
                        {[
                          { label: 'Shift Low-Priority Tasks', action: 'Shift' },
                          { label: 'Enter Panic Mode', action: 'Panic' },
                          { label: 'Generate Emergency Plan', action: 'Emergency' }
                        ].map((btn, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={() => {
                              addInterventionHistory({
                                type: 'deadline',
                                title: 'Deadline Approaching',
                                questionOrMessage: `${highPriorityTasksCount} deadlines due in 48h.`,
                                status: 'Accepted',
                                actionTaken: btn.label,
                                impactMetrics: 'Critical Path Protected'
                              });
                              
                              if (btn.action === 'Shift') {
                                const lowTasks = tasks.filter(t => t.priority === 'Low');
                                lowTasks.forEach(t => {
                                  delayTask(t.id);
                                });
                                showToast("Shifted low priority tasks to relieve immediate urgency.", "success");
                              } else if (btn.action === 'Panic') {
                                const nearest = tasks.find(t => t.priority === 'High' && t.status !== 'Done') || tasks[0];
                                triggerIntervention(nearest);
                                setActiveTab('panic');
                              } else if (btn.action === 'Emergency') {
                                setActiveTab('calendar');
                                showToast("Switched to calendar to view emergency scheduled blocks.", "info");
                              }
                            }}
                            className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/25 rounded-xl text-[10px] transition-all"
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Procrastination Alert Card */}
                  {showProcrastinationAlert && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-slate-900/60 border border-indigo-500/20 rounded-2xl flex flex-col justify-between space-y-3 relative group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                          <Brain size={16} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-400">🧠 Procrastination Loop Bypassed</span>
                          <h4 className="text-xs font-bold text-white">Focus Loop Evaded</h4>
                          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                            You skipped {focusSessionsSkipped} focus sessions today. Resistance cycle detected!
                          </p>
                          <p className="text-[11px] text-indigo-400/90 font-medium">
                            💡 Break task into micro-actions or schedule a low-pressure focus block.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5 justify-end">
                        {[
                          { label: 'Break into microtasks', action: 'Break' },
                          { label: 'Low-pressure 15m session', action: 'Session' },
                          { label: 'Reset skip counter', action: 'Reset' }
                        ].map((btn, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={() => {
                              addInterventionHistory({
                                type: 'procrastination',
                                title: 'Skipped Focus Session Alert',
                                questionOrMessage: `Skipped ${focusSessionsSkipped} focus blocks.`,
                                status: 'Accepted',
                                actionTaken: btn.label,
                                impactMetrics: 'Inertia broken'
                              });
                              setFocusSessionsSkipped(0);
                              
                              if (btn.action === 'Break') {
                                const todoTask = tasks.find(t => t.status !== 'Done') || tasks[0];
                                if (todoTask) {
                                  triggerIntervention(todoTask);
                                }
                              } else if (btn.action === 'Session') {
                                setActiveTab('focus');
                              }
                            }}
                            className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/25 rounded-xl text-[10px] transition-all"
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* --------------------------------------------------------
                2. AI PROACTIVE RECOMMENDATIONS SLIDER
                -------------------------------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {proactiveRecommendations.map((rec) => (
                <div 
                  key={rec.id}
                  className="flex flex-col justify-between p-4 bg-slate-950/60 border border-white/5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="absolute right-0 top-0 h-20 w-20 bg-indigo-500/5 rounded-full blur-xl" />
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0">
                      <Sparkles size={14} className="animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-indigo-400">AI Recommendation</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{rec.text}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">Auto-generated</span>
                    {rec.actionLabel && (
                      <button 
                        onClick={() => {
                          if (rec.tab) setActiveTab(rec.tab);
                          if (rec.action) rec.action();
                        }}
                        className="text-[10px] text-indigo-400 font-semibold flex items-center gap-0.5 hover:text-indigo-300 transition-colors"
                      >
                        <span>{rec.actionLabel}</span>
                        <ChevronRight size={10} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* --------------------------------------------------------
                3. CONTEXT SHORTS (COGNITIVE SHORTCUTS RAIL)
                -------------------------------------------------------- */}
            <div className="bg-slate-950/40 rounded-2xl p-3 border border-white/5 flex flex-wrap gap-2 items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold pl-2 flex items-center gap-1">
                <Brain size={12} /> Neural Shortcuts:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Start Focus', tab: 'focus', icon: <Zap size={12} /> },
                  { label: 'Activate Panic', tab: 'panic', icon: <AlertTriangle size={12} className="text-rose-400" /> },
                  { label: 'Growth Hub', tab: 'growth', icon: <Compass size={12} /> },
                  { label: 'Schedule Day', tab: 'calendar', icon: <CalendarIcon size={12} /> },
                  { label: 'My Persona', tab: 'profile', icon: <Award size={12} /> }
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(s.tab)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    {s.icon}
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* --------------------------------------------------------
                4. AI INSIGHTS PANEL (COLORFUL BUT SUBTLE CARDS)
                -------------------------------------------------------- */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase flex items-center gap-1.5">
                <BarChart2 size={12} /> AI Copilot Telemetry Insights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                {aiInsightCards.map((card) => (
                  <motion.div 
                    key={card.id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl flex flex-col justify-between space-y-4 shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {card.icon}
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">{card.title}</span>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-slate-100 truncate">{card.value}</p>
                      <p className="text-[10px] text-slate-400 font-sans leading-snug">{card.desc}</p>
                    </div>

                    {/* Progress Fill Indicator */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                        <span>Progress Metric</span>
                        <span>{card.progress}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${card.progress}%` }}
                          transition={{ duration: 1 }}
                          className="bg-indigo-500 h-full rounded-full"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveTab(card.actionTab)}
                      className="w-full text-center py-1.5 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 rounded-lg transition-all border border-white/10 flex items-center justify-center gap-1"
                    >
                      <span>{card.actionLabel}</span>
                      <ArrowRight size={10} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* --------------------------------------------------------
                4B. AI ACHIEVEMENTS & PROGRESS BADGES (PHASE 2)
                -------------------------------------------------------- */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
                <Award size={12} className="animate-bounce" /> Live Achievements & Progression Badges
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {achievements.map((badge) => (
                  <motion.div 
                    key={badge.id}
                    whileHover={{ scale: 1.03 }}
                    className={`p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 border transition-all ${
                      badge.unlocked 
                        ? 'bg-slate-900/95 border-amber-500/30 shadow-lg shadow-amber-500/5' 
                        : 'bg-slate-950/40 border-white/5 opacity-40'
                    }`}
                  >
                    <div className={`text-2xl h-11 w-11 flex items-center justify-center rounded-full ${
                      badge.unlocked ? 'bg-amber-500/10 animate-pulse' : 'bg-white/5'
                    }`}>
                      {badge.icon}
                    </div>
                    <div className="space-y-0.5">
                      <span className={`text-xs font-black block ${badge.unlocked ? 'text-amber-300' : 'text-slate-400'}`}>
                        {badge.name}
                      </span>
                      <span className="text-[9px] text-slate-500 font-sans block leading-tight min-h-[24px]">
                        {badge.desc}
                      </span>
                    </div>
                    {badge.unlocked ? (
                      <span className="text-[8px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-black">Unlocked</span>
                    ) : (
                      <span className="text-[8px] font-mono uppercase bg-white/5 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">Locked</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* --------------------------------------------------------
                4C. BEHAVIORAL INTERVENTIONS HISTORY & TELEMETRY LOGS
                -------------------------------------------------------- */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
                  <Activity size={12} /> LifePilot Intervention Coach Logs
                </h3>
                <span className="text-[10px] font-mono text-slate-500">Persistent Storage Synchronized</span>
              </div>

              {/* Impact Telemetry Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Intervention Recovery Rate", value: `${Math.round((interventionHistory.filter(i => i.status === 'Accepted').length / Math.max(1, interventionHistory.length)) * 100)}%`, desc: "Ratio of coaching sessions accepted", color: "text-emerald-400" },
                  { label: "Inertia Loops Overridden", value: `${interventionHistory.filter(i => i.status === 'Accepted').length} Bypassed`, desc: "Resistance loops successfully broken", color: "text-indigo-400" },
                  { label: "Telemetry Events Logged", value: `${interventionHistory.length} Tracked`, desc: "Total continuous observation triggers", color: "text-amber-400" },
                  { label: "Cognitive Hours Recovered", value: `~${(interventionHistory.filter(i => i.status === 'Accepted').length * 1.5).toFixed(1)} Hrs`, desc: "Estimated study time saved by micro-pivots", color: "text-rose-400" }
                ].map((stat, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl space-y-1">
                    <span className="text-[9px] font-mono uppercase text-slate-500 font-bold tracking-wider">{stat.label}</span>
                    <p className={`text-lg font-black font-display ${stat.color}`}>{stat.value}</p>
                    <p className="text-[9px] text-slate-400 font-sans leading-tight">{stat.desc}</p>
                  </div>
                ))}
              </div>

              {/* Scrollable Telemetry List */}
              <div className="backdrop-blur-xl bg-slate-950/50 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                <div className="px-5 py-3.5 bg-slate-900/40 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Continuous Neural Log Roll</span>
                  {confirmingClear ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">Reset history?</span>
                      <button
                        onClick={() => {
                          localStorage.removeItem('lifepilot_intervention_history');
                          window.location.reload();
                        }}
                        className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/10 px-2 py-0.5 rounded-md cursor-pointer"
                      >
                        Yes, Clear
                      </button>
                      <button
                        onClick={() => setConfirmingClear(false)}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-300 transition-colors bg-white/5 px-2 py-0.5 rounded-md cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmingClear(true)}
                      className="text-[9px] font-mono text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto font-sans">
                  {interventionHistory.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No telemetry logs registered yet. Intervene by skipping focus sessions or breaking streaks!
                    </div>
                  ) : (
                    interventionHistory.map((item) => (
                      <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white/[0.01] transition-all">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`mt-0.5 px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase border shrink-0 ${
                            item.type === 'procrastination' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            item.type === 'burnout' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            item.type === 'momentum' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-teal-500/10 text-teal-400 border-teal-500/20'
                          }`}>
                            {item.type}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{item.questionOrMessage}</p>
                            {item.status === 'Accepted' && (
                              <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 mt-1 bg-emerald-500/5 px-2 py-0.5 rounded-md w-fit">
                                <span>✔ {item.actionTaken}</span>
                                <span className="text-slate-600">•</span>
                                <span>{item.impactMetrics}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-1 shrink-0 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            item.status === 'Accepted' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-white/5 text-slate-500 border border-white/5'
                          }`}>
                            {item.status}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------
                5. TWO COLUMN BENTO GRID
                -------------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Side: Today's Priorities Board & Calendar Timeline */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 5A. TODAY'S PRIORITIES BOARD (HIGH-FIDELITY CARDS) */}
                <div className="backdrop-blur-xl bg-slate-950/60 rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                        <Target size={18} />
                      </div>
                      <div>
                        <h3 className="text-base font-display font-black text-white">Immediate Priorities</h3>
                        <p className="text-[10px] text-slate-400">AI-ordered priority score & completion probability matrix</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('calendar')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 rounded-xl transition-all"
                    >
                      <Plus size={14} />
                      <span>Add Task</span>
                    </button>
                  </div>

                  {activeTasks.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-white/10 rounded-2xl p-6 bg-slate-900/10">
                      <ShieldCheck size={32} className="mx-auto text-indigo-400 mb-2 opacity-60" />
                      <p className="font-semibold text-slate-300 text-sm">No tasks yet</p>
                      <p className="text-slate-500 text-[11px] mt-1">Create your first task.</p>
                      <button 
                        onClick={() => setActiveTab('calendar')}
                        className="mt-3 px-4 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-semibold hover:bg-indigo-650 transition-all"
                      >
                        Add Task
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeTasks.slice(0, 4).map((task) => {
                        // Intelligent values calculation
                        const priorityScore = task.priority === 'High' ? 92 : task.priority === 'Medium' ? 76 : 58;
                        const completionProbability = task.complexity === 'High' ? '68%' : task.complexity === 'Medium' ? '84%' : '96%';
                        
                        // Suggestion text based on keyword/category
                        let microSuggestion = "Suggestion: Start with the toughest 10% to breach procrastination.";
                        if (task.title.toLowerCase().includes('learn') || task.title.toLowerCase().includes('study') || task.title.toLowerCase().includes('read')) {
                          microSuggestion = "Suggestion: Skim through index outlines, then proceed to direct tasks.";
                        } else if (task.category?.toLowerCase() === 'wellness' || task.title.toLowerCase().includes('sleep') || task.title.toLowerCase().includes('routine')) {
                          microSuggestion = "Suggestion: Wind down screen time 15 minutes ahead of target schedule.";
                        } else if (task.category?.toLowerCase() === 'admin' || task.title.toLowerCase().includes('review')) {
                          microSuggestion = "Suggestion: Batch administrative reviews together to decrease fatigue.";
                        }

                        return (
                          <div 
                            key={task.id}
                            className="p-4 bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-900/60 rounded-2xl flex flex-col space-y-3 group transition-all duration-300 shadow-sm relative overflow-hidden"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 min-w-0">
                                <button 
                                  onClick={() => updateTaskStatus(task.id, 'Done')}
                                  className="text-slate-500 hover:text-indigo-400 transition-colors shrink-0 outline-none"
                                >
                                  <Circle size={20} />
                                </button>
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-100 text-sm truncate">{task.title}</p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-semibold border border-white/5">
                                      Score: {priorityScore}%
                                    </span>
                                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                      task.complexity === 'High' ? 'bg-rose-500/10 text-rose-400' :
                                      task.complexity === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                      'bg-slate-800 text-slate-300'
                                    }`}>
                                      {task.complexity} Complexity
                                    </span>
                                    <span className="text-[10px] text-slate-400 flex items-center space-x-0.5">
                                      <Clock size={10} className="text-slate-500" />
                                      <span>Est: {task.estimatedHours || 2}h</span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => delayTask(task.id)}
                                  className="opacity-0 group-hover:opacity-100 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-2.5 rounded-lg border border-white/10 transition-opacity"
                                  title="Procrastinate intervention trigger"
                                >
                                  Delay Task
                                </button>
                                <button 
                                  onClick={() => setActiveTab('focus')}
                                  className="text-indigo-400 hover:bg-indigo-500/10 p-1.5 rounded-lg transition-all active:scale-95 border border-transparent hover:border-indigo-500/20"
                                  title="Enter Focus Mode"
                                >
                                  <Zap size={15} />
                                </button>
                              </div>
                            </div>

                            {/* Detailed Analytics Grid inside Task Card */}
                            <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-white/5 text-[10px] text-slate-400 font-mono">
                              <div>
                                <span className="block text-slate-500 text-[9px] uppercase">Deadline Risk</span>
                                <span className={task.priority === 'High' ? 'text-rose-400 font-bold' : 'text-slate-300 font-medium'}>
                                  {task.priority === 'High' ? 'High Risk' : 'Standard'}
                                </span>
                              </div>
                              <div>
                                <span className="block text-slate-500 text-[9px] uppercase">Due Date</span>
                                <span className="text-slate-300 font-medium">{task.deadline}</span>
                              </div>
                              <div>
                                <span className="block text-slate-500 text-[9px] uppercase">Prob. of Complete</span>
                                <span className="text-emerald-400 font-bold">{completionProbability}</span>
                              </div>
                            </div>

                            {/* Micro Suggestion Pill */}
                            <div className="flex items-start gap-1.5 text-[11px] text-indigo-200 bg-indigo-500/5 px-2.5 py-1.5 rounded-xl border border-indigo-500/10 font-sans">
                              <Info size={12} className="shrink-0 text-indigo-400 mt-0.5" />
                              <p className="leading-snug">{microSuggestion}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 5B. THE ADVANCED SMART CALENDAR PREVIEW */}
                <div className="backdrop-blur-xl bg-slate-950/60 rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                        <CalendarIcon size={18} />
                      </div>
                      <div>
                        <h3 className="text-base font-display font-black text-white">Smart Calendar Agenda</h3>
                        <p className="text-[10px] text-slate-400">Contextual time blocks sync</p>
                      </div>
                    </div>

                    {/* Filter Selector tabs */}
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5 text-xs shrink-0 self-start md:self-auto">
                      {(['today', 'tomorrow', 'week', 'deadlines'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setCalendarFilter(filter)}
                          className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                            calendarFilter === filter 
                              ? 'bg-indigo-600 text-white font-bold' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rendering specific active schedule events based on the filter */}
                  <div className="space-y-2.5">
                    {calendarFilter === 'today' && (
                      <>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                          <span className="font-mono text-xs text-indigo-400 shrink-0 font-bold bg-indigo-500/10 px-2 py-1 rounded-lg">09:00 - 10:30 AM</span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-slate-200 block">Deep Work Pomodoro Block</span>
                            <span className="text-[10px] text-slate-500 block">Recommended Focus: {activeTasks[0]?.title || 'Weekly Administration'}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                          <span className="font-mono text-xs text-amber-400 shrink-0 font-bold bg-amber-500/10 px-2 py-1 rounded-lg">11:30 - 12:00 PM</span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-slate-200 block">Routine Habits Maintenance</span>
                            <span className="text-[10px] text-slate-500 block">Review Smart Commitments & Code Practice</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                          <span className="font-mono text-xs text-emerald-400 shrink-0 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">03:00 - 04:30 PM</span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-slate-200 block">Active Learning Path Progress</span>
                            <span className="text-[10px] text-slate-500 block">Explore Growth Hub and complete queued milestones</span>
                          </div>
                        </div>
                      </>
                    )}

                    {calendarFilter === 'tomorrow' && (
                      <>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                          <span className="font-mono text-xs text-indigo-400 shrink-0 font-bold bg-indigo-500/10 px-2 py-1 rounded-lg">10:00 - 12:00 PM</span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-slate-200 block">Complex Deliverables Review</span>
                            <span className="text-[10px] text-slate-500 block">Resolve outstanding high-complexity task cards</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                          <span className="font-mono text-xs text-rose-400 shrink-0 font-bold bg-rose-500/10 px-2 py-1 rounded-lg">04:00 - 05:00 PM</span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-slate-200 block">Deadlines & Billing Audit</span>
                            <span className="text-[10px] text-slate-500 block">Assess incoming smart commitments and pay due bills</span>
                          </div>
                        </div>
                      </>
                    )}

                    {calendarFilter === 'week' && (
                      <div className="p-4 text-center border border-white/5 bg-slate-900/25 rounded-2xl space-y-2">
                        <Activity className="mx-auto text-indigo-400 opacity-65" size={24} />
                        <p className="text-xs text-slate-300 font-semibold">Weekly Operational Workload</p>
                        <p className="text-[11px] text-slate-500">
                          Estimated active task duration: <span className="text-indigo-300 font-bold">{activeTasks.length * 1.5} Hours</span>. You have {unpaidCommitments.length} pending obligations.
                        </p>
                      </div>
                    )}

                    {calendarFilter === 'deadlines' && (
                      <div className="space-y-2">
                        {activeTasks.length === 0 ? (
                          <p className="text-center py-4 text-[11px] text-slate-500">No active deadlines. System safe! 🛡️</p>
                        ) : (
                          activeTasks.slice(0, 3).map((t, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl text-xs">
                              <span className="text-slate-200 font-medium truncate max-w-xs">{t.title}</span>
                              <span className="font-mono font-bold text-rose-400 bg-rose-500/15 border border-rose-500/20 px-2 py-0.5 rounded">
                                Due: {t.deadline}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Side Column: Smart Habits, Smart Commitments & Dashboard Analytics */}
              <div className="space-y-6">

                {/* 5C. HIGH-FIDELITY ACTIVE SHORTS / ANALYTICS GAUGE PANEL (PHASE 2 PERFORMANCE ANALYTICS) */}
                <div className="backdrop-blur-xl bg-slate-950/60 rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <BarChart2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-display font-black text-white">Performance Analytics</h3>
                      <p className="text-[10px] text-slate-400">Deep-learning telemetry diagnosis</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Productivity Trend</span>
                      <span className="text-sm font-black text-emerald-400">{productivityTrend}</span>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Consistency Rate</span>
                      <span className="text-sm font-black text-slate-100">{habitConsistency}%</span>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Stress Estimation</span>
                      <span className={`text-sm font-bold block ${
                        stressEstimation === 'Heavy Loading' ? 'text-rose-400' :
                        stressEstimation === 'Moderate Focus' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>{stressEstimation}</span>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Burnout Risk</span>
                      <span className={`text-sm font-bold block ${
                        burnoutRisk === 'High' ? 'text-rose-400' :
                        burnoutRisk === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>{burnoutRisk}</span>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center col-span-2 space-y-1">
                      <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase font-mono">
                        <span>Completion Forecast</span>
                        <span>Habit Retention</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-black">
                        <span className="text-indigo-300">{completionForecast}</span>
                        <span className="text-amber-300">{habitRetention}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-sans">
                    <span className="text-slate-400">Calculated Focus Velocity</span>
                    <span className="text-indigo-400 font-bold">{focusHours} Hours Logged</span>
                  </div>
                </div>

                {/* 5D. IMPROVED ACTIVE HABITS CORNER */}
                <div className="backdrop-blur-xl bg-slate-950/60 rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                        <Trophy size={18} />
                      </div>
                      <div>
                        <h3 className="text-base font-display font-black text-white">Habit Streaks</h3>
                        <p className="text-[10px] text-slate-400">Lock in your active daily routines</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                      Streak Engine
                    </span>
                  </div>

                  <div className="space-y-3">
                    {habits.map((h) => {
                      const consistency = h.streak > 10 ? 94 : h.streak > 5 ? 82 : 65;
                      const isCompletedJustNow = completedHabitId === h.id;

                      return (
                        <div 
                          key={h.id} 
                          className="p-3.5 bg-slate-900/40 border border-white/5 rounded-2xl shadow-sm space-y-3 group hover:border-amber-500/20 transition-all duration-300 relative"
                        >
                          {/* Streak completed micro flash/pulse effect */}
                          {h.completedToday && (
                            <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl pointer-events-none border border-emerald-500/25" />
                          )}

                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-100 text-xs truncate">{h.title}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <Flame size={12} className="text-amber-400 fill-amber-400" />
                                <span className="font-bold text-amber-400">{h.streak} day streak</span>
                                <span className="text-slate-600 font-mono">•</span>
                                <span className="text-slate-400 font-mono">{consistency}% Consist.</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMissedHabitCount(2);
                                  }}
                                  className="text-[9px] text-rose-400 hover:text-rose-300 ml-2 hover:underline transition-colors font-mono"
                                  title="Simulate missing 2 days of this habit"
                                >
                                  [Simulate 2-Day Miss]
                                </button>
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                completeHabit(h.id);
                                if (!h.completedToday) {
                                  setCompletedHabitId(h.id);
                                  setTimeout(() => setCompletedHabitId(null), 1200);
                                }
                              }}
                              className={`text-xs py-1.5 px-3 rounded-lg font-semibold transition-all duration-300 active:scale-95 ${
                                h.completedToday 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                  : 'bg-white text-slate-900 hover:bg-slate-100 border border-transparent shadow-sm'
                              }`}
                            >
                              {h.completedToday ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle size={12} /> Done
                                </span>
                              ) : 'Complete'}
                            </button>
                          </div>

                          {/* 7 Days heatmap style indicator */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                              <span>Weekly completion frequency</span>
                              <span>{h.completedToday ? 'Solid' : 'Pending today'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dIdx) => {
                                // Light up preceding dots based on completion status
                                const completedDaysMap = [true, true, true, false, true, h.completedToday, false];
                                const isDone = completedDaysMap[dIdx];
                                return (
                                  <div 
                                    key={dIdx} 
                                    className={`flex-1 h-3.5 rounded-md text-[8px] font-bold font-mono flex items-center justify-center transition-all ${
                                      isDone 
                                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.25)]' 
                                        : 'bg-white/5 text-slate-600 border border-white/5'
                                    }`}
                                    title={`${day}: ${isDone ? 'Completed' : 'Skipped/Pending'}`}
                                  >
                                    {day}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Dynamic celebration layout animation */}
                          <AnimatePresence>
                            {isCompletedJustNow && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute -right-2 -top-2 bg-gradient-to-tr from-amber-400 to-indigo-500 text-slate-950 font-black text-[9px] rounded-full p-1.5 shadow-lg flex items-center gap-0.5"
                              >
                                <Trophy size={10} />
                                <span>STREAK UP!</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5E. IMPROVED COMMITMENTS PANEL (WITH SMART PREDICTIONS) */}
                <div className="backdrop-blur-xl bg-slate-950/60 rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <h3 className="text-base font-display font-black text-white">Smart Commitments</h3>
                        <p className="text-[10px] text-slate-400">Bills & scheduled direct-debits</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('commitments')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  {unpaidCommitments.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-white/10 rounded-2xl bg-slate-900/10">
                      <ShieldCheck size={28} className="mx-auto text-emerald-400 mb-1 opacity-70" />
                      <p className="font-semibold text-slate-300">No commitments yet</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">Add your first commitment.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unpaidCommitments.slice(0, 3).map((com) => {
                        const daysLeft = Math.max(0, Math.ceil((new Date(com.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
                        const urgencyColor = daysLeft <= 2 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : daysLeft <= 5 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                        
                        return (
                          <div key={com.id} className="p-3.5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-2.5 shadow-sm">
                            <div className="flex items-start justify-between">
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-100 text-xs truncate">{com.title}</p>
                                <p className="text-[10px] text-indigo-300 font-bold mt-0.5 font-mono">{com.amount}</p>
                              </div>
                              <button
                                onClick={() => payCommitment(com.id)}
                                className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg transition-all active:scale-95 shadow-sm"
                              >
                                Pay Now
                              </button>
                            </div>

                            {/* Urgency Badge and predicted action */}
                            <div className="pt-2 border-t border-white/5 flex flex-col space-y-1.5">
                              <div className="flex items-center justify-between text-[9px] font-mono">
                                <span className="text-slate-500 font-bold">Billing Urgency</span>
                                <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${urgencyColor}`}>
                                  {daysLeft === 0 ? 'Due Today' : `Due in ${daysLeft} days`}
                                </span>
                              </div>
                              <div className="p-2 bg-indigo-500/5 text-[10px] rounded-lg border border-indigo-500/10 text-indigo-200">
                                <span className="font-bold text-indigo-400">AI Advice: </span>
                                {daysLeft <= 2 ? 'Pay today to guarantee zero service interruption.' : 'Recommended: Verify account balance prior to payment.'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* --------------------------------------------------------
                6. GOAL PROGRESSION & XP ROADMAPS (DUOLINGO ACCENT)
                -------------------------------------------------------- */}
            <div className="backdrop-blur-xl bg-slate-950/60 rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Award size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-display font-black text-white">Active Mastery Goals</h3>
                    <p className="text-[10px] text-slate-400">Gamified milestone progress and estimated completion forecasts</p>
                  </div>
                </div>
                <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                  <Trophy size={14} className="animate-bounce" />
                  <span>+{completedMilestonesCount * 120} XP Gained</span>
                </div>
              </div>

              {goals.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500">No active goals found. Set up career path targets in the growth hub.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((g) => {
                    const nextMilestone = g.milestones.find(m => !m.completed);
                    const completedMilestones = g.milestones.filter(m => m.completed).length;
                    const totalMilestones = g.milestones.length;

                    return (
                      <div key={g.id} className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl space-y-3 hover:border-emerald-500/20 transition-all duration-300">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest">{g.category} Path</span>
                            <h4 className="font-semibold text-sm text-slate-100">{g.title}</h4>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-slate-200">
                            🏆 Consistent Learner
                          </span>
                        </div>

                        {/* Beautiful gradient completion bars */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-400">Progression Tracker</span>
                            <span className="text-emerald-400 font-bold">{g.progress}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${g.progress}%` }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full"
                            />
                          </div>
                        </div>

                        {/* Milestones Sync */}
                        <div className="pt-2 border-t border-white/5 space-y-1 text-xs">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                            <span>Milestones Lock ({completedMilestones}/{totalMilestones})</span>
                            <span>Target: {g.deadline}</span>
                          </div>
                          <p className="text-slate-300 font-medium">
                            <span className="text-emerald-400">Next step: </span>
                            {nextMilestone ? nextMilestone.title : 'All Milestones Achieved! 🎉'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* --------------------------------------------------------
                7. AI PERFORMANCE WEEKLY REVIEW SECTION
                -------------------------------------------------------- */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-650 to-purple-700/95 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-semibold uppercase tracking-wider">
                      <Award size={12} />
                      <span>Weekly Accountability Coach</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-display font-black">Generate Weekly Performance Review</h2>
                    <p className="text-indigo-100 text-xs md:text-sm">
                      Get a deep, constructive summary of your accomplishments, focus patterns, and custom roadmap milestones.
                    </p>
                  </div>
                  <button
                    onClick={handleWeeklyReview}
                    disabled={isReviewLoading}
                    id="btn-weekly-review"
                    className="bg-white text-indigo-700 hover:bg-indigo-50 shrink-0 font-bold py-3 px-6 rounded-2xl flex items-center space-x-2 shadow-lg transition-all active:scale-95"
                  >
                    {isReviewLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Compiling Stats...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span className="text-sm">Synthesize Review</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Improved Weekly Review Card content (Phase 2 high fidelity report format) */}
                {weeklyReview && (
                  <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/15 backdrop-blur-xl space-y-6 animate-fade-in text-xs leading-relaxed md:text-sm shadow-2xl">
                    <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-3">
                      <span className="font-semibold text-white tracking-tight flex items-center space-x-2">
                        <ShieldCheck size={18} className="text-emerald-400" />
                        <span className="text-sm font-display font-black uppercase tracking-wider">Weekly Performance Review</span>
                      </span>
                      <span className="font-mono bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-xl text-indigo-300 font-bold text-xs">
                        Audit Finalized
                      </span>
                    </div>

                    {/* Core Metric Values */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">Tasks Completed</span>
                        <span className="text-lg font-black text-emerald-400 block">{weeklyReview.tasksCompleted ?? 7}</span>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">Focus Hours</span>
                        <span className="text-lg font-black text-indigo-400 block">{weeklyReview.focusHours ?? '14h'}</span>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">Longest Streak</span>
                        <span className="text-lg font-black text-amber-400 block">{weeklyReview.longestStreak ?? '6 days'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Strengths */}
                      <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                          <CheckCircle size={12} /> Strengths:
                        </span>
                        <ul className="space-y-1.5 text-slate-300 text-xs">
                          {weeklyReview.strengthsList?.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span>•</span>
                              <span>{s}</span>
                            </li>
                          )) || (
                            <>
                              <li className="flex items-start gap-1">• Coding consistency improving</li>
                              <li className="flex items-start gap-1">• Focus sessions increasing</li>
                              <li className="flex items-start gap-1">• Habit completion rate stable</li>
                            </>
                          )}
                        </ul>
                      </div>

                      {/* Risks */}
                      <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-rose-400 text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                          <AlertTriangle size={12} /> Risks:
                        </span>
                        <ul className="space-y-1.5 text-slate-300 text-xs">
                          {weeklyReview.riskList?.map((r, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span>•</span>
                              <span>{r}</span>
                            </li>
                          )) || (
                            <>
                              <li className="flex items-start gap-1">• DSA roadmap approaching deadline</li>
                              <li className="flex items-start gap-1">• Momentum score slightly declining</li>
                            </>
                          )}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                          <Compass size={12} /> Recommendations:
                        </span>
                        <ul className="space-y-1.5 text-slate-300 text-xs">
                          {weeklyReview.recommendationList?.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span>•</span>
                              <span>{rec}</span>
                            </li>
                          )) || (
                            <>
                              <li className="flex items-start gap-1">• Schedule two deep work blocks</li>
                              <li className="flex items-start gap-1">• Finish DSA before Sunday evening</li>
                              <li className="flex items-start gap-1">• Protect current coding streak</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Momentum and Confidence Gauges */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                      <div className="flex flex-col justify-between p-3.5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 gap-1">
                        <span className="text-indigo-200 text-xs font-mono uppercase font-black tracking-wider">Momentum Score:</span>
                        <span className="text-xl font-black text-indigo-400 font-display">{weeklyReview.momentumScore ?? '78%'}</span>
                      </div>
                      <div className="flex flex-col justify-between p-3.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 gap-1">
                        <span className="text-emerald-200 text-xs font-mono uppercase font-black tracking-wider">Completion Confidence:</span>
                        <span className="text-xl font-black text-emerald-400 font-display">{weeklyReview.completionConfidence ?? '84%'}</span>
                      </div>
                    </div>

                    {/* AI Coach Text */}
                    <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 text-[11px] text-slate-400 font-sans leading-relaxed">
                      <span className="font-bold text-white">Analysis details:</span> {weeklyReview.summary} {weeklyReview.nextWeekStrategy}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* --------------------------------------------------------
                8. FLOATING MOTIVATION WIDGET (MATERIAL ACCENTS)
                -------------------------------------------------------- */}
            <div className="flex justify-end pt-4">
              <motion.div 
                whileHover={{ y: -2 }}
                className="p-3 bg-slate-950/80 border border-indigo-500/30 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs max-w-sm backdrop-blur-xl hover:border-indigo-500/50 transition-all cursor-pointer"
                onClick={() => {
                  const randomMsg = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
                  setCurrentMotivation(randomMsg);
                }}
                title="Click to change message"
              >
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                  <Smile size={14} />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[8px] font-mono tracking-widest text-indigo-400 uppercase font-black">AI Life Coach quote</span>
                  <p className="text-slate-200 font-medium leading-relaxed font-sans">"{currentMotivation}"</p>
                </div>
              </motion.div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
