/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Terminal, Sparkles } from 'lucide-react';

interface LifePilotSplashProps {
  duration?: number; // Total duration in ms
  onComplete: () => void;
}

export const LifePilotSplash: React.FC<LifePilotSplashProps> = ({ 
  duration = 2800, 
  onComplete 
}) => {
  const [progress, setProgress] = useState(0);
  const [bootIndex, setBootIndex] = useState(0);
  const [audioPlayed, setAudioPlayed] = useState(false);

  const bootMessages = [
    "Initializing LifePilot Core...",
    "Loading Neural Systems...",
    "Building Cognitive Workspace...",
    "Syncing AI Companion...",
    "Calibrating Productivity Engine...",
    "Systems Online. Ready."
  ];

  // Optional Soft Startup Synthesized Chime using Web Audio API
  const playStartupChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Node 1: Soft warm sub-bass pad
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2
      osc1.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 1.2); // A3
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
      
      // Node 2: High sci-fi chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.15); // E6
      osc2.frequency.setValueAtTime(1760, ctx.currentTime + 0.3); // A6
      gain2.gain.setValueAtTime(0.04, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);

      // Simple lowpass filter to make it warm & glassmorphic
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(filter);
      gain2.connect(filter);
      filter.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 2.0);
      osc2.stop(ctx.currentTime + 2.0);
    } catch (e) {
      // Audio context block safely bypassed
    }
  };

  useEffect(() => {
    // Only play audio on first user action or auto-trigger with fail-safety
    if (!audioPlayed) {
      playStartupChime();
      setAudioPlayed(true);
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(elapsed / duration, 1);
      
      setProgress(Math.round(ratio * 100));

      // Map ratio to boot logs
      const nextIndex = Math.min(
        Math.floor(ratio * bootMessages.length), 
        bootMessages.length - 1
      );
      setBootIndex(nextIndex);

      if (ratio >= 1) {
        clearInterval(interval);
        onComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete, audioPlayed]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Immersive Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 pointer-events-none" />

      {/* Floating neural nodes & stars background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.1,
              scale: Math.random() * 0.6 + 0.4
            }}
            animate={{
              y: [null, Math.random() * -100 - 50],
              opacity: [null, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full blur-[0.5px]"
          />
        ))}
        {/* Subtle grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center select-none">
        
        {/* Animated Rotating Orb Container */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          
          {/* Cyan Glow Background Orb */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.25, 0.45, 0.25]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-24 h-24 rounded-full bg-cyan-500/30 blur-2xl"
          />

          {/* Outer rotating HUD compass ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-cyan-500/20"
          />

          {/* Secondary counter-rotating ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 rounded-full border border-double border-emerald-500/10"
          />

          {/* Inner Core Pulse Orb */}
          <motion.div
            animate={{
              scale: [0.9, 1.05, 0.9],
              borderColor: ["rgba(6,182,212,0.4)", "rgba(16,185,129,0.5)", "rgba(6,182,212,0.4)"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 rounded-full bg-slate-950 border-2 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.25)] relative"
          >
            <Cpu size={24} className="text-cyan-400 animate-pulse" />
          </motion.div>
        </div>

        {/* Title Group */}
        <div className="space-y-2 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center space-x-2"
          >
            <Sparkles size={16} className="text-cyan-400" />
            <h1 className="font-mono text-3xl font-extrabold tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-slate-200 uppercase">
              LIFEPILOT
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xs text-slate-400 font-mono tracking-wider uppercase"
          >
            Your AI Productivity Copilot
          </motion.p>
        </div>

        {/* Dynamic Sequenced Boot Logs */}
        <div className="h-8 mb-8 flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={bootIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-2 text-xs font-mono text-emerald-400"
            >
              <Terminal size={12} className="shrink-0 animate-pulse" />
              <span>{bootMessages[bootIndex]}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Lower Progress Bar & Percentage */}
        <div className="w-56 space-y-2">
          <div className="h-[2px] w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span>BOOTING</span>
            <span>{progress}%</span>
          </div>
        </div>

      </div>
    </div>
  );
};
