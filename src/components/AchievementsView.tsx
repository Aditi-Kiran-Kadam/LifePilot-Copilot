import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductivityArcade } from './ProductivityArcade';
import { 
  Flame, Trophy, CheckCircle, Timer, GraduationCap, 
  Heart, CreditCard, Award, Sparkles, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AchievementsView: React.FC = () => {
  const { gamification, statistics } = useApp();
  const [subTab, setSubTab] = useState<'gamification' | 'stats' | 'arcade'>('gamification');

  return (
    <div className="space-y-6 max-w-5xl mx-auto selection:bg-indigo-500/20 pb-16">
      {/* Page Title & Sub-navigation bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Trophy className="text-indigo-650 dark:text-indigo-400" size={24} />
            <span>Achievements Hub</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
            Track your cognitive skill progression, complete focus milestones, and play productivity arcade games.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex flex-wrap gap-1 bg-slate-100/80 dark:bg-slate-900/40 p-1 rounded-2xl border border-slate-200/50 dark:border-white/5">
          <button
            onClick={() => setSubTab('gamification')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${subTab === 'gamification' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            🏆 Gamification & Badges
          </button>
          <button
            onClick={() => setSubTab('stats')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${subTab === 'stats' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            📊 Statistics Index
          </button>
          <button
            onClick={() => setSubTab('arcade')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${subTab === 'arcade' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            🕹️ LifePilot Arcade
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: Gamification and Badges */}
        {subTab === 'gamification' && (
          <motion.div
            key="gamification"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Gamification Level Hero */}
            <div className="bg-gradient-to-tr from-indigo-900/80 to-purple-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-white text-3xl">
                  🏆
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">Focus Level & Cognitive Streak</h3>
                  <p className="text-xs text-indigo-200">You gain XP by completing focus sessions, habits, commitments, and goals.</p>
                </div>
              </div>

              {/* Progress visual */}
              <div className="flex-1 max-w-md w-full space-y-2">
                <div className="flex justify-between text-xs font-bold text-indigo-200">
                  <span>Level {gamification.level}</span>
                  <span>{gamification.xp} / {gamification.level * 100} XP</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-500"
                    style={{ width: `${(gamification.xp / (gamification.level * 100)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-indigo-300/80 font-mono">
                  <span>STREAK: {gamification.streak} days</span>
                  <span>Need {(gamification.level * 100) - gamification.xp} XP to level up</span>
                </div>
              </div>
            </div>

            {/* Badges and achievements grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Badges */}
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-4">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <Flame className="text-amber-500" size={16} />
                    <span>Unlocked Badges</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Represents major milestones achieved on LifePilot.</p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {gamification.badges.map((b, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 rounded-2xl flex items-center space-x-2 text-xs font-semibold shadow-sm"
                    >
                      <span>🏅</span>
                      <span>{b}</span>
                    </div>
                  ))}
                  {gamification.badges.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No badges unlocked yet. Build a habit streak to start!</p>
                  )}
                </div>
              </div>

              {/* Achievements Tracker */}
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-4">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <Trophy className="text-indigo-500" size={16} />
                    <span>Accomplishment Milestones</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Standard productivity metrics benchmarks.</p>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {gamification.achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-colors ${ach.unlocked ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-slate-100/50 dark:bg-slate-950/20 border-slate-100 dark:border-white/5 opacity-60'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${ach.unlocked ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                          {ach.unlocked ? <Trophy size={14} /> : <X size={14} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{ach.title}</p>
                          <p className="text-[10px] text-slate-400">{ach.description}</p>
                        </div>
                      </div>
                      {ach.unlocked ? (
                        <span className="text-[10px] font-mono text-indigo-500 font-semibold uppercase">{ach.unlockedAt || 'unlocked'}</span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 uppercase">locked</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: Core statistics index */}
        {subTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Tasks Accomplished', value: statistics.tasksCompleted, desc: 'Total tasks set to Done', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Focused Hours', value: `${statistics.hoursFocused} h`, desc: 'Total focus session hours completed', icon: Timer, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                { label: 'Master Lessons Taken', value: statistics.lessonsWatched, desc: 'Lessons finished inside Growth Hub', icon: GraduationCap, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                { label: 'Habits Maintained', value: statistics.habitsMaintained, desc: 'Completed checks of active habits', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                { label: 'Commitments Paid', value: statistics.commitmentsPaid, desc: 'Met smart financial commitments', icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { label: 'Goals Achieved', value: statistics.goalsAchieved, desc: 'Goals reaching 100% progress mark', icon: Trophy, color: 'text-indigo-400', bg: 'bg-indigo-400/10' }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/50 dark:border-white/5 shadow-xl flex items-start space-x-4"
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">{stat.label}</p>
                      <p className="text-xl font-display font-extrabold text-slate-800 dark:text-slate-100 mt-1">{stat.value}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{stat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Performance reflection banner */}
            <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 shadow-xl flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xl shrink-0">
                  📈
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">Active Velocity Rate</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Your cognitive work velocity is pacing at high productivity ratios.</p>
                </div>
              </div>
              <span className="text-base font-mono font-bold text-indigo-600 bg-indigo-500/10 px-3 py-1.5 rounded-xl">94% Vel.</span>
            </div>
          </motion.div>
        )}

        {/* TAB 3: Productivity Arcade Games */}
        {subTab === 'arcade' && (
          <motion.div
            key="arcade"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full"
          >
            <ProductivityArcade />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
