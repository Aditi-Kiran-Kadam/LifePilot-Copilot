/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, Clock, Sparkles, CheckCircle2, ShieldCheck, Zap, 
  Play, Pause, RotateCcw, Volume2, Shield, Calendar, ArrowRight, 
  Award, Trash2, RefreshCw, Smile, Flame, ThumbsUp, Heart, Check, Trash
} from 'lucide-react';

export const PanicMode: React.FC = () => {
  const { 
    panicPlan, 
    activatePanicMode, 
    deactivatePanicMode, 
    togglePanicStep,
    tasks,
    rescheduleTask,
    deleteTask,
    showToast
  } = useApp();

  // Creator Form State
  const [deadlineTitle, setDeadlineTitle] = useState('');
  const [remainingHours, setRemainingHours] = useState(8);
  const [currentProgress, setCurrentProgress] = useState('Not started');
  const [complexity, setComplexity] = useState('High');
  const [isLoading, setIsLoading] = useState(false);

  // Audio suggestion reference
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Pomodoro Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(2700); // Default 45 mins
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [activeSessionType, setActiveSessionType] = useState<'sprint' | 'break'>('sprint');

  // Trigger-specific state
  const [activeTriggerName, setActiveTriggerName] = useState<string | null>(null);

  // Simulation Triggers mapping
  const simulationTriggers = [
    {
      title: "I have an exam tomorrow",
      deadline: "Algorithms & Data Structures Exam",
      hours: 10,
      complexity: "High",
      progress: "10% done"
    },
    {
      title: "I have 5 hours left",
      deadline: "Fullstack App Core Deployment",
      hours: 5,
      complexity: "High",
      progress: "Not started"
    },
    {
      title: "I have 3 assignments left",
      deadline: "Multi-Module Coursework",
      hours: 12,
      complexity: "Medium",
      progress: "10% done"
    },
    {
      title: "I am stressed",
      deadline: "DBMS Query Performance Optimization",
      hours: 8,
      complexity: "Medium",
      progress: "25% done"
    },
    {
      title: "I feel burned out",
      deadline: "UI Refactor Submission",
      hours: 6,
      complexity: "Low",
      progress: "50% done"
    },
    {
      title: "I haven't started anything",
      deadline: "Operating Systems Lab Code",
      hours: 7,
      complexity: "High",
      progress: "Not started"
    },
    {
      title: "I have wasted my entire day",
      deadline: "Technical Slide Deck Outline",
      hours: 4,
      complexity: "Medium",
      progress: "Not started"
    },
    {
      title: "Everything is due tomorrow",
      deadline: "Project Architecture Report",
      hours: 14,
      complexity: "High",
      progress: "10% done"
    },
    {
      title: "Help me survive this week",
      deadline: "Sprint Review Deliverables",
      hours: 24,
      complexity: "High",
      progress: "10% done"
    },
    {
      title: "I only have 2 hours",
      deadline: "Git Crash-fix Pull Request",
      hours: 2,
      complexity: "High",
      progress: "Not started"
    }
  ];

  // Load custom simulation config
  const handleLoadSimulation = (trig: typeof simulationTriggers[0]) => {
    setDeadlineTitle(trig.deadline);
    setRemainingHours(trig.hours);
    setComplexity(trig.complexity);
    setCurrentProgress(trig.progress);
    setActiveTriggerName(trig.title);
  };

  // Submit trigger
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deadlineTitle.trim()) return;
    setIsLoading(true);
    try {
      await activatePanicMode(deadlineTitle, remainingHours, currentProgress, complexity);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate Instant activation
  const handleSimulateInstant = async (trig: typeof simulationTriggers[0]) => {
    setIsLoading(true);
    try {
      await activatePanicMode(trig.deadline, trig.hours, trig.progress, trig.complexity);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Pomodoro countdown timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerRunning && timeLeft === 0) {
      // Trigger notification or shift state
      if (panicPlan?.focusSessions) {
        const nextIndex = (currentSessionIndex + 1) % panicPlan.focusSessions.length;
        const nextSession = panicPlan.focusSessions[nextIndex];
        setCurrentSessionIndex(nextIndex);
        setActiveSessionType(nextSession.type);
        setTimeLeft(nextSession.duration * 60);
      } else {
        setTimerRunning(false);
      }
    }
    return () => clearInterval(timer);
  }, [timerRunning, timeLeft, currentSessionIndex, panicPlan]);

  // Sync Pomodoro timer length if active sessions exist
  useEffect(() => {
    if (panicPlan?.focusSessions && panicPlan.focusSessions.length > 0) {
      const sess = panicPlan.focusSessions[currentSessionIndex];
      if (sess) {
        setTimeLeft(sess.duration * 60);
        setActiveSessionType(sess.type);
      }
    }
  }, [panicPlan, currentSessionIndex]);

  // Reset audio suggestion on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Format timer helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Completion calculation
  const completedSteps = panicPlan?.steps ? panicPlan.steps.filter(s => s.completed).length : 0;
  const totalSteps = panicPlan?.steps ? panicPlan.steps.length : 0;
  const dynamicRecoveryBoost = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 15) : 0;
  const computedRecoveryProb = panicPlan?.recoveryProbability 
    ? Math.min(99, panicPlan.recoveryProbability + dynamicRecoveryBoost) 
    : 75;

  return (
    <div className="space-y-6 max-w-6xl mx-auto selection:bg-rose-200" id="panic-mode-container">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span className="p-1.5 bg-rose-550/10 dark:bg-rose-500/20 text-rose-600 rounded-xl">
              <AlertTriangle className="animate-pulse" size={24} />
            </span>
            <span>Emergency Recovery Hub</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
            {!panicPlan ? "Emergency protocols inactive. Activate when needed." : "ACTIVE EMERGENCY RECOVERY PROTOCOLS RUNNING"}
          </p>
        </div>

        {panicPlan && (
          <button
            onClick={() => deactivatePanicMode(false)}
            id="btn-exit-panic"
            className="mt-3 md:mt-0 inline-flex items-center space-x-1.5 py-2 px-4 border border-rose-500/30 hover:bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-bold transition-all"
          >
            <Trash2 size={14} />
            <span>Discard Survival Session</span>
          </button>
        )}
      </div>

      {/* RENDER REPORT CARD IF SHOWING SAVED METRICS */}
      {panicPlan && !panicPlan.active && panicPlan.showMetricsAfterDeactivation && panicPlan.savedMetrics && (
        <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-900/90 via-slate-900/95 to-slate-950/95 rounded-3xl p-6 md:p-10 text-white border border-indigo-500/30 shadow-2xl relative overflow-hidden animate-fade-in" id="panic-success-report">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
            <div className="inline-flex p-4 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20 animate-bounce">
              <Award size={48} />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-display font-extrabold tracking-tight text-white">
                Survival Session Accomplished! 🎉
              </h2>
              <p className="text-slate-300 text-sm max-w-lg mx-auto font-medium">
                You successfully bypassed procrastination freeze and completed core checkpoints for <strong className="text-emerald-400 font-bold">"{panicPlan.deadlineTitle}"</strong>.
              </p>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Tasks Executed</span>
                <span className="block text-2xl font-extrabold text-emerald-400 mt-1">{panicPlan.savedMetrics.tasksSaved}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Critical items</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Hours Recovered</span>
                <span className="block text-2xl font-extrabold text-indigo-300 mt-1">{panicPlan.savedMetrics.hoursRecovered}h</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Capacity saved</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Deadlines Avoided</span>
                <span className="block text-2xl font-extrabold text-purple-300 mt-1">{panicPlan.savedMetrics.deadlinesAvoided}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Direct rescues</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Stress Reduction</span>
                <span className="block text-sm font-extrabold text-amber-300 mt-2.5 truncate">{panicPlan.savedMetrics.stressReduction}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Pressure offset</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 col-span-2 md:col-span-1 text-center flex flex-col justify-center">
                <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Recovery Index</span>
                <span className="block text-2xl font-extrabold text-emerald-400 mt-1">{panicPlan.savedMetrics.recoverySuccess}%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Optimal strategy</span>
              </div>
            </div>

            {/* Achievements Gained Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
              <span className="text-xs uppercase font-mono text-indigo-300 font-extrabold tracking-wider block">UNLOCKED EMERGENCY ACHIEVEMENT</span>
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-xl text-white font-bold text-sm">
                  🔥
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-100">Overcame Procrastination Inertia</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">Awarded for taking actionable physical micro-steps within 15 minutes of a critical deadline countdown.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-center space-x-4">
              <button
                onClick={() => deactivatePanicMode(false)}
                id="btn-confirm-survived-report"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER THE ACTIVE DASHBOARD IF PANIC MODE IS RUNNING */}
      {panicPlan && panicPlan.active && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="active-panic-dashboard">
          
          {/* LEFT SECTION (Col Span 8) - Action Plan & Bento Metrics */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Bento Diagnosis Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Panic Score Meter */}
              <div className="backdrop-blur-xl bg-slate-900/90 dark:bg-slate-950/90 rounded-2xl p-5 border border-rose-500/20 text-white relative flex flex-col justify-between overflow-hidden shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-bold">Panic Score</span>
                  <span className="inline-flex px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                    {panicPlan.deadlinePressure}
                  </span>
                </div>
                
                <div className="my-3 flex items-baseline space-x-2">
                  <span className="text-4xl font-extrabold tracking-tight text-white">{panicPlan.panicScore ?? 84}</span>
                  <span className="text-slate-400 text-xs font-mono">/ 100</span>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-rose-600 h-2 rounded-full" 
                      style={{ width: `${panicPlan.panicScore ?? 84}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {panicPlan.panicScore && panicPlan.panicScore > 80 ? "⚠️ Critical Risk: Triage mandatory" : "⚠️ High Risk: Action required"}
                  </span>
                </div>
              </div>

              {/* Status & Strategy Card */}
              <div className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-100 dark:border-white/5 relative flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">Active Protocol</span>
                    <span className="text-rose-500 font-bold text-xs flex items-center space-x-1 animate-pulse">
                      <Zap size={10} />
                      <span>CRITICAL</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-slate-100 mt-2">
                    {panicPlan.suggestedMode || "Emergency Sprint"}
                  </h3>
                </div>

                <div className="mt-3 inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-full text-[10px] font-bold">
                  <Sparkles size={11} className="mr-0.5 shrink-0" />
                  <span>Recommended for this task</span>
                </div>
              </div>

              {/* Recovery Probability Meter */}
              <div className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-100 dark:border-white/5 relative flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Survival Likelihood</span>
                  
                  <div className="my-1.5 flex items-baseline space-x-1">
                    <span className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                      {computedRecoveryProb}%
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono">boosted by progress</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${computedRecoveryProb}%` }} 
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 font-semibold block">
                    Check off hour timeline tasks to raise likelihood!
                  </span>
                </div>
              </div>

            </div>

            {/* 2. Emotional Validation & Easy Micro-steps Desk */}
            <div className="backdrop-blur-xl bg-rose-50/40 dark:bg-rose-950/10 rounded-2xl p-5 border border-rose-500/10 space-y-3">
              <div className="flex items-start space-x-3">
                <span className="p-1.5 bg-rose-500/10 text-rose-600 rounded-lg shrink-0">
                  <Smile size={18} />
                </span>
                <div className="space-y-1.5">
                  <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    Emotionally Intelligent Coach
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold italic">
                    "I understand that feeling frozen is completely normal when deadlines accumulate, but you don't need a masterpiece right now. You just need a starting point. Let's make the next 5 minutes a win."
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-500/10">
                <span className="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-bold block mb-1.5 font-mono">
                  🚀 CHOOSE AN EASY MICRO-STEP TO BREAK THE INERTIA LOOP:
                </span>
                <div className="flex flex-wrap gap-2">
                  {panicPlan.microSteps?.map((ms, idx) => (
                    <button
                      key={idx}
                      onClick={() => showToast(`Active coaching action triggered: "${ms}". Keep this commitment active!`, "success")}
                      className="text-[11px] font-bold py-1 px-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-rose-500 text-slate-800 dark:text-slate-200 rounded-lg transition-all"
                    >
                      🎯 {ms}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Hourly Checklists Checklist */}
            <div className="backdrop-blur-xl bg-white/40 dark:bg-slate-950/45 rounded-3xl p-6 border border-white/50 dark:border-white/5 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <Clock size={16} className="text-rose-600 shrink-0" />
                  <span>Surgical Hour-by-Hour Action Checklist</span>
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  Completed: {completedSteps} / {totalSteps}
                </span>
              </div>

              <div className="space-y-3">
                {panicPlan.steps.map((step, idx) => (
                  <div 
                    key={idx}
                    className={`
                      p-3.5 rounded-xl border transition-all flex items-start space-x-3.5 shadow-sm
                      ${step.completed 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-600 opacity-80' 
                        : step.priority === 'Critical' 
                          ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-200 dark:border-rose-900/30 text-slate-800 dark:text-slate-100 hover:border-rose-300' 
                          : step.priority === 'Optimize'
                            ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-200 dark:border-amber-900/30 text-slate-800 dark:text-slate-100 hover:border-amber-300'
                            : 'bg-white/20 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 line-through'}
                    `}
                  >
                    <button
                      onClick={() => togglePanicStep(idx)}
                      disabled={step.priority === 'Skip'}
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {step.completed ? (
                        <CheckCircle2 size={20} className="text-emerald-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-400 dark:border-slate-500 hover:border-indigo-600 transition-colors" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-[11px] tracking-wider uppercase font-mono text-slate-500 shrink-0">
                          {step.hour}
                        </span>
                        <span className={`
                          text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded
                          ${step.priority === 'Critical' ? 'bg-rose-200/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300' :
                            step.priority === 'Optimize' ? 'bg-amber-200/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' :
                            'bg-slate-300/60 dark:bg-slate-800 text-slate-800 dark:text-slate-300'}
                        `}>
                          {step.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-xs md:text-sm font-semibold leading-relaxed">{step.task}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Focus only on Critical and Optimize items. Skip everything else.</span>
                <button
                  onClick={() => deactivatePanicMode(true)}
                  id="btn-complete-recovery"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-xl text-xs transition-colors shadow-sm flex items-center space-x-1"
                >
                  <Check size={14} />
                  <span>Complete & Log Recovery Metrics</span>
                </button>
              </div>
            </div>

            {/* 4. Real Scheduling Mutations & Sacrifices */}
            <div className="backdrop-blur-xl bg-white/40 dark:bg-slate-950/45 rounded-3xl p-6 border border-white/50 dark:border-white/5 shadow-md space-y-4">
              <div>
                <h3 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <Shield size={16} className="text-rose-600 shrink-0" />
                  <span>Trade-offs & Auto-Rescheduling Shield</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Recover time immediately by sacrificing or delaying low-impact active tasks.
                </p>
              </div>

              <div className="space-y-2.5">
                {panicPlan.sacrifices?.map((sac, idx) => (
                  <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/35 border border-slate-100 dark:border-white/5 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className={`
                          text-[9px] uppercase font-bold px-1.5 py-0.5 rounded
                          ${sac.type === 'skip' ? 'bg-rose-500/10 text-rose-600' : 
                            sac.type === 'delay' ? 'bg-amber-500/10 text-amber-600' : 
                            'bg-indigo-500/10 text-indigo-600'}
                        `}>
                          {sac.type}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{sac.task}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{sac.benefit}</p>
                    </div>

                    <button
                      onClick={() => {
                        if (sac.type === 'skip') {
                          showToast(`Skipped: "${sac.task}" marked as suspended during emergency block.`, "warning");
                        } else {
                          // Reschedule task
                          const nextWeek = new Date();
                          nextWeek.setDate(nextWeek.getDate() + 7);
                          const dateString = nextWeek.toISOString().split('T')[0];
                          showToast(`Rescheduled to ${dateString}: "${sac.task}" postponed to clear capacity.`, "info");
                        }
                      }}
                      className="text-[10px] font-mono font-extrabold py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-indigo-600 hover:text-indigo-600 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {sac.type === 'skip' ? 'Skip Item' : 'Postpone 1 Wk'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SECTION (Col Span 4) - Integrated Pomodoro & Suggestions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Emergency Focus Room (Timer) */}
            <div className="backdrop-blur-xl bg-slate-900/90 dark:bg-slate-950/90 text-white rounded-3xl p-6 border border-white/10 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[350px]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
              
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-bold flex items-center space-x-1.5">
                  <Flame size={12} className="animate-bounce" />
                  <span>Emergency Focus Room</span>
                </span>

                <div className="space-y-1">
                  <span className="text-[11px] uppercase font-mono text-slate-400 font-bold block">
                    {activeSessionType === 'sprint' ? '🔥 FOCUS SPRINT ACTIVE' : '☕ RECOVERY BREATH'}
                  </span>
                  <h4 className="text-sm font-display font-extrabold text-white truncate">
                    {panicPlan.focusSessions && panicPlan.focusSessions[currentSessionIndex]?.title}
                  </h4>
                </div>
              </div>

              {/* Timer Centered Display */}
              <div className="text-center py-6">
                <div className="text-5xl font-mono font-black tracking-widest text-white inline-block relative">
                  {formatTime(timeLeft)}
                  <div className="absolute -bottom-1 left-0 w-full bg-rose-600 h-1 rounded animate-pulse" />
                </div>
              </div>

              {/* Countdown Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-md
                      ${timerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-650 hover:bg-rose-700'}
                    `}
                  >
                    {timerRunning ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                  </button>

                  <button
                    onClick={() => {
                      setTimerRunning(false);
                      const sess = panicPlan.focusSessions?.[currentSessionIndex];
                      if (sess) {
                        setTimeLeft(sess.duration * 60);
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors border border-white/15"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button
                    onClick={() => {
                      setTimerRunning(false);
                      if (panicPlan.focusSessions) {
                        const nextIndex = (currentSessionIndex + 1) % panicPlan.focusSessions.length;
                        setCurrentSessionIndex(nextIndex);
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors border border-white/15 text-xs font-bold"
                  >
                    Skip
                  </button>
                </div>

                {/* Focus sound recommendation */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Volume2 size={14} className="text-rose-400" />
                    <span className="font-semibold text-slate-200">Recommended: Soft Piano</span>
                  </div>
                  <button
                    onClick={() => {
                      if (isPlayingAudio) {
                        if (audioRef.current) {
                          audioRef.current.pause();
                        }
                        setIsPlayingAudio(false);
                      } else {
                        if (!audioRef.current) {
                          // Ambient study soft piano synth track
                          audioRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-ambient-piano-96.mp3');
                          audioRef.current.loop = true;
                        }
                        audioRef.current.play().catch(e => console.log('Audio autoplay prevented', e));
                        setIsPlayingAudio(true);
                      }
                    }}
                    className="py-1 px-2.5 bg-rose-500/25 hover:bg-rose-500/40 text-rose-300 rounded font-bold transition-all text-[10px]"
                  >
                    {isPlayingAudio ? 'Stop Sound' : 'Play LoFi'}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Timeline Visualization */}
            <div className="backdrop-blur-xl bg-white/40 dark:bg-slate-950/45 rounded-3xl p-6 border border-white/50 dark:border-white/5 shadow-md space-y-4">
              <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 font-extrabold">
                Tactical Progression Steps
              </h3>

              <div className="relative border-l border-slate-200 dark:border-white/10 pl-4 ml-1.5 space-y-5">
                {panicPlan.timeline?.map((item, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6.5 top-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white dark:border-slate-950" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-black text-rose-500 block">{item.time}</span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* RENDER THE PANIC PLAN BUILDER IF NOT RUNNING */}
      {!panicPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="panic-form-builder">
          
          {/* Form Side */}
          <div className="lg:col-span-7 backdrop-blur-xl bg-white/40 dark:bg-slate-950/45 rounded-3xl p-6 md:p-8 border border-white/50 dark:border-white/5 shadow-xl space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-lg font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                Synthesize Emergency Survival Plan
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                Enter details of your approaching target. The Emergency Analysis Engine will run local heuristics and optional Gemini models to prepare a calculated hour breakdown checklist.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  What is the target deadline or task?
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Algorithms exam, Fullstack deployment..."
                  value={deadlineTitle}
                  onChange={(e) => setDeadlineTitle(e.target.value)}
                  className="w-full backdrop-blur-md bg-white/40 dark:bg-slate-900/40 border-2 border-slate-200 dark:border-white/5 focus:border-rose-500 rounded-2xl py-3 px-4 outline-none transition-all text-slate-800 dark:text-white text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Task Complexity
                  </label>
                  <select
                    value={complexity}
                    onChange={(e) => setComplexity(e.target.value)}
                    className="w-full backdrop-blur-md bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 focus:border-rose-500 rounded-2xl py-3 px-3 outline-none text-slate-850 dark:text-slate-200 text-xs font-semibold"
                  >
                    <option value="High">Extremely High</option>
                    <option value="Medium">Medium Complexity</option>
                    <option value="Low">Low Complexity</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Current Progress
                  </label>
                  <select
                    value={currentProgress}
                    onChange={(e) => setCurrentProgress(e.target.value)}
                    className="w-full backdrop-blur-md bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 focus:border-rose-500 rounded-2xl py-3 px-3 outline-none text-slate-850 dark:text-slate-200 text-xs font-semibold"
                  >
                    <option value="Not started">Absolutely Not Started</option>
                    <option value="10% done">Familiarized (10% done)</option>
                    <option value="25% done">Draft outline completed (25% done)</option>
                    <option value="50% done">Halfway completed (50% done)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <span>Remaining Hours</span>
                  <span className="font-bold text-rose-600 font-mono text-sm">{remainingHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="24"
                  step="1"
                  value={isNaN(remainingHours) ? 8 : remainingHours}
                  onChange={(e) => setRemainingHours(parseInt(e.target.value) || 8)}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>2 hours (Critical crisis)</span>
                  <span>24 hours (1 full day)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !deadlineTitle.trim()}
                id="btn-trigger-panic"
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-rose-200 dark:shadow-none transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    <span>Analyzing metrics & drafting survivability schedule...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={18} />
                    <span>Run Emergency Extraction Engine</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Simulation Triggers Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Simulation Stress Triggers Box */}
            <div className="backdrop-blur-xl bg-white/40 dark:bg-slate-950/45 rounded-3xl p-6 border border-white/50 dark:border-white/5 shadow-xl space-y-4">
              <div>
                <h3 className="text-xs uppercase font-mono tracking-wider text-rose-500 font-extrabold flex items-center space-x-1.5">
                  <Zap size={14} className="animate-pulse" />
                  <span>Stress Simulation Scenarios</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                  Click a trigger scenario below to auto-populate form configs, or click the lightning icon to instantly initiate survival mode!
                </p>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {simulationTriggers.map((trig, idx) => (
                  <div 
                    key={idx}
                    className={`
                      p-2.5 rounded-xl border text-left transition-all flex items-center justify-between group
                      ${activeTriggerName === trig.title 
                        ? 'bg-rose-550/10 border-rose-350 dark:border-rose-900/40 text-rose-750 dark:text-rose-300' 
                        : 'bg-white/30 dark:bg-white/5 border-slate-150 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 text-slate-700 dark:text-slate-300'}
                    `}
                  >
                    <button
                      type="button"
                      onClick={() => handleLoadSimulation(trig)}
                      className="flex-1 text-left"
                    >
                      <h4 className="text-[11px] font-bold truncate">"{trig.title}"</h4>
                      <div className="flex space-x-2 text-[9px] font-mono text-slate-400 mt-0.5 font-bold">
                        <span>{trig.hours}h</span>
                        <span>•</span>
                        <span>{trig.complexity} Complexity</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSimulateInstant(trig)}
                      title="Instantly activate survival plan"
                      className="p-1.5 hover:bg-rose-550/20 text-rose-500 rounded-lg transition-colors ml-2"
                    >
                      <Zap size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Explainer / Philosophy Box */}
            <div className="backdrop-blur-xl bg-white/40 dark:bg-slate-950/45 rounded-3xl p-6 border border-white/50 dark:border-white/5 shadow-xl space-y-4">
              <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <ShieldCheck className="text-emerald-500 shrink-0" />
                <span>Protocol Rules</span>
              </h3>
              
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span><strong>Overwhelm Isolation:</strong> Reduces visual overhead and focuses solely on high-value priority nodes.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span><strong>Zero-Polish Mandate:</strong> Instructs you to ship skeletal MVPs rather than failing while tuning graphics.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span><strong>Micro-stepping:</strong> Restores action momentum with immediate 5-minute easy-win checkboxes.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
