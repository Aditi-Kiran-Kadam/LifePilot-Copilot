/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { 
  Timer, Play, Pause, RotateCcw, CheckSquare, Sparkles, Volume2, Headphones,
  BookOpen, Music, Award, PenTool, ChevronUp, ChevronDown, Plus, Trash, 
  RefreshCw, Sliders, Smile, Trophy, Zap, Settings, Minimize2, Maximize2, 
  FileText, Calendar, Flame, TrendingUp, Compass, CheckCircle2, AlertTriangle, 
  Moon, Sun, Coffee, PlayCircle, Star, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

// Types for local state
interface SessionHistoryItem {
  id: string;
  taskTitle: string;
  durationMinutes: number;
  subtasksCompleted: number;
  subtasksTotal: number;
  distractionScore: number;
  focusScore: number;
  xpAwarded: number;
  timestamp: string;
}

const getRecommendedSoundscape = (taskTitle: string): string => {
  if (!taskTitle) return '';
  const titleLower = taskTitle.toLowerCase();
  
  if (titleLower.includes('panic') || titleLower.includes('urgent') || titleLower.includes('asap') || titleLower.includes('rush') || titleLower.includes('deadline')) {
    return 'concentration'; // Deep Concentration
  }
  if (titleLower.includes('stress') || titleLower.includes('anxious') || titleLower.includes('overwhelmed') || titleLower.includes('calm') || titleLower.includes('relax')) {
    return 'forest'; // Forest
  }
  if (titleLower.includes('code') || titleLower.includes('build') || titleLower.includes('dev') || titleLower.includes('program') || titleLower.includes('api') || titleLower.includes('bug') || titleLower.includes('git') || titleLower.includes('database') || titleLower.includes('dbms') || titleLower.includes('sql') || titleLower.includes('react') || titleLower.includes('typescript')) {
    return 'lofi'; // LoFi Study
  }
  if (titleLower.includes('study') || titleLower.includes('learn') || titleLower.includes('exam') || titleLower.includes('test') || titleLower.includes('prep') || titleLower.includes('homework') || titleLower.includes('assignment') || titleLower.includes('quiz')) {
    return 'rain'; // Rain
  }
  if (titleLower.includes('read') || titleLower.includes('book') || titleLower.includes('article') || titleLower.includes('paper') || titleLower.includes('doc') || titleLower.includes('library')) {
    return 'library'; // Library
  }
  if (titleLower.includes('create') || titleLower.includes('design') || titleLower.includes('write') || titleLower.includes('draw') || titleLower.includes('paint') || titleLower.includes('ui') || titleLower.includes('ux') || titleLower.includes('brainstorm') || titleLower.includes('sketch')) {
    return 'piano'; // Soft Piano
  }
  
  return 'lofi';
};

const soundscapesList = [
  { id: 'silent', label: 'Silence', emoji: '🔇', desc: 'Pure silent space' },
  { id: 'rain', label: 'Rain', emoji: '🌧', desc: 'Crisp water drops' },
  { id: 'rain-window', label: 'Rain on Window', emoji: '⛈️', desc: 'Raindrops hitting the window glass' },
  { id: 'thunderstorm', label: 'Thunderstorm', emoji: '⛈', desc: 'Rain & low rumbles' },
  { id: 'waves', label: 'Ocean Waves', emoji: '🌊', desc: 'Slow wave swells' },
  { id: 'ocean-waves', label: 'Ocean Waves (Premium)', emoji: '🌊', desc: 'Deep ocean tidal breathing' },
  { id: 'forest', label: 'Forest', emoji: '🌲', desc: 'Wind & sweet chirps' },
  { id: 'fireplace', label: 'Fireplace', emoji: '🔥', desc: 'Warm cozy wood crackles' },
  { id: 'cafe', label: 'Coffee Shop', emoji: '☕', desc: 'Low murmuring hum' },
  { id: 'library', label: 'Library', emoji: '📚', desc: 'Quiet ticking study room' },
  { id: 'library-ambient', label: 'Library Ambience', emoji: '📚', desc: 'Calm library environment with soft paper rustling' },
  { id: 'piano', label: 'Soft Piano', emoji: '🎹', desc: 'Ambient pentatonic' },
  { id: 'lofi', label: 'LoFi Study', emoji: '🎼', desc: 'Generative chill beat' },
  { id: 'space', label: 'Space Ambient', emoji: '🌌', desc: 'Celestial drone swell' },
  { id: 'crickets', label: 'Night Crickets', emoji: '🌙', desc: 'Nocturnal chirps' },
  { id: 'stream', label: 'Water Stream', emoji: '💧', desc: 'Bubbling creek flow' },
  { id: 'snowfall', label: 'Snowfall', emoji: '❄', desc: 'Chimes & soft breeze' },
  { id: 'concentration', label: 'Deep Concentration', emoji: '🎻', desc: '5Hz Theta binaural' }
];

export const FocusMode: React.FC = () => {
  const { tasks, updateTaskStatus, setFocusSessionsSkipped, triggerIntervention, showToast, incrementStat, addXP } = useApp();
  
  // App context filtering
  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'Done'), [tasks]);

  // Pomodoro Modes Config
  const pomodoroModes = {
    classic: { name: 'Classic', work: 1500, break: 300, desc: '25m Focus • 5m Break' },
    deep: { name: 'Deep Work', work: 3000, break: 600, desc: '50m Focus • 10m Break' },
    sprint: { name: 'Sprint', work: 5400, break: 900, desc: '90m Focus • 15m Break' },
    custom: { name: 'Custom', work: 1500, break: 300, desc: 'User-defined durations' }
  };

  type ModeType = 'classic' | 'deep' | 'sprint' | 'custom';

  // --- CORE FOCUS STATE ---
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string>('');
  const [currentMode, setCurrentMode] = useState<ModeType>('classic');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerPhase, setTimerPhase] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [totalDuration, setTotalDuration] = useState(1500);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [customWorkTime, setCustomWorkTime] = useState(25);
  const [customBreakTime, setCustomBreakTime] = useState(5);

  // Flow State Minimal Mode
  const [isFlowMode, setIsFlowMode] = useState(false);

  // Microtasks / AI Decomposition
  const [microTasks, setMicroTasks] = useState<Array<{ id: string; title: string; completed: boolean; duration?: string; difficulty?: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskText, setEditingSubtaskText] = useState('');

  // Quick Notes with Auto-Save
  const [focusNotes, setFocusNotes] = useState('');
  const [isNotesSaving, setIsNotesSaving] = useState(false);
  const [notesSaveTime, setNotesSaveTime] = useState('');

  // Audio / Soundscapes
  const [soundscape, setSoundscape] = useState<string>('silent');
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [recommendedSoundscape, setRecommendedSoundscape] = useState<string>('');

  // Gamification & History Stats (Stored Locally)
  const [focusXP, setFocusXP] = useState(0);
  const [focusStreak, setFocusStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [focusHistory, setFocusHistory] = useState<SessionHistoryItem[]>([]);
  const [interruptionsCount, setInterruptionsCount] = useState(0);

  // Session Summary Modal state
  const [showSummary, setShowSummary] = useState(false);
  const [lastSessionSummary, setLastSessionSummary] = useState<{
    duration: number;
    subtasksDone: number;
    subtasksTotal: number;
    distractionScore: number;
    focusScore: number;
    xpGained: number;
    evaluation: 'Excellent' | 'Good' | 'Moderate' | 'Needs Improvement';
    nextStep: string;
  } | null>(null);

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{
    source?: AudioNode;
    sources?: AudioNode[];
    gainNode?: GainNode;
    intervalId?: NodeJS.Timeout;
    lofiInterval?: NodeJS.Timeout;
  }>({});

  // Curated AI Focus Coach tips
  const coachMessages = [
    "Deep focus is a muscle. You are training it beautifully right now.",
    "Excellent momentum. Eliminate distraction, submerge into the task.",
    "Your future self will thank you for this block of deep work.",
    "Breathe deeply. Relax your shoulders. Focus on one line at a time.",
    "You are doing fantastic. Enjoy the tranquility of continuous output.",
    "Sustained coding and learning has an compounding yield. Keep going!",
    "Rhythm established. Protect this focus state at all costs."
  ];
  const [coachMsgIndex, setCoachMsgIndex] = useState(0);

  // --- LOCAL STORAGE DATA LOAD ---
  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem('lifepilot_focus_notes');
      if (storedNotes) setFocusNotes(storedNotes);

      const storedXP = localStorage.getItem('lifepilot_focus_xp');
      if (storedXP) setFocusXP(parseInt(storedXP, 10));

      const storedStreak = localStorage.getItem('lifepilot_focus_streak');
      if (storedStreak) setFocusStreak(parseInt(storedStreak, 10));

      const storedLongest = localStorage.getItem('lifepilot_focus_longest_streak');
      if (storedLongest) setLongestStreak(parseInt(storedLongest, 10));

      const storedHistory = localStorage.getItem('lifepilot_focus_history');
      if (storedHistory) setFocusHistory(JSON.parse(storedHistory));

      const storedPrefs = localStorage.getItem('lifepilot_focus_prefs');
      if (storedPrefs) {
        const prefs = JSON.parse(storedPrefs);
        if (prefs.soundscape) setSoundscape(prefs.soundscape);
        if (prefs.audioVolume !== undefined) setAudioVolume(prefs.audioVolume);
        if (prefs.currentMode) {
          setCurrentMode(prefs.currentMode);
          const modeObj = pomodoroModes[prefs.currentMode as ModeType];
          setTimeLeft(modeObj.work);
          setTotalDuration(modeObj.work);
        }
      }
    } catch (e) {
      console.error('Failed to load focus state from localStorage', e);
    }
  }, []);

  // --- SAVE PREFERENCES ---
  const savePreferences = (updatedPrefs: Partial<{ soundscape: string; audioVolume: number; currentMode: string }>) => {
    try {
      const currentPrefs = JSON.parse(localStorage.getItem('lifepilot_focus_prefs') || '{}');
      const newPrefs = { ...currentPrefs, ...updatedPrefs };
      localStorage.setItem('lifepilot_focus_prefs', JSON.stringify(newPrefs));
    } catch (e) {
      console.error(e);
    }
  };

  // --- AUDIO SYNTH ENGINE (REAL WEB AUDIO API) ---
  const initAudioContext = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    } catch (e) {
      console.warn('AudioContext init failed or blocked in sandboxed environment:', e);
    }
  };

  const stopAllAudio = (fadeOut = true) => {
    const ctx = audioContextRef.current;
    const oldGainNode = audioNodesRef.current.gainNode;
    const oldSource = audioNodesRef.current.source;
    const oldSources = audioNodesRef.current.sources;
    const oldIntervals = [
      audioNodesRef.current.intervalId,
      audioNodesRef.current.lofiInterval
    ].filter(Boolean) as NodeJS.Timeout[];

    if (oldGainNode && fadeOut && ctx) {
      try {
        const now = ctx.currentTime;
        oldGainNode.gain.cancelScheduledValues(now);
        oldGainNode.gain.setValueAtTime(oldGainNode.gain.value, now);
        oldGainNode.gain.linearRampToValueAtTime(0, now + 0.8);
      } catch (e) {}
      setTimeout(() => {
        try {
          oldSource?.disconnect();
          if (oldSource && 'stop' in oldSource) (oldSource as any).stop?.();
        } catch (e) {}
        if (oldSources) {
          oldSources.forEach((src) => {
            try {
              src.disconnect();
              if ('stop' in src) (src as any).stop?.();
            } catch (e) {}
          });
        }
        oldIntervals.forEach(clearInterval);
      }, 900);
    } else {
      try {
        oldSource?.disconnect();
        if (oldSource && 'stop' in oldSource) (oldSource as any).stop?.();
      } catch (e) {}
      if (oldSources) {
        oldSources.forEach((src) => {
          try {
            src.disconnect();
            if ('stop' in src) (src as any).stop?.();
          } catch (e) {}
        });
      }
      oldIntervals.forEach(clearInterval);
    }

    setIsAudioPlaying(false);
  };

  const startAudioSynth = (type: string) => {
    let ctx;
    try {
      ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContextRef.current) {
        audioContextRef.current = ctx;
      }
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (e) {
      console.warn('AudioContext start failed or blocked in sandboxed environment:', e);
      return;
    }

    if (!ctx) return;

    const fadeOutDuration = 1.2; // 1.2 seconds cross-fade

    const oldGainNode = audioNodesRef.current.gainNode;
    const oldSource = audioNodesRef.current.source;
    const oldSources = audioNodesRef.current.sources;
    const oldIntervals = [
      audioNodesRef.current.intervalId,
      audioNodesRef.current.lofiInterval
    ].filter(Boolean) as NodeJS.Timeout[];

    // Fade out previous sound
    if (oldGainNode) {
      try {
        const now = ctx.currentTime;
        oldGainNode.gain.cancelScheduledValues(now);
        oldGainNode.gain.setValueAtTime(oldGainNode.gain.value, now);
        oldGainNode.gain.linearRampToValueAtTime(0, now + fadeOutDuration);
      } catch (e) {
        console.error(e);
      }
      setTimeout(() => {
        try {
          oldSource?.disconnect();
          if (oldSource && 'stop' in oldSource) (oldSource as any).stop?.();
        } catch (e) {}
        if (oldSources) {
          oldSources.forEach((src) => {
            try {
              src.disconnect();
              if ('stop' in src) (src as any).stop?.();
            } catch (e) {}
          });
        }
        oldIntervals.forEach(clearInterval);
      }, fadeOutDuration * 1000 + 100);
    } else {
      oldIntervals.forEach(clearInterval);
    }

    if (type === 'silent') {
      setIsAudioPlaying(false);
      audioNodesRef.current = {};
      return;
    }

    // Initialize new Gain and connect it to master destination
    const masterGain = ctx.createGain();
    const targetVolume = audioVolume * 0.15;
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + fadeOutDuration);
    masterGain.connect(ctx.destination);

    audioNodesRef.current = {
      gainNode: masterGain,
      sources: []
    };

    setIsAudioPlaying(true);

    const addSource = (node: AudioNode) => {
      if (audioNodesRef.current.sources) {
        audioNodesRef.current.sources.push(node);
      }
    };

    if (type === 'rain' || type === 'rain-window') {
      // Rain sound: Pink-filtered noise with high frequency ticks (raindrops)
      const bufferSize = 4 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const hpFilter = ctx.createBiquadFilter();
      hpFilter.type = 'highpass';
      hpFilter.frequency.setValueAtTime(800, ctx.currentTime);

      noiseNode.connect(hpFilter);
      hpFilter.connect(masterGain);
      noiseNode.start();
      addSource(noiseNode);

      const clicker = setInterval(() => {
        if (Math.random() > 0.4) {
          const osc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200 + Math.random() * 800, ctx.currentTime);
          clickGain.gain.setValueAtTime(0.02 * Math.random(), ctx.currentTime);
          clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          
          osc.connect(clickGain);
          clickGain.connect(masterGain);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        }
      }, 150);
      audioNodesRef.current.intervalId = clicker;

    } else if (type === 'thunderstorm') {
      // Rain + Periodic heavy low rumble thunder
      const bufferSize = 4 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const hpFilter = ctx.createBiquadFilter();
      hpFilter.type = 'highpass';
      hpFilter.frequency.setValueAtTime(700, ctx.currentTime);

      noiseNode.connect(hpFilter);
      hpFilter.connect(masterGain);
      noiseNode.start();
      addSource(noiseNode);

      const playThunder = () => {
        const tBufferSize = ctx.sampleRate * 6;
        const tBuffer = ctx.createBuffer(1, tBufferSize, ctx.sampleRate);
        const tData = tBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < tBufferSize; i++) {
          const white = Math.random() * 2 - 1;
          tData[i] = (lastOut + 0.05 * white) / 1.05;
          lastOut = tData[i];
        }
        const tSource = ctx.createBufferSource();
        tSource.buffer = tBuffer;

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(90, ctx.currentTime);
        lp.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 5.5);

        const tGain = ctx.createGain();
        tGain.gain.setValueAtTime(0, ctx.currentTime);
        tGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.6);
        tGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 5.8);

        tSource.connect(lp);
        lp.connect(tGain);
        tGain.connect(masterGain);
        tSource.start();
      };

      playThunder();
      const thunderstormInterval = setInterval(() => {
        if (Math.random() > 0.4) {
          playThunder();
        }
      }, 15000);
      audioNodesRef.current.intervalId = thunderstormInterval;

    } else if (type === 'waves' || type === 'ocean-waves') {
      // Ocean Waves: slow sweeping lowpass pink/brown noise
      const bufferSize = 8 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(350, ctx.currentTime);

      const waveGain = ctx.createGain();
      waveGain.gain.setValueAtTime(0.05, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.04, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(waveGain.gain);

      noiseNode.connect(lp);
      lp.connect(waveGain);
      waveGain.connect(masterGain);

      lfo.start();
      noiseNode.start();
      addSource(lfo);
      addSource(noiseNode);

    } else if (type === 'forest') {
      // Forest wind + bird chirping
      const bufferSize = 8 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.015 * white)) / 1.015;
        lastOut = data[i];
        data[i] *= 2.0;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const lpFilter = ctx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.setValueAtTime(300, ctx.currentTime);

      noiseNode.connect(lpFilter);
      lpFilter.connect(masterGain);
      noiseNode.start();
      addSource(noiseNode);

      const chirpInterval = setInterval(() => {
        if (Math.random() > 0.6) {
          const osc = ctx.createOscillator();
          const cGain = ctx.createGain();
          osc.type = 'sine';
          
          const now = ctx.currentTime;
          osc.frequency.setValueAtTime(2500 + Math.random() * 500, now);
          osc.frequency.exponentialRampToValueAtTime(4500 + Math.random() * 500, now + 0.2);
          
          cGain.gain.setValueAtTime(0.015, now);
          cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          
          osc.connect(cGain);
          cGain.connect(masterGain);
          osc.start();
          osc.stop(now + 0.3);
        }
      }, 2000);
      audioNodesRef.current.intervalId = chirpInterval;

    } else if (type === 'fireplace') {
      // Fireplace: Low crackling pops + brown noise hum
      const bufferSize = 6 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.035 * white)) / 1.035;
        lastOut = data[i];
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(160, ctx.currentTime);

      noiseNode.connect(lp);
      lp.connect(masterGain);
      noiseNode.start();
      addSource(noiseNode);

      const crackleInterval = setInterval(() => {
        if (Math.random() > 0.4) {
          const osc = ctx.createOscillator();
          const popGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(100 + Math.random() * 1400, ctx.currentTime);
          popGain.gain.setValueAtTime(0.018 * Math.random(), ctx.currentTime);
          popGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.018);
          osc.connect(popGain);
          popGain.connect(masterGain);
          osc.start();
          osc.stop(ctx.currentTime + 0.02);
        }
      }, 120);
      audioNodesRef.current.intervalId = crackleInterval;

    } else if (type === 'cafe') {
      // Coffee Shop: Low murmuring hum + clinks
      const bufferSize = 6 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.012 * white)) / 1.012;
        lastOut = data[i];
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(180, ctx.currentTime);

      noiseNode.connect(lp);
      lp.connect(masterGain);
      noiseNode.start();
      addSource(noiseNode);

      const cafeInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          const osc = ctx.createOscillator();
          const clinkG = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1600 + Math.random() * 500, ctx.currentTime);
          clinkG.gain.setValueAtTime(0.006, ctx.currentTime);
          clinkG.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
          osc.connect(clinkG);
          clinkG.connect(masterGain);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }
      }, 2500);
      audioNodesRef.current.intervalId = cafeInterval;

    } else if (type === 'library' || type === 'library-ambient') {
      // Library: quiet room noise + turning pages + clock ticking
      const bufferSize = 8 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.008 * white)) / 1.008;
        lastOut = data[i];
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(110, ctx.currentTime);
      noiseNode.connect(lp);
      lp.connect(masterGain);
      noiseNode.start();
      addSource(noiseNode);

      const playPageRustle = () => {
        const now = ctx.currentTime;
        const rustleGain = ctx.createGain();
        rustleGain.gain.setValueAtTime(0, now);
        rustleGain.gain.linearRampToValueAtTime(0.006, now + 0.12);
        rustleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);

        const rBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
        const rData = rBuffer.getChannelData(0);
        for (let i = 0; i < rBuffer.length; i++) {
          rData[i] = Math.random() * 2 - 1;
        }
        const rSource = ctx.createBufferSource();
        rSource.buffer = rBuffer;
        rSource.connect(filter);
        filter.connect(rustleGain);
        rustleGain.connect(masterGain);
        rSource.start();
      };

      const libraryInterval = setInterval(() => {
        const now = ctx.currentTime;
        const tick = ctx.createOscillator();
        const tickGain = ctx.createGain();
        tick.type = 'sine';
        tick.frequency.setValueAtTime(750, now);
        tickGain.gain.setValueAtTime(0.0015, now);
        tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.01);
        tick.connect(tickGain);
        tickGain.connect(masterGain);
        tick.start();
        tick.stop(now + 0.02);

        if (Math.random() > 0.9) {
          playPageRustle();
        }
      }, 1000);
      audioNodesRef.current.intervalId = libraryInterval;

    } else if (type === 'piano') {
      // Soft Piano: warm ambient generative pentatonic chords
      const scale = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
      const playPianoNote = () => {
        const note = scale[Math.floor(Math.random() * scale.length)];
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const pGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, now);

        pGain.gain.setValueAtTime(0, now);
        pGain.gain.linearRampToValueAtTime(0.045, now + 0.12);
        pGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        osc.connect(filter);
        filter.connect(pGain);
        pGain.connect(masterGain);

        osc.start();
        osc.stop(now + 3.0);
      };

      playPianoNote();
      const pianoInterval = setInterval(() => {
        if (Math.random() > 0.3) {
          playPianoNote();
        }
      }, 1600);
      audioNodesRef.current.intervalId = pianoInterval;

    } else if (type === 'lofi') {
      // LoFi Study chords + kick
      const lofiChords = [
        [130.81, 164.81, 196.00, 246.94],
        [110.00, 130.81, 164.81, 196.00],
        [146.83, 174.61, 220.00, 261.63],
        [98.00,  123.47, 146.83, 174.61]
      ];

      let chordIndex = 0;
      const playChord = () => {
        const chord = lofiChords[chordIndex];
        const now = ctx.currentTime;

        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(250, now);
          filter.frequency.exponentialRampToValueAtTime(800, now + 1.5);
          filter.frequency.exponentialRampToValueAtTime(200, now + 3.8);

          noteGain.gain.setValueAtTime(0, now);
          noteGain.gain.linearRampToValueAtTime(0.035, now + 1.2);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.9);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(masterGain);
          
          osc.start(now);
          osc.stop(now + 4.0);
        });

        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.frequency.setValueAtTime(150, now);
        kickOsc.frequency.exponentialRampToValueAtTime(45, now + 0.18);
        kickGain.gain.setValueAtTime(0.12, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        kickOsc.connect(kickGain);
        kickGain.connect(masterGain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.25);

        chordIndex = (chordIndex + 1) % lofiChords.length;
      };

      playChord();
      const interval = setInterval(playChord, 4000);
      audioNodesRef.current.lofiInterval = interval;

    } else if (type === 'space') {
      // Space Ambient celestial drone
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110.5, now);

      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(165, now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, now);
      filter.Q.setValueAtTime(4, now);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.04, now);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(50, now);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.045, now);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(masterGain);

      osc1.start();
      osc2.start();
      osc3.start();
      lfo.start();
      addSource(osc1);
      addSource(osc2);
      addSource(osc3);
      addSource(lfo);

    } else if (type === 'crickets') {
      const bufferSize = 8 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.01 * white)) / 1.01;
        lastOut = data[i];
      }
      const breezeNode = ctx.createBufferSource();
      breezeNode.buffer = buffer;
      breezeNode.loop = true;
      const breezeLP = ctx.createBiquadFilter();
      breezeLP.type = 'lowpass';
      breezeLP.frequency.setValueAtTime(180, ctx.currentTime);
      breezeNode.connect(breezeLP);
      breezeLP.connect(masterGain);
      breezeNode.start();
      addSource(breezeNode);

      const cricketsInterval = setInterval(() => {
        if (Math.random() > 0.4) {
          const now = ctx.currentTime;
          for (let chirp = 0; chirp < 4; chirp++) {
            const chirpTime = now + chirp * 0.08;
            const osc = ctx.createOscillator();
            const chirpG = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(3900 + Math.random() * 150, chirpTime);

            chirpG.gain.setValueAtTime(0, chirpTime);
            chirpG.gain.linearRampToValueAtTime(0.007, chirpTime + 0.01);
            chirpG.gain.exponentialRampToValueAtTime(0.0001, chirpTime + 0.06);

            osc.connect(chirpG);
            chirpG.connect(masterGain);
            osc.start(chirpTime);
            osc.stop(chirpTime + 0.07);
          }
        }
      }, 1200);
      audioNodesRef.current.intervalId = cricketsInterval;

    } else if (type === 'stream') {
      const bufferSize = 4 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(850, ctx.currentTime);
      bandpass.Q.setValueAtTime(0.7, ctx.currentTime);

      const streamGain = ctx.createGain();
      streamGain.gain.setValueAtTime(0.06, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.42, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.018, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(streamGain.gain);

      noiseSource.connect(bandpass);
      bandpass.connect(streamGain);
      streamGain.connect(masterGain);

      noiseSource.start();
      lfo.start();
      addSource(noiseSource);
      addSource(lfo);

    } else if (type === 'snowfall') {
      const bufferSize = 8 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.004 * white)) / 1.004;
        lastOut = data[i];
      }
      const windNode = ctx.createBufferSource();
      windNode.buffer = buffer;
      windNode.loop = true;
      const windLP = ctx.createBiquadFilter();
      windLP.type = 'bandpass';
      windLP.frequency.setValueAtTime(580, ctx.currentTime);
      windLP.Q.setValueAtTime(0.35, ctx.currentTime);
      windNode.connect(windLP);
      windLP.connect(masterGain);
      windNode.start();
      addSource(windNode);

      const snowInterval = setInterval(() => {
        if (Math.random() > 0.6) {
          const frequencies = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
          const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const chimeGain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          chimeGain.gain.setValueAtTime(0, now);
          chimeGain.gain.linearRampToValueAtTime(0.014, now + 0.1);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

          osc.connect(chimeGain);
          chimeGain.connect(masterGain);
          osc.start();
          osc.stop(now + 4.5);
        }
      }, 2800);
      audioNodesRef.current.intervalId = snowInterval;

    } else if (type === 'concentration') {
      const now = ctx.currentTime;
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();

      oscL.frequency.setValueAtTime(100, now);
      oscR.frequency.setValueAtTime(105, now);

      const gainL = ctx.createGain();
      const gainR = ctx.createGain();
      gainL.gain.setValueAtTime(0.03, now);
      gainR.gain.setValueAtTime(0.03, now);

      const merger = ctx.createChannelMerger(2);
      oscL.connect(gainL).connect(merger, 0, 0);
      oscR.connect(gainR).connect(merger, 0, 1);

      const celloOsc = ctx.createOscillator();
      celloOsc.type = 'triangle';
      celloOsc.frequency.setValueAtTime(150, now);
      const celloLP = ctx.createBiquadFilter();
      celloLP.type = 'lowpass';
      celloLP.frequency.setValueAtTime(170, now);
      const celloGain = ctx.createGain();
      celloGain.gain.setValueAtTime(0.02, now);

      celloOsc.connect(celloLP).connect(celloGain).connect(masterGain);
      merger.connect(masterGain);

      oscL.start();
      oscR.start();
      celloOsc.start();
      addSource(oscL);
      addSource(oscR);
      addSource(celloOsc);
    }
  };

  // Adjust volume dynamically
  useEffect(() => {
    if (audioNodesRef.current.gainNode) {
      audioNodesRef.current.gainNode.gain.setValueAtTime(audioVolume * 0.15, audioContextRef.current?.currentTime || 0);
    }
    savePreferences({ audioVolume });
  }, [audioVolume]);

  // Adjust soundscape on state change
  useEffect(() => {
    if (soundscape !== 'silent') {
      startAudioSynth(soundscape);
    } else {
      stopAllAudio();
    }
    savePreferences({ soundscape });
  }, [soundscape]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // Auto-recommend and play soundscapes based on selected task
  useEffect(() => {
    if (selectedTaskTitle) {
      const recommended = getRecommendedSoundscape(selectedTaskTitle);
      setRecommendedSoundscape(recommended);
      if (recommended) {
        setSoundscape(recommended);
        setIsAudioPlaying(true);
      }
    } else {
      setRecommendedSoundscape('');
    }
  }, [selectedTaskTitle]);

  // --- COACH MESSAGE TIMER ROTATION ---
  useEffect(() => {
    const coachInterval = setInterval(() => {
      setCoachMsgIndex((prev) => (prev + 1) % coachMessages.length);
    }, 60000); // changes every 1 minute during focus
    return () => clearInterval(coachInterval);
  }, []);


  // --- TIMER EFFECT ---
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            handleCycleCompletion();
            return 0;
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
  }, [isTimerRunning, timerPhase, timeLeft]);

  // Trigger when current timer finishes completely
  const handleCycleCompletion = () => {
    const alertAudio = new Audio(); // optional sound hook if desired
    
    if (timerPhase === 'work') {
      // Completed Focus Session!
      const totalSessionMinutes = Math.round(totalDuration / 60);
      setCompletedCycles(prev => prev + 1);
      
      // Calculate Focus Score & XP Gained
      const subtaskDoneCount = microTasks.filter(m => m.completed).length;
      const subtaskTotalCount = microTasks.length;
      const subtaskRatio = subtaskTotalCount > 0 ? (subtaskDoneCount / subtaskTotalCount) : 1;
      
      const sessionScore = Math.max(0, Math.min(100, Math.round(
        (totalSessionMinutes / 25) * 35 +
        subtaskRatio * 45 +
        (focusStreak * 3) -
        (interruptionsCount * 5)
      )));

      const xpGained = Math.round(totalSessionMinutes * 2 + (subtaskDoneCount * 5) + 15);
      
      let evaluationStr: 'Excellent' | 'Good' | 'Moderate' | 'Needs Improvement' = 'Good';
      if (sessionScore >= 85) evaluationStr = 'Excellent';
      else if (sessionScore >= 65) evaluationStr = 'Good';
      else if (sessionScore >= 45) evaluationStr = 'Moderate';
      else evaluationStr = 'Needs Improvement';

      const summaryDetails = {
        duration: totalSessionMinutes,
        subtasksDone: subtaskDoneCount,
        subtasksTotal: subtaskTotalCount,
        distractionScore: Math.min(10, Math.max(1, Math.round(5 + (interruptionsCount) - (subtaskRatio * 4)))),
        focusScore: sessionScore,
        xpGained: xpGained,
        evaluation: evaluationStr,
        nextStep: timerPhase === 'work' ? "Enjoy a soothing break to synthesize what you've learned." : "Resume another high focus block to lock-in knowledge."
      };

      setLastSessionSummary(summaryDetails);
      setShowSummary(true);

      // Record History
      const historyItem: SessionHistoryItem = {
        id: `session-${Date.now()}`,
        taskTitle: selectedTaskTitle || "General Focus",
        durationMinutes: totalSessionMinutes,
        subtasksCompleted: subtaskDoneCount,
        subtasksTotal: subtaskTotalCount,
        distractionScore: summaryDetails.distractionScore,
        focusScore: sessionScore,
        xpAwarded: xpGained,
        timestamp: new Date().toISOString()
      };

      const updatedHistory = [historyItem, ...focusHistory];
      setFocusHistory(updatedHistory);
      localStorage.setItem('lifepilot_focus_history', JSON.stringify(updatedHistory));

      // Trigger global statistics tracking & gamification level-up!
      const focusedHours = Math.round((totalSessionMinutes / 60) * 10) / 10 || 0.4;
      incrementStat('hoursFocused', focusedHours);
      incrementStat('focusSessionsCompleted', 1);
      
      const currentHour = new Date().getHours();
      if (currentHour >= 22 || currentHour < 5) {
        incrementStat('nightOwlConsecutiveDays', 1);
      }

      addXP(25, 'Finished Focus Session');

      // Update XP & Streaks
      const newXP = focusXP + xpGained;
      setFocusXP(newXP);
      localStorage.setItem('lifepilot_focus_xp', newXP.toString());

      const nextStreak = focusStreak + 1;
      setFocusStreak(nextStreak);
      localStorage.setItem('lifepilot_focus_streak', nextStreak.toString());

      if (nextStreak > longestStreak) {
        setLongestStreak(nextStreak);
        localStorage.setItem('lifepilot_focus_longest_streak', nextStreak.toString());
      }

      // Reset Phase to Break
      setTimerPhase('break');
      const breakDuration = getBreakDurationForMode(currentMode);
      setTimeLeft(breakDuration);
      setTotalDuration(breakDuration);
      setInterruptionsCount(0);

    } else {
      // Completed Break Session!
      setTimerPhase('work');
      const workDuration = getWorkDurationForMode(currentMode);
      setTimeLeft(workDuration);
      setTotalDuration(workDuration);
      showToast("Break complete! Ready to sync back into focus mode?", "success");
    }
  };

  const getWorkDurationForMode = (mode: ModeType) => {
    if (mode === 'custom') return customWorkTime * 60;
    return pomodoroModes[mode].work;
  };

  const getBreakDurationForMode = (mode: ModeType) => {
    if (mode === 'custom') return customBreakTime * 60;
    if (mode === 'classic' && completedCycles > 0 && completedCycles % 4 === 0) {
      return 900; // 15m long break
    }
    return pomodoroModes[mode].break;
  };

  const handleModeChange = (mode: ModeType) => {
    setCurrentMode(mode);
    setIsTimerRunning(false);
    setTimerPhase('work');
    const workDuration = mode === 'custom' ? customWorkTime * 60 : pomodoroModes[mode].work;
    setTimeLeft(workDuration);
    setTotalDuration(workDuration);
    savePreferences({ currentMode: mode });
  };

  const handleCustomTimeApply = () => {
    if (currentMode === 'custom') {
      setIsTimerRunning(false);
      setTimerPhase('work');
      const workDuration = customWorkTime * 60;
      setTimeLeft(workDuration);
      setTotalDuration(workDuration);
    }
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      setInterruptionsCount(prev => prev + 1);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerPhase('work');
    const workDuration = getWorkDurationForMode(currentMode);
    setTimeLeft(workDuration);
    setTotalDuration(workDuration);
  };

  const skipBreak = () => {
    setIsTimerRunning(false);
    setTimerPhase('work');
    const workDuration = getWorkDurationForMode(currentMode);
    setTimeLeft(workDuration);
    setTotalDuration(workDuration);
  };

  const forceEndSession = () => {
    setIsTimerRunning(false);
    handleCycleCompletion();
  };

  const handleSkipFocusSession = () => {
    setIsTimerRunning(false);
    setFocusSessionsSkipped(prev => prev + 1);
    
    // Find active task or first task
    const activeTask = tasks.find(t => t.id === selectedTaskId) || tasks.find(t => t.status !== 'Done') || {
      id: 't-default',
      title: 'DBMS Assignment',
      deadline: new Date().toISOString().split('T')[0],
      complexity: 'High',
      priority: 'High',
      status: 'Todo',
      subtasks: [],
      category: 'Studies',
      estimatedHours: 2,
      procrastinationCount: 3
    } as Task;

    triggerIntervention(activeTask);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // --- TASK DECOMPOSITION ENGINE ---
  const handleTaskSelect = async (taskId: string) => {
    setSelectedTaskId(taskId);
    if (!taskId) {
      setSelectedTaskTitle('');
      setMicroTasks([]);
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    setSelectedTaskTitle(task.title);

    // If task already has subtasks in context, load them
    if (task.subtasks && task.subtasks.length > 0) {
      setMicroTasks(task.subtasks.map(st => ({ ...st })));
      return;
    }

    // Call AI API to split task
    await regenerateDecomposition(task.title, task.complexity);
  };

  const regenerateDecomposition = async (title?: string, complexity?: string) => {
    const activeTitle = title || selectedTaskTitle;
    if (!activeTitle) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/focus-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle: activeTitle, complexity: complexity || 'Medium' }),
      });
      if (!response.ok) throw new Error('API down');
      const data = await response.json();
      
      const generated = data.microTasks.map((mt: any, idx: number) => ({
        id: `mt-${idx}-${Date.now()}`,
        title: mt.title,
        completed: false,
        duration: mt.duration || "25 min",
        difficulty: mt.difficulty || "Medium"
      }));
      setMicroTasks(generated);
    } catch (err) {
      // High fidelity client-side category classification & fallback templates
      const titleLower = activeTitle.toLowerCase();
      let category = "Study";
      
      if (titleLower.includes("hackathon") || titleLower.includes("mvp") || titleLower.includes("pitch")) {
        category = "Hackathon";
      } else if (titleLower.includes("placement") || titleLower.includes("leet") || titleLower.includes("dsa") || titleLower.includes("interview") || titleLower.includes("mock")) {
        category = "Placement Prep";
      } else if (titleLower.includes("code") || titleLower.includes("debug") || titleLower.includes("refactor") || titleLower.includes("algorithm") || titleLower.includes("programming") || titleLower.includes("ts") || titleLower.includes("js") || titleLower.includes("python")) {
        category = "Coding";
      } else if (titleLower.includes("project") || titleLower.includes("build") || titleLower.includes("app") || titleLower.includes("api") || titleLower.includes("deploy") || titleLower.includes("architecture")) {
        category = "Project Building";
      } else if (titleLower.includes("assign") || titleLower.includes("homework") || titleLower.includes("report") || titleLower.includes("essay") || titleLower.includes("submit")) {
        category = "Assignment";
      } else if (titleLower.includes("learn") || titleLower.includes("watch") || titleLower.includes("course") || titleLower.includes("tutorial")) {
        category = "Learning";
      } else if (titleLower.includes("career") || titleLower.includes("growth") || titleLower.includes("linkedin") || titleLower.includes("portfolio")) {
        category = "Career Growth";
      }

      const fallbackTemplates: Record<string, Array<{ title: string; duration: string; difficulty: string }>> = {
        "Study": [
          { title: "Review lecture notes & textbook chapters", duration: "30 min", difficulty: "Easy" },
          { title: "Summarize core formulas and key definitions", duration: "30 min", difficulty: "Medium" },
          { title: `Solve practice questions related to "${activeTitle}"`, duration: "45 min", difficulty: "Hard" },
          { title: "Create active recall flashcards", duration: "25 min", difficulty: "Medium" },
          { title: "Self-quiz and review incorrect solutions", duration: "20 min", difficulty: "Easy" }
        ],
        "Coding": [
          { title: "Write specification tests & define function structures", duration: "20 min", difficulty: "Easy" },
          { title: `Implement core algorithm logic for "${activeTitle}"`, duration: "60 min", difficulty: "Hard" },
          { title: "Debug edge cases and optimize loop complexity", duration: "40 min", difficulty: "Hard" },
          { title: "Refactor function signatures and clean up code", duration: "30 min", difficulty: "Medium" },
          { title: "Commit changes to version control repository", duration: "10 min", difficulty: "Easy" }
        ],
        "Assignment": [
          { title: `Read prompt guidelines and rubric for "${activeTitle}"`, duration: "15 min", difficulty: "Easy" },
          { title: "Research reference papers & draft outline structure", duration: "45 min", difficulty: "Medium" },
          { title: "Draft introduction and main argument paragraphs", duration: "60 min", difficulty: "Hard" },
          { title: "Incorporate illustrative figures or equations", duration: "30 min", difficulty: "Medium" },
          { title: "Final proofread & upload submission package", duration: "25 min", difficulty: "Easy" }
        ],
        "Hackathon": [
          { title: "Define MVP scope & map main page user experience flow", duration: "30 min", difficulty: "Easy" },
          { title: "Spin up project boilerplate and set up global states", duration: "45 min", difficulty: "Medium" },
          { title: "Connect real-time endpoints or mock static data", duration: "60 min", difficulty: "Hard" },
          { title: "Develop core interactive features and styling details", duration: "90 min", difficulty: "Hard" },
          { title: "Incorporate aesthetic transitions and micro animations", duration: "40 min", difficulty: "Medium" },
          { title: "Record high fidelity video demo and draft description", duration: "30 min", difficulty: "Medium" }
        ],
        "Learning": [
          { title: "Watch educational tutorials or read document libraries", duration: "40 min", difficulty: "Easy" },
          { title: "Clone or build simple exercises locally", duration: "30 min", difficulty: "Medium" },
          { title: "Modify core variables to stress test assumptions", duration: "30 min", difficulty: "Medium" },
          { title: `Develop a custom mini sandbox app for "${activeTitle}"`, duration: "60 min", difficulty: "Hard" },
          { title: "Write a summary markdown note of key lessons learned", duration: "20 min", difficulty: "Easy" }
        ],
        "Placement Prep": [
          { title: `Solve a target DSA problem related to "${activeTitle}"`, duration: "30 min", difficulty: "Medium" },
          { title: "Analyze worst case space-time complexity", duration: "15 min", difficulty: "Easy" },
          { title: "Revise answer frameworks for behavioral questions", duration: "30 min", difficulty: "Medium" },
          { title: "Conduct mock dry-run interviews on camera", duration: "45 min", difficulty: "Hard" },
          { title: "Optimize relevant bullet points on resumes", duration: "30 min", difficulty: "Medium" }
        ],
        "Career Growth": [
          { title: `Research top industry trends for "${activeTitle}"`, duration: "45 min", difficulty: "Easy" },
          { title: "Initiate outreach with senior professional contacts", duration: "20 min", difficulty: "Medium" },
          { title: "Author an educational article or dev community post", duration: "60 min", difficulty: "Hard" },
          { title: "Plan structural progress for desired career certificates", duration: "30 min", difficulty: "Medium" },
          { title: "Build or polish visual case studies for portfolios", duration: "60 min", difficulty: "Hard" }
        ],
        "Project Building": [
          { title: `Outline technical spec sheet for "${activeTitle}"`, duration: "30 min", difficulty: "Easy" },
          { title: "Draft entity relationship schemas & routing maps", duration: "45 min", difficulty: "Medium" },
          { title: "Program fundamental database entities and controllers", duration: "90 min", difficulty: "Hard" },
          { title: "Construct responsive user interface views with Tailwind", duration: "90 min", difficulty: "Hard" },
          { title: "Perform comprehensive end-to-end user checks", duration: "40 min", difficulty: "Medium" },
          { title: "Deploy system artifacts to hosting environment", duration: "30 min", difficulty: "Hard" }
        ]
      };

      const tasks = fallbackTemplates[category] || fallbackTemplates["Study"];
      const generated = tasks.map((mt: any, idx: number) => ({
        id: `mt-${idx}-${Date.now()}`,
        title: mt.title,
        completed: false,
        duration: mt.duration,
        difficulty: mt.difficulty
      }));
      setMicroTasks(generated);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMicroTask = (id: string) => {
    setMicroTasks(prev => {
      return prev.map(mt => mt.id === id ? { ...mt, completed: !mt.completed } : mt);
    });
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newMt = {
      id: `mt-custom-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    setMicroTasks(prev => [...prev, newMt]);
    setNewSubtaskTitle('');
  };

  const removeSubtask = (id: string) => {
    setMicroTasks(prev => prev.filter(mt => mt.id !== id));
  };

  const startEditSubtask = (id: string, currentTitle: string) => {
    setEditingSubtaskId(id);
    setEditingSubtaskText(currentTitle);
  };

  const saveEditSubtask = (id: string) => {
    if (!editingSubtaskText.trim()) return;
    setMicroTasks(prev => prev.map(mt => mt.id === id ? { ...mt, title: editingSubtaskText.trim() } : mt));
    setEditingSubtaskId(null);
  };

  const reorderSubtask = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= microTasks.length) return;
    
    const updated = [...microTasks];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setMicroTasks(updated);
  };

  // --- STATS CALCULATION ---
  const currentLevel = useMemo(() => {
    return Math.floor(Math.sqrt(focusXP / 100)) + 1;
  }, [focusXP]);

  const progressToNextLevel = useMemo(() => {
    const currentLevelBaseXP = Math.pow(currentLevel - 1, 2) * 100;
    const nextLevelXP = Math.pow(currentLevel, 2) * 100;
    const levelRange = nextLevelXP - currentLevelBaseXP;
    const levelXP = focusXP - currentLevelBaseXP;
    return levelRange > 0 ? Math.round((levelXP / levelRange) * 100) : 0;
  }, [focusXP, currentLevel]);

  const totalFocusHoursAllTime = useMemo(() => {
    const mins = focusHistory.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    return (mins / 60).toFixed(1);
  }, [focusHistory]);

  const averageSessionMinutes = useMemo(() => {
    if (focusHistory.length === 0) return 0;
    const total = focusHistory.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    return Math.round(total / focusHistory.length);
  }, [focusHistory]);

  const allTimeCompletionRate = useMemo(() => {
    if (focusHistory.length === 0) return 100;
    const totalSubtasks = focusHistory.reduce((acc, curr) => acc + curr.subtasksTotal, 0);
    const completedSubtasks = focusHistory.reduce((acc, curr) => acc + curr.subtasksCompleted, 0);
    if (totalSubtasks === 0) return 100;
    return Math.round((completedSubtasks / totalSubtasks) * 100);
  }, [focusHistory]);

  // --- AUTOSAVE NOTES ---
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setFocusNotes(val);
    setIsNotesSaving(true);
    
    // Simulating instant debounce autosave
    localStorage.setItem('lifepilot_focus_notes', val);
    setTimeout(() => {
      setIsNotesSaving(false);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setNotesSaveTime(timeStr);
    }, 600);
  };

  // --- DYNAMIC VISUAL PERCENTAGE CIRCLE ---
  const percentage = (timeLeft / totalDuration) * 100;
  const strokeDashoffset = 2 * Math.PI * 110 * (1 - percentage / 100);

  // Badge list check
  const gamificationBadges = [
    { id: 'badge-1', name: 'First Session', icon: '🏆', unlocked: focusHistory.length >= 1, desc: 'Complete your first high focus cycle' },
    { id: 'badge-2', name: '3 Day Warrior', icon: '🔥', unlocked: longestStreak >= 3, desc: 'Maintain focus streaks for 3 consecutive days' },
    { id: 'badge-3', name: '10 Hours Focused', icon: '⚡', unlocked: parseFloat(totalFocusHoursAllTime) >= 10, desc: 'Exceed 10 cumulative deep work hours' },
    { id: 'badge-4', name: 'Weekend Warrior', icon: '🚀', unlocked: focusHistory.some(s => {
      const day = new Date(s.timestamp).getDay();
      return day === 0 || day === 6;
    }), desc: 'Maintain momentum over the weekend' },
    { id: 'badge-5', name: 'Deep Worker', icon: '🧠', unlocked: focusHistory.some(s => s.durationMinutes >= 50), desc: 'Successfully finish any 50m focus block' },
  ];

  return (
    <div className={`space-y-6 max-w-7xl mx-auto selection:bg-indigo-300 selection:text-slate-900 transition-all ${
      isFlowMode ? 'p-0 sm:p-2 bg-slate-950 text-white min-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-white/5' : ''
    }`}>
      
      {/* --- NORMAL MODE HEADER --- */}
      {!isFlowMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Timer className="text-indigo-600 animate-pulse" /> Focus Studio & Deep Coach
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Flow state automation with real-time browser audio synthesis, AI breakdown, and distraction scores.
            </p>
          </div>

          {/* XP Progression Gauge */}
          <div className="flex items-center gap-3 p-3 bg-white/5 dark:bg-slate-900/40 border border-white/10 dark:border-white/5 rounded-2xl">
            <div className="text-2xl">🏆</div>
            <div className="space-y-1 min-w-[120px]">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono font-black text-slate-500 dark:text-slate-400">
                <span>LVL {currentLevel}</span>
                <span>{focusXP} XP</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden w-36">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progressToNextLevel}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOW MODE HEADER (MINIMAL CLUTTER) --- */}
      {isFlowMode && (
        <div className="flex items-center justify-between p-4 bg-slate-900/60 border-b border-white/5 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">FLOW ACTIVE</span>
          </div>
          <div className="text-center">
            <span className="text-xs font-bold text-slate-400">
              Active Focus: <span className="text-white">{selectedTaskTitle || 'Ambient Session'}</span>
            </span>
          </div>
          <button 
            onClick={() => setIsFlowMode(false)}
            className="flex items-center gap-1 text-[10px] uppercase font-mono bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-xl hover:bg-indigo-500/25 transition-all font-black"
          >
            <Maximize2 size={12} /> Exit Flow State
          </button>
        </div>
      )}

      {/* --- MAIN SPLIT CONTAINER --- */}
      <div className={`grid grid-cols-1 ${isFlowMode ? 'lg:grid-cols-12 p-6 sm:p-8' : 'lg:grid-cols-12'} gap-6`}>
        
        {/* LEFT COLUMN: THE CENTRAL TIMER & SOUND CONTROL */}
        <div className={`${isFlowMode ? 'lg:col-span-6' : 'lg:col-span-7'} flex flex-col space-y-6`}>
          
          {/* Main Visual Timer Box */}
          <div className={`backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col items-center justify-center space-y-6 relative overflow-hidden transition-colors ${
            isFlowMode 
              ? 'bg-slate-900/30' 
              : 'bg-white/40 dark:bg-slate-950/60 shadow-xl'
          }`}>
            
            {/* Soft ambient background radial gradient glow */}
            <div className={`absolute top-0 left-0 right-0 bottom-0 pointer-events-none opacity-20 filter blur-3xl transition-all duration-1000 ${
              isTimerRunning 
                ? (timerPhase === 'work' ? 'bg-indigo-600/30' : 'bg-emerald-600/30') 
                : 'bg-slate-500/10'
            }`} />

            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                {timerPhase === 'work' ? (
                  <span className="text-xs font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
                    <Sun size={12} /> Work Period
                  </span>
                ) : (
                  <span className="text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                    <Coffee size={12} /> Break Period
                  </span>
                )}
              </div>
              
              {!isFlowMode && (
                <button 
                  onClick={() => setIsFlowMode(true)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all font-semibold"
                  title="Enable Minimalist Focus Mode"
                >
                  <Minimize2 size={14} /> Minimal Flow Mode
                </button>
              )}
            </div>

            {/* Selected Active Task Details */}
            <div className="w-full max-w-md text-center space-y-1">
              {!isFlowMode ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-500">
                    Active Focus Target
                  </label>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => handleTaskSelect(e.target.value)}
                    id="focus-target-select"
                    className="w-full backdrop-blur-md bg-white/40 dark:bg-slate-900/60 hover:bg-white/60 dark:hover:bg-slate-900/80 border border-white/20 dark:border-white/10 rounded-2xl py-3 px-4 outline-none text-slate-800 dark:text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <option value="" className="text-slate-900">-- Click to lock in focus target --</option>
                    {activeTasks.map(t => (
                      <option key={t.id} value={t.id} className="text-slate-900">{t.title} ({t.complexity})</option>
                    ))}
                  </select>
                  {!isTimerRunning && (
                    <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-2 flex flex-col items-center justify-center gap-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Ready to enter deep work?</span>
                      <span className="text-slate-500 text-[10px]">Select a task. Start session.</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Currently Executing</span>
                  <p className="text-sm font-black text-white mt-1">
                    {selectedTaskTitle || 'General Mindful Focus Session'}
                  </p>
                </div>
              )}
            </div>

            {/* HIGH-FIDELITY BIG TIMER GAUGE */}
            <motion.div 
              className="relative w-72 h-72 flex items-center justify-center cursor-pointer select-none"
              onClick={toggleTimer}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle 
                  cx="144" 
                  cy="144" 
                  r="110" 
                  className="stroke-slate-200 dark:stroke-white/5 fill-transparent" 
                  strokeWidth="10"
                />
                {/* Animated Foreground Progress Ring */}
                <motion.circle 
                  cx="144" 
                  cy="144" 
                  r="110" 
                  className={`fill-transparent transition-all duration-300 ${
                    timerPhase === 'work' ? 'stroke-indigo-600' : 'stroke-emerald-500'
                  }`} 
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 110}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="absolute flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-5xl font-display font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">
                  {isTimerRunning ? 'State: Flow' : 'State: Paused'}
                </span>
                
                {/* Micro cycle count indicators */}
                <div className="flex items-center gap-1.5 pt-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <span 
                      key={i} 
                      className={`h-2 w-2 rounded-full border border-white/10 transition-all ${
                        completedCycles >= i 
                          ? 'bg-indigo-500 shadow-md shadow-indigo-500/20' 
                          : 'bg-white/10'
                      }`} 
                      title={`Cycle ${i} of Pomodoro Block`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Pomodoro Modes & Presets */}
            {!isFlowMode && (
              <div className="w-full grid grid-cols-4 gap-2 border-t border-b border-white/5 py-4">
                {(Object.keys(pomodoroModes) as ModeType[]).map((modeKey) => (
                  <button
                    key={modeKey}
                    onClick={() => handleModeChange(modeKey)}
                    className={`py-2 px-1 rounded-2xl border text-center transition-all ${
                      currentMode === modeKey
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10 font-bold'
                        : 'bg-white/40 dark:bg-slate-900/20 border-white/15 dark:border-white/5 hover:bg-white/60 text-slate-800 dark:text-slate-300 font-semibold'
                    }`}
                  >
                    <span className="text-[11px] block">{pomodoroModes[modeKey].name}</span>
                    <span className="text-[8px] text-slate-400 block font-sans truncate">{pomodoroModes[modeKey].desc}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Custom Input controls */}
            {currentMode === 'custom' && !isFlowMode && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="w-full grid grid-cols-2 gap-4 p-3.5 bg-white/5 border border-white/5 rounded-2xl text-xs"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-mono block">Work Min ({customWorkTime}m):</span>
                  <input 
                    type="range" min="1" max="120" 
                    value={isNaN(customWorkTime) ? 25 : customWorkTime} 
                    onChange={(e) => setCustomWorkTime(parseInt(e.target.value) || 25)}
                    onMouseUp={handleCustomTimeApply}
                    onTouchEnd={handleCustomTimeApply}
                    className="w-full accent-indigo-500 cursor-ew-resize"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-mono block">Break Min ({customBreakTime}m):</span>
                  <input 
                    type="range" min="1" max="60" 
                    value={isNaN(customBreakTime) ? 10 : customBreakTime} 
                    onChange={(e) => setCustomBreakTime(parseInt(e.target.value) || 10)}
                    onMouseUp={handleCustomTimeApply}
                    onTouchEnd={handleCustomTimeApply}
                    className="w-full accent-emerald-500 cursor-ew-resize"
                  />
                </div>
              </motion.div>
            )}

            {/* ACTION TRIGGERS BAR */}
            <div className="flex items-center gap-4">
              {/* Reset button */}
              <button
                onClick={resetTimer}
                className="p-3.5 bg-white/5 hover:bg-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 rounded-2xl border border-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                title="Reset active cycle"
              >
                <RotateCcw size={16} />
              </button>

              {/* Central Play/Pause */}
              <button
                onClick={toggleTimer}
                className={`
                  p-5 text-white rounded-3xl shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95
                  ${isTimerRunning 
                    ? 'bg-slate-950 shadow-slate-950/15' 
                    : 'bg-indigo-600 shadow-indigo-600/20 hover:shadow-indigo-600/30'
                  }
                `}
                title={isTimerRunning ? 'Pause Session' : 'Start Session'}
              >
                {isTimerRunning ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
              </button>

              {/* Skip break or force finish */}
              {timerPhase === 'break' ? (
                <button
                  onClick={skipBreak}
                  className="px-4 py-3 bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-black hover:bg-emerald-600/25 transition-all"
                  title="Skip Break"
                >
                  Skip Break
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={forceEndSession}
                    className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-black hover:bg-rose-500/20 transition-all"
                    title="Finish and compile summary statistics"
                  >
                    End Session
                  </button>
                  <button
                    onClick={handleSkipFocusSession}
                    className="px-4 py-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl text-xs font-black hover:bg-amber-500/25 transition-all flex items-center gap-1 active:scale-95"
                    title="Skip session & activate Procrastination Coach"
                    id="btn-skip-focus-session"
                  >
                    <span>Skip Session</span>
                  </button>
                </div>
              )}
            </div>

            {/* Active Live AI Focus Coach notification block */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={coachMsgIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300 shadow-inner"
              >
                <div className="p-1.5 bg-indigo-500/15 text-indigo-400 rounded-lg shrink-0 mt-0.5">
                  <Smile size={12} className="animate-spin-slow" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono uppercase font-black tracking-widest text-indigo-400">Deep Coach Intervention</span>
                  <p className="leading-relaxed font-medium italic">"{coachMessages[coachMsgIndex]}"</p>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* AMBIENT SOUND CONTROLLER PANEL */}
          <div className={`backdrop-blur-xl rounded-3xl p-6 border border-white/10 space-y-6 shadow-xl transition-colors ${
            isFlowMode ? 'bg-slate-900/30' : 'bg-white/40 dark:bg-slate-950/60'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                <Volume2 size={14} className={isAudioPlaying ? 'animate-bounce' : ''} /> Intelligent Sound Environment
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Generative Web Audio API</span>
            </div>

            {/* Grid of 15 Soundscapes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {soundscapesList.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => {
                    if (soundscape === sound.id) {
                      setIsAudioPlaying(!isAudioPlaying);
                    } else {
                      setSoundscape(sound.id);
                      setIsAudioPlaying(true);
                    }
                  }}
                  className={`relative p-3 rounded-2xl border text-left transition-all group flex flex-col justify-between min-h-[85px] cursor-pointer ${
                    soundscape === sound.id
                      ? 'bg-indigo-600/10 dark:bg-indigo-500/10 border-indigo-500 text-slate-900 dark:text-white shadow-lg shadow-indigo-500/5'
                      : 'bg-white/40 dark:bg-slate-900/20 border-white/10 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 hover:bg-white/60 dark:hover:bg-slate-900/30 text-slate-800 dark:text-slate-300'
                  }`}
                >
                  {/* AI Recommended Badge */}
                  {recommendedSoundscape === sound.id && (
                    <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 text-[8px] text-white font-mono font-black px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-0.5 z-10 border border-white/20">
                      <Sparkles size={8} /> AI
                    </span>
                  )}

                  <div className="flex items-start justify-between w-full">
                    <div className="text-xl">{sound.emoji}</div>
                    {/* Equalizer animation when playing */}
                    {soundscape === sound.id && isAudioPlaying && (
                      <div className="flex items-end gap-0.5 h-3">
                        <span className="w-0.5 bg-indigo-500 animate-[bounce_0.8s_infinite_100ms] rounded-full h-full" />
                        <span className="w-0.5 bg-indigo-500 animate-[bounce_0.8s_infinite_300ms] rounded-full h-2/3" />
                        <span className="w-0.5 bg-indigo-500 animate-[bounce_0.8s_infinite_200ms] rounded-full h-4/5" />
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5 space-y-0.5">
                    <span className="text-xs font-bold block truncate">{sound.label}</span>
                    <span className="text-[9px] text-slate-400 font-mono block truncate">{sound.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Active Soundscape Details & Live Playback Control */}
            {soundscape !== 'silent' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-indigo-500/15 via-rose-500/10 to-transparent border border-indigo-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl animate-pulse">
                    {soundscapesList.find(s => s.id === soundscape)?.emoji || '🎵'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        Playing: {soundscapesList.find(s => s.id === soundscape)?.label || soundscape}
                      </h4>
                      {recommendedSoundscape === soundscape && (
                        <span className="bg-amber-500/10 text-amber-500 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-amber-500/20">
                          <Sparkles size={8} /> RECOMMENDED
                        </span>
                      )}
                      <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-500/20">
                        🔁 LOOPING
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {soundscapesList.find(s => s.id === soundscape)?.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Local Play/Pause button */}
                  <button
                    onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isAudioPlaying 
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25' 
                        : 'bg-indigo-650 border-indigo-500 text-white hover:bg-indigo-500 shadow-md'
                    }`}
                    title={isAudioPlaying ? 'Pause Audio' : 'Play Audio'}
                  >
                    {isAudioPlaying ? <Pause size={12} /> : <Play size={12} />}
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2 flex-1 sm:w-32">
                    <span className="text-[9px] font-mono text-slate-500">VOL</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isNaN(audioVolume) ? 0.5 : audioVolume}
                      onChange={(e) => setAudioVolume(parseFloat(e.target.value) || 0)}
                      className="w-full accent-indigo-500 cursor-ew-resize h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none"
                    />
                    <span className="text-[9px] font-mono text-slate-400 min-w-[24px] text-right">
                      {Math.round(audioVolume * 100)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {soundscape === 'silent' && (
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">📴 Sound Environment is set to Silent</span>
                <span className="text-[10px] font-mono text-slate-500">Choose a soundscape above to begin synthesizing</span>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: AI MICRO ACTION CHECKLIST & NOTES & ANALYTICS */}
        <div className={`${isFlowMode ? 'lg:col-span-6' : 'lg:col-span-5'} flex flex-col space-y-6`}>
          
          {/* AI Task Decomposition Panel */}
          <div className={`backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col justify-between transition-colors ${
            isFlowMode ? 'bg-slate-900/30' : 'bg-white/40 dark:bg-slate-950/60'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/15 text-indigo-400 rounded-lg">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-display font-black text-slate-900 dark:text-white">AI Micro Steps Decomposition</h2>
                    <p className="text-[10px] text-slate-500">Atomic milestones tracking</p>
                  </div>
                </div>
                {selectedTaskTitle && (
                  <button
                    onClick={() => regenerateDecomposition()}
                    disabled={isGenerating}
                    className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/25 transition-all text-xs"
                    title="Regenerate subtask steps using Gemini"
                  >
                    <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} />
                  </button>
                )}
              </div>

              {/* Generator Loader */}
              {isGenerating ? (
                <div className="py-14 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-650 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500 font-medium">Decomposing task into actionable subtasks...</p>
                </div>
              ) : microTasks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CheckSquare size={36} className="mx-auto text-slate-300" />
                  <p className="text-xs leading-relaxed max-w-xs mx-auto">
                    Choose a focus target in the dropdown menu to trigger automated AI sequential breakdown.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Progression Percentage Bar */}
                  <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Actionable Progress Completion Rate</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {Math.round((microTasks.filter(m => m.completed).length / microTasks.length) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${(microTasks.filter(m => m.completed).length / microTasks.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* List of subtasks */}
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {microTasks.map((mt, index) => (
                      <div 
                        key={mt.id}
                        className={`group p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                          mt.completed 
                            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-900 dark:text-emerald-300' 
                            : 'bg-white/30 dark:bg-slate-900/20 border-white/10 dark:border-white/5 hover:bg-white/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Checkbox trigger */}
                          <button
                            onClick={() => toggleMicroTask(mt.id)}
                            className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              mt.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400 hover:border-indigo-500'
                            }`}
                          >
                            {mt.completed && (
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                              </svg>
                            )}
                          </button>

                          {/* Editable field */}
                          <div className="flex flex-col flex-1 min-w-0">
                            {editingSubtaskId === mt.id ? (
                              <input
                                type="text"
                                value={editingSubtaskText}
                                onChange={(e) => setEditingSubtaskText(e.target.value)}
                                onBlur={() => saveEditSubtask(mt.id)}
                                onKeyDown={(e) => e.key === 'Enter' && saveEditSubtask(mt.id)}
                                className="bg-white/10 border-b border-indigo-500 outline-none text-xs font-semibold py-0.5 px-1 w-full text-slate-800 dark:text-white"
                                autoFocus
                              />
                            ) : (
                              <span 
                                onClick={() => startEditSubtask(mt.id, mt.title)}
                                className={`text-xs leading-normal font-semibold cursor-text break-words whitespace-normal ${
                                  mt.completed ? 'line-through opacity-60 text-slate-500' : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {mt.title}
                              </span>
                            )}

                            {/* Metadata badges: Duration & Difficulty */}
                            {(mt.duration || mt.difficulty) && (
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {mt.duration && (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium">
                                    <Clock size={10} className="shrink-0" />
                                    {mt.duration}
                                  </span>
                                )}
                                {mt.difficulty && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                                    mt.difficulty.toLowerCase() === 'easy' 
                                      ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                      : mt.difficulty.toLowerCase() === 'hard' 
                                      ? 'bg-rose-100 dark:bg-rose-550/10 text-rose-600 dark:text-rose-400' 
                                      : 'bg-amber-100 dark:bg-amber-550/10 text-amber-600 dark:text-amber-400'
                                  }`}>
                                    {mt.difficulty}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order & Remove actions on hover */}
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => reorderSubtask(index, 'up')} 
                            disabled={index === 0}
                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 text-slate-400 hover:text-indigo-400"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button 
                            onClick={() => reorderSubtask(index, 'down')} 
                            disabled={index === microTasks.length - 1}
                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 text-slate-400 hover:text-indigo-400"
                          >
                            <ChevronDown size={12} />
                          </button>
                          <button 
                            onClick={() => removeSubtask(mt.id)} 
                            className="p-1 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add manual subtask step */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                    <input
                      type="text"
                      placeholder="Add manual custom subtask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                      className="flex-1 bg-white/20 dark:bg-slate-900/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none placeholder:text-slate-500"
                    />
                    <button
                      onClick={addSubtask}
                      className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QUICK NOTEBOOK PANEL */}
          <div className={`backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col space-y-3 transition-colors ${
            isFlowMode ? 'bg-slate-900/30' : 'bg-white/40 dark:bg-slate-950/60'
          }`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                <PenTool size={14} /> Quick Notes & Thoughts capture
              </span>
              <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                {isNotesSaving ? (
                  <span className="text-indigo-400 animate-pulse">Autosaving...</span>
                ) : (
                  <span>Saved {notesSaveTime || 'locally'}</span>
                )}
              </span>
            </div>

            <textarea
              value={focusNotes}
              onChange={handleNotesChange}
              placeholder="Jot down active thoughts, bookmarks, or logs here. Markdown is fully preserved and autosaved in real-time."
              className="w-full h-24 bg-white/10 dark:bg-slate-900/30 border border-white/15 dark:border-white/5 rounded-2xl p-3 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 font-sans resize-none"
            />
          </div>

          {/* SESSION HISTORIC STATISTICS CARD (HIDDEN IN FLOW MODE) */}
          {!isFlowMode && (
            <div className="backdrop-blur-xl bg-white/40 dark:bg-slate-950/60 rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-display font-black text-slate-900 dark:text-white">Active Session Analytics</h3>
                  <p className="text-[10px] text-slate-500">Compounded historical metrics</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase font-mono block">Today's Focus</span>
                  <span className="text-base font-black text-slate-800 dark:text-slate-100 block">{totalFocusHoursAllTime}h</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase font-mono block">Average Duration</span>
                  <span className="text-base font-black text-slate-800 dark:text-slate-100 block">{averageSessionMinutes}m</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase font-mono block">Task Completion Rate</span>
                  <span className="text-base font-black text-slate-800 dark:text-slate-100 block">{allTimeCompletionRate}%</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase font-mono block">Focus Streak</span>
                  <span className="text-base font-black text-amber-500 flex items-center justify-center gap-0.5">
                    <Flame size={14} /> {focusStreak} days
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono text-center border-t border-white/5 pt-2 flex justify-between">
                <span>Peak Window: <span className="text-emerald-400">6 PM–9 PM</span></span>
                <span>Longest Streak: <span className="text-amber-300 font-bold">{longestStreak}d</span></span>
              </div>
            </div>
          )}

          {/* BADGES PROGRESS BAR (HIDDEN IN FLOW MODE) */}
          {!isFlowMode && (
            <div className="backdrop-blur-xl bg-white/40 dark:bg-slate-950/60 rounded-3xl p-6 border border-white/10 shadow-xl space-y-3">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                <Trophy size={14} /> Focus Milestone Badges
              </span>
              
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {gamificationBadges.map((badge) => (
                  <div 
                    key={badge.id}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border min-w-[100px] text-center space-y-1.5 transition-all ${
                      badge.unlocked 
                        ? 'bg-slate-900 border-amber-500/20 text-white' 
                        : 'bg-white/20 dark:bg-slate-900/10 border-white/5 opacity-40'
                    }`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <span className="text-[10px] font-black block truncate w-[80px]">{badge.name}</span>
                      <span className="text-[8px] text-slate-500 block leading-tight">{badge.unlocked ? 'Unlocked' : 'Locked'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* --- POST-SESSION SUMMARY MODAL --- */}
      <AnimatePresence>
        {showSummary && lastSessionSummary && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-md w-full space-y-6 text-white shadow-2xl"
            >
              <div className="text-center space-y-1">
                <div className="text-5xl animate-bounce">🏆</div>
                <h2 className="text-xl font-display font-black uppercase tracking-wider text-amber-400">Session Complete!</h2>
                <p className="text-xs text-slate-400">Excellent effort on your deep focus journey</p>
              </div>

              {/* Focus evaluation pill */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Focus State Evaluation:</span>
                <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                  lastSessionSummary.evaluation === 'Excellent' ? 'bg-emerald-500/20 text-emerald-300' :
                  lastSessionSummary.evaluation === 'Good' ? 'bg-indigo-500/20 text-indigo-300' :
                  lastSessionSummary.evaluation === 'Moderate' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {lastSessionSummary.evaluation}
                </span>
              </div>

              {/* Structured Metrics Table */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Focus Duration</span>
                  <span className="text-lg font-black text-indigo-300">{lastSessionSummary.duration} mins</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Microtasks Finished</span>
                  <span className="text-lg font-black text-emerald-400">{lastSessionSummary.subtasksDone} / {lastSessionSummary.subtasksTotal}</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Focus Score</span>
                  <span className="text-lg font-black text-amber-400">{lastSessionSummary.focusScore} / 100</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">XP Gained</span>
                  <span className="text-lg font-black text-indigo-400">+{lastSessionSummary.xpGained} XP</span>
                </div>
              </div>

              {/* Recommendation message */}
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-1 text-xs">
                <span className="text-indigo-400 font-mono uppercase tracking-widest font-black block">Coach Recommendation:</span>
                <p className="text-slate-300 leading-relaxed">
                  {lastSessionSummary.nextStep} Keep your streak count increasing!
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowSummary(false)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                Let's Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
