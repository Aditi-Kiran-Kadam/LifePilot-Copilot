import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ThemeSettingsPanel } from './ThemeSettingsPanel';
import { 
  Settings, Brain, Award, ShieldAlert, Sparkles, RefreshCw, 
  Bell, Volume2, Shield, Activity, Zap, Check, Trash2, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SettingsView: React.FC = () => {
  const { 
    profile, settings, updateSettings, personaProfile, generatePersonaInsights, 
    updateProfile, resetOnboarding, showToast, weeklyCelebrationOpen, setWeeklyCelebrationOpen
  } = useApp();

  const [subTab, setSubTab] = useState<'profile' | 'theme' | 'weekly'>('profile');
  const [confirmReset, setConfirmReset] = useState(false);

  // Parser helpers
  const parseBioMajor = (bio: string) => {
    if (!bio) return "Computer Science";
    if (bio.includes("Majoring in")) {
      const parts = bio.split("Majoring in ");
      if (parts[1]) {
        return parts[1].split(" (")[0] || "Computer Science";
      }
    }
    return "Computer Science";
  };

  const parseBioSemester = (bio: string) => {
    if (!bio) return "Third Year";
    if (bio.includes(" (")) {
      const parts = bio.split(" (");
      if (parts[1]) {
        return parts[1].split(")")[0] || "Third Year";
      }
    }
    return "Third Year";
  };

  const [formName, setFormName] = useState(profile?.name || 'Aditi Kadam');
  const [formDepartment, setFormDepartment] = useState(() => parseBioMajor(profile?.bio || ''));
  const [formSemester, setFormSemester] = useState(() => parseBioSemester(profile?.bio || ''));
  const [formAvatar, setFormAvatar] = useState(() => {
    const saved = localStorage.getItem('lifepilot_user') || localStorage.getItem('lifepilotUser');
    if (saved) {
      try {
        return JSON.parse(saved).avatar || '🎓';
      } catch {}
    }
    return '🎓';
  });

  // Persona Factors Form state (11 intelligent tracks)
  const [formRole, setFormRole] = useState(profile?.role || 'Developer');
  const [formInterests, setFormInterests] = useState(profile?.interests.join(', ') || 'Technology, System Design, Automation');
  const [formSkills, setFormSkills] = useState(profile?.recommendedSkills.join(', ') || 'TypeScript, UI Design, Problem Solving');
  const [formGoals, setFormGoals] = useState(profile?.coreGoals.join(', ') || 'Build automated micro-apps, maintain consistency');
  const [formLearning, setFormLearning] = useState('Hands-On, Interactive, Visual');
  const [formFocus, setFormFocus] = useState('90-minute blocks, morning peak');
  const [formEnergy, setFormEnergy] = useState('Morning Peak, Afternoon Dip');
  const [formStress, setFormStress] = useState('Deadline urgency, Context switching fatigue');
  const [formHabits, setFormHabits] = useState('Hydration, Pomodoro breaks, Morning journaling');
  const [formProductivity, setFormProductivity] = useState('Systems Thinker');
  const [formCareer, setFormCareer] = useState(profile?.bio || 'Automation Architect & Full-Stack Engineer');

  const [isSyncing, setIsSyncing] = useState(false);

  if (!profile) return null;

  const handleSyncPersona = async () => {
    setIsSyncing(true);
    try {
      // 1. Update standard profile properties
      updateProfile({
        name: formName,
        role: formRole as any,
        bio: `Majoring in ${formDepartment} (${formSemester}). Career goal: ${formCareer}.`
      });

      // 2. Sync neural user storage
      const savedNu = localStorage.getItem('lifepilot_user') || localStorage.getItem('lifepilotUser');
      if (savedNu) {
        try {
          const parsed = JSON.parse(savedNu);
          const updated = {
            ...parsed,
            name: formName,
            role: formRole,
            department: formDepartment,
            semester: formSemester,
            careerGoal: formCareer,
            goal: formCareer,
            avatar: formAvatar
          };
          localStorage.setItem('lifepilot_user', JSON.stringify(updated));
          localStorage.setItem('lifepilotUser', JSON.stringify(updated));
        } catch {}
      }

      // 3. Generate persona insights
      await generatePersonaInsights({
        role: formRole,
        interests: formInterests.split(',').map(s => s.trim()).filter(Boolean),
        skills: formSkills.split(',').map(s => s.trim()).filter(Boolean),
        goals: formGoals.split(',').map(s => s.trim()).filter(Boolean),
        learningPreferences: formLearning.split(',').map(s => s.trim()).filter(Boolean),
        focusPatterns: formFocus.split(',').map(s => s.trim()).filter(Boolean),
        energyPatterns: formEnergy.split(',').map(s => s.trim()).filter(Boolean),
        stressTrends: formStress.split(',').map(s => s.trim()).filter(Boolean),
        habits: formHabits.split(',').map(s => s.trim()).filter(Boolean),
        productivityStyle: formProductivity,
        careerAspirations: formCareer
      });
      showToast('AI Cognitive Persona synchronized successfully!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Synchronization failed. Please check network.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const getPersonalityQuote = () => {
    switch (settings.aiPersonality) {
      case 'Mentor':
        return "True mastery is a series of deliberate daily victories. Let's design your system today.";
      case 'Coach':
        return "Focus is a muscle. Push the boundary today, keep your streak alive, and build momentum!";
      case 'Friend':
        return "Don't stress over perfect days. Just do your best, take a break, and stay healthy!";
      case 'Professional Advisor':
        return "Let's optimize your focus efficiency indexes and prevent unnecessary context switching.";
      case 'Minimalist':
        return "Simplicity is clarity. Strip away the noise and focus on one single task.";
      case 'Motivator':
        return "You are fully capable of achieving remarkable goals! Fuel your drive and start now!";
      case 'Teacher':
        return "Each obstacle is a master lesson in focus mechanics. Analyze, learn, and grow.";
      default:
        return "LifePilot is here to coordinate your cognitive resources and streamline productivity.";
    }
  };

  const handleResetClick = () => {
    if (confirmReset) {
      resetOnboarding();
      showToast('LifePilot Copilot factory reset complete.', 'success');
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000); // Reset confirmation state after 5s
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto selection:bg-indigo-500/20 pb-16">
      {/* Page Title & Sub-navigation bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Settings className="text-indigo-600 dark:text-indigo-400" size={24} />
            <span>Settings Hub</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
            Configure system themes, personalize your cognitive profile, and customize notifications.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex flex-wrap gap-1 bg-slate-100/80 dark:bg-slate-900/40 p-1 rounded-2xl border border-slate-200/50 dark:border-white/5">
          <button
            onClick={() => setSubTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${subTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            🧠 Persona & Insights
          </button>
          <button
            onClick={() => setSubTab('theme')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${subTab === 'theme' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            🎨 Theme & Colors
          </button>
          <button
            onClick={() => setSubTab('weekly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${subTab === 'weekly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            🔔 AI Coach Settings
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: AI Persona and Cognitive Profile */}
        {subTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Col: The Active Persona Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-display font-bold text-white text-3xl shadow-xl shadow-indigo-500/20">
                    {formAvatar || profile.name[0]}
                  </div>
                </div>

                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-snug">{profile.name}</h2>
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold tracking-wide mt-1">
                    <Sparkles size={12} />
                    <span>{personaProfile.dynamicPersona}</span>
                  </span>
                </div>

                <div className="w-full border-t border-slate-100 dark:border-white/5 pt-4 text-left space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">Identity Profile</span>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    {personaProfile.currentIdentity}
                  </p>
                </div>

                <div className="w-full border-t border-slate-100 dark:border-white/5 pt-4 text-left space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">Productivity Archetype</span>
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                    <Brain size={14} />
                    <span>{personaProfile.productivityArchetype}</span>
                  </div>
                </div>
              </div>

              {/* Persona strengths card */}
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center space-x-1.5">
                  <Award size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Strengths & Traits</span>
                </span>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {personaProfile.strengths.map((s, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-indigo-500 shrink-0 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Col: Intelligent Tracks customizer Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                    <Brain className="text-indigo-500" size={20} />
                    <span>Intelligent Tracks Customizer</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure your cognitive profile settings. AI will rebuild a dynamic persona archetype based on these 11 inputs.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Identity Row */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Avatar / Symbol</label>
                    <select
                      value={formAvatar}
                      onChange={(e) => setFormAvatar(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                    >
                      {['🎓', '💻', '🚀', '🧠', '⚡', '🤖', '🎨', '🔥', '📚', '🎯', '🌟', '🛡️'].map((em) => (
                        <option key={em} value={em} className="bg-white dark:bg-slate-900">{em}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Department / Major</label>
                    <input
                      type="text"
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                      placeholder="e.g., Computer Science, Bioengineering"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Academic Semester</label>
                    <input
                      type="text"
                      value={formSemester}
                      onChange={(e) => setFormSemester(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                      placeholder="e.g., Third Year, 5th Semester"
                    />
                  </div>

                  {/* Row 1 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Persona Role</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                    >
                      {['Student', 'Developer', 'Researcher', 'Founder', 'Freelancer', 'Designer', 'Creator', 'Professional', 'Entrepreneur', 'Custom Persona'].map((r) => (
                        <option key={r} value={r} className="bg-white dark:bg-slate-900">{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Career Aspirations</label>
                    <input
                      type="text"
                      value={formCareer}
                      onChange={(e) => setFormCareer(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Key Interests</label>
                    <input
                      type="text"
                      value={formInterests}
                      onChange={(e) => setFormInterests(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                      placeholder="Comma separated"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Core Skills</label>
                    <input
                      type="text"
                      value={formSkills}
                      onChange={(e) => setFormSkills(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                      placeholder="Comma separated"
                    />
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cognitive Goals</label>
                    <input
                      type="text"
                      value={formGoals}
                      onChange={(e) => setFormGoals(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Learning Preferences</label>
                    <input
                      type="text"
                      value={formLearning}
                      onChange={(e) => setFormLearning(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Row 4 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Focus Patterns</label>
                    <input
                      type="text"
                      value={formFocus}
                      onChange={(e) => setFormFocus(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Energy Patterns</label>
                    <input
                      type="text"
                      value={formEnergy}
                      onChange={(e) => setFormEnergy(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Row 5 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Stress Trends</label>
                    <input
                      type="text"
                      value={formStress}
                      onChange={(e) => setFormStress(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Daily Habits</label>
                    <input
                      type="text"
                      value={formHabits}
                      onChange={(e) => setFormHabits(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Row 6 */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Productivity Style & Cognitive Archetype</label>
                    <input
                      type="text"
                      value={formProductivity}
                      onChange={(e) => setFormProductivity(e.target.value)}
                      className="w-full text-xs bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={handleSyncPersona}
                    disabled={isSyncing}
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-2 transition-all"
                  >
                    {isSyncing ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    <span>{isSyncing ? 'Synchronizing with LifePilot AI...' : 'Synchronize Persona via LifePilot AI'}</span>
                  </button>
                </div>
              </div>

              {/* Area to Improve & suggested improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center space-x-1.5">
                    <ShieldAlert size={14} className="text-amber-500 dark:text-amber-400" />
                    <span>Areas to Improve</span>
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {personaProfile.growthOpportunities.map((g, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center space-x-1.5">
                    <Sparkles size={14} className="text-emerald-500 dark:text-emerald-400" />
                    <span>Suggested Improvements</span>
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {personaProfile.suggestedImprovements.map((s, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: Visual Themes Config */}
        {subTab === 'theme' && (
          <motion.div
            key="theme"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full"
          >
            <ThemeSettingsPanel />
          </motion.div>
        )}

        {/* TAB 3: AI Coach Settings and Weekly reflection */}
        {subTab === 'weekly' && (
          <motion.div
            key="weekly"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* AI Personality Selector */}
            <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-6">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <Brain className="text-indigo-500" size={16} />
                  <span>AI Coach Persona Personality</span>
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Determine the tone, feedback focus, and dialogue style of your companion.</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Coach', emoji: '🏋️', label: 'Pro Coach' },
                  { id: 'Mentor', emoji: '🦉', label: 'Wise Mentor' },
                  { id: 'Friend', emoji: '🌸', label: 'Kind Friend' },
                  { id: 'Professional Advisor', emoji: '👔', label: 'Advisor' },
                  { id: 'Minimalist', emoji: '⛰️', label: 'Zen Minimal' },
                  { id: 'Motivator', emoji: '🔥', label: 'Hyper Motivator' },
                  { id: 'Teacher', emoji: '📖', label: 'Academic Teacher' },
                  { id: 'Companion', emoji: '🚀', label: 'Sidekick' }
                ].map((p) => {
                  const isActive = settings.aiPersonality === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        updateSettings({ aiPersonality: p.id as any });
                        showToast(`AI Personality changed to ${p.id}!`, 'success');
                      }}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex items-center space-x-2 cursor-pointer transition-colors ${isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-100/50 dark:bg-slate-950/20 border-slate-200/50 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                    >
                      <span>{p.emoji}</span>
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Personality quote quote preview */}
              <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 italic text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                "{getPersonalityQuote()}"
              </div>
            </div>

            {/* Notification and alert nudges */}
            <div className="space-y-6">
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-4">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <Bell size={16} className="text-indigo-500" />
                    <span>Focus Coaching Nudges</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Toggle active push prompts, email coaching summaries, and smart nudges.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'pushEnabled', label: 'Enable local browser push triggers' },
                    { key: 'habitReminders', label: 'Habit check-in notifications' },
                    { key: 'focusReminders', label: 'Inactivity focus reminders' },
                    { key: 'aiCoachingNudges', label: 'Proactive AI intervention prompts' }
                  ].map((notif) => {
                    return (
                      <label key={notif.key} className="flex items-center justify-between cursor-pointer text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{notif.label}</span>
                        <input
                          type="checkbox"
                          checked={(settings.notifications as any)[notif.key]}
                          onChange={(e) => {
                            updateSettings({
                              notifications: {
                                ...settings.notifications,
                                [notif.key]: e.target.checked
                              }
                            });
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Maintenance System / Reset */}
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-4">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <Trash2 size={16} className="text-rose-500" />
                    <span>System Maintenance</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Clear local cache data and restore default production seeded profiles.
                  </p>
                </div>

                <button
                  onClick={handleResetClick}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center space-x-2 ${
                    confirmReset 
                      ? 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700 animate-pulse' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-600 hover:bg-rose-500/20'
                  }`}
                >
                  <Trash2 size={14} />
                  <span>{confirmReset ? 'CONFIRM FACTORY RESET' : 'Reset LifePilot Copilot State'}</span>
                </button>
              </div>

              {/* Trigger accomplishments review / celebration */}
              <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-indigo-500/20 rounded-3xl p-6 shadow-xl space-y-4">
                <div>
                  <h4 className="font-display font-bold text-sm text-white flex items-center space-x-2">
                    <Trophy className="text-yellow-400" size={16} />
                    <span>Weekly Review & Victory Celebration</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                    Celebrate weekly productivity goals, levels achieved, and study metrics with an immersive AI animation review.
                  </p>
                </div>

                <button
                  onClick={() => setWeeklyCelebrationOpen(true)}
                  className="w-full text-center py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl text-xs font-bold shadow-lg cursor-pointer transition-all flex items-center justify-center space-x-2"
                >
                  <span>🎉</span>
                  <span>Review Accomplishments & Celebrate</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
