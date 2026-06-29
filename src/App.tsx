/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { FocusMode } from './components/FocusMode';
import { PanicMode } from './components/PanicMode';
import { SmartCommitments } from './components/SmartCommitments';
import { GrowthHub } from './components/GrowthHub';
import { SmartCalendar } from './components/SmartCalendar';
import { VoiceAssistant } from './components/VoiceAssistant';
import { InterventionModal } from './components/InterventionModal';
import { SettingsView } from './components/SettingsView';
import { AchievementsView } from './components/AchievementsView';
import { VoiceAssistantView } from './components/VoiceAssistantView';
import { AuthGate } from './components/AuthGate';
import { 
  CheckCircle, AlertCircle, Info, AlertTriangle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { profile, activeTab, toast, hideToast } = useApp();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!profile || !profile.onboarded) {
    return <Onboarding />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'focus':
        return <FocusMode />;
      case 'panic':
        return <PanicMode />;
      case 'commitments':
        return <SmartCommitments />;
      case 'growth':
        return <GrowthHub />;
      case 'calendar':
        return <SmartCalendar />;
      case 'achievements':
        return <AchievementsView />;
      case 'settings':
        return <SettingsView />;
      case 'voice':
        return <VoiceAssistantView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Frosted Glass Background glowing blur blobs */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-300 dark:bg-indigo-900/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-300 dark:bg-purple-900/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-pink-200 dark:bg-pink-950/5 blur-[80px]" />
      </div>

      {/* 1. Left Navigation Sidebar */}
      <div className="relative z-10 lg:sticky lg:top-0">
        <Sidebar />
      </div>

      {/* 2. Main content stage */}
      <main className="relative z-10 flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        {renderActiveTab()}
      </main>

      {/* 3. Floating Voice Assistant Sidebar/Trigger */}
      <div className="relative z-50">
        <VoiceAssistant />
      </div>

      {/* 4. Active Procrastination Intervention modal */}
      <div className="relative z-50">
        <InterventionModal />
      </div>

      {/* 5. Custom Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-[9999] flex items-center space-x-3 backdrop-blur-xl bg-slate-900/95 dark:bg-slate-950/95 border border-slate-700/50 dark:border-white/10 text-white px-4 py-3 rounded-2xl shadow-2xl max-w-md"
          >
            {toast.type === 'success' && <CheckCircle className="text-emerald-400 shrink-0" size={20} />}
            {toast.type === 'error' && <AlertCircle className="text-rose-400 shrink-0" size={20} />}
            {toast.type === 'warning' && <AlertTriangle className="text-amber-400 shrink-0" size={20} />}
            {toast.type === 'info' && <Info className="text-sky-400 shrink-0" size={20} />}
            
            <div className="flex-1 pr-2">
              <p className="text-sm font-sans font-medium leading-normal">{toast.message}</p>
            </div>

            <button
              onClick={hideToast}
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AuthGate>
          <AppContent />
        </AuthGate>
      </AppProvider>
    </ThemeProvider>
  );
}
