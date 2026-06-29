import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Mic, History, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export const VoiceAssistantView: React.FC = () => {
  const { 
    messages, isRecording, setIsRecording, sendAssistantMessage, 
    isAssistantLoading, clearAssistantHistory, setIsAssistantOpen 
  } = useApp();

  const [inputText, setInputText] = useState('');

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendAssistantMessage(inputText);
    setInputText('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto selection:bg-indigo-500/20 pb-16">
      <div className="border-b border-slate-100 dark:border-white/5 pb-4">
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <Sparkles className="text-indigo-600 dark:text-indigo-400 animate-pulse" size={24} />
          <span>Vocal Intelligence Companion</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
          Interact with LifePilot hands-free using advanced real-time voice recognition and speech synthesis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Wave & Control */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl flex flex-col items-center justify-between text-center min-h-[350px]">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Companion Status</span>
              <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 text-sm">
                {isRecording ? 'Listening carefully...' : isAssistantLoading ? 'Processing request...' : 'Waiting for voice...'}
              </h3>
            </div>

            {/* Pulsing visualizer circle */}
            <div className="relative flex items-center justify-center my-6">
              {isRecording && (
                <>
                  <div className="absolute w-36 h-36 rounded-full bg-indigo-500/20 animate-ping" />
                  <div className="absolute w-28 h-28 rounded-full bg-indigo-500/30 animate-pulse" />
                </>
              )}
              {isAssistantLoading && (
                <div className="absolute w-28 h-28 rounded-full border-4 border-dashed border-indigo-500 animate-spin" />
              )}
              <button
                onClick={() => {
                  setIsAssistantOpen(true);
                  setIsRecording(!isRecording);
                }}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl relative z-10 transition-transform active:scale-95 cursor-pointer ${
                  isRecording 
                    ? 'bg-gradient-to-tr from-rose-500 to-red-600' 
                    : 'bg-gradient-to-tr from-indigo-500 to-purple-600 hover:scale-105'
                }`}
              >
                <Mic size={32} className={isRecording ? 'animate-pulse' : ''} />
              </button>
            </div>

            <div className="space-y-3 w-full">
              <button
                onClick={() => setIsAssistantOpen(true)}
                className="w-full text-center py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Show Floating Chat Drawer
              </button>
              
              <button
                onClick={clearAssistantHistory}
                className="w-full text-center py-2 text-slate-400 hover:text-rose-500 text-[10px] font-mono tracking-wider uppercase cursor-pointer"
              >
                Clear Conversation Logs
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dialogue Transcription & Commands */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl flex flex-col h-[350px]">
            <div className="border-b border-slate-100 dark:border-white/5 pb-3 mb-4 flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm flex items-center space-x-2">
                <History size={16} className="text-slate-400" />
                <span>Vocal Dialogue History</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Total logs: {messages.length}</span>
            </div>

            {/* Conversation Log bubbles */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-100 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-200/30'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 text-[10px] font-mono bg-white/10 p-1.5 rounded-lg text-indigo-200 dark:text-indigo-300 flex items-center justify-between">
                        <span>Action: {msg.actions[0].type}</span>
                        <span className="uppercase text-[9px] font-bold px-1 rounded bg-indigo-500/30">{msg.actionStatus || 'applied'}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
                  <span>✨</span>
                  <span>Say "Hey LifePilot" or click the Mic to begin.</span>
                </div>
              )}
            </div>

            {/* Optional Text input for accessibility */}
            <form onSubmit={handleSendText} className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex space-x-2 shrink-0">
              <input
                type="text"
                placeholder="Type a vocal command..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Recommended commands bento */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm flex items-center space-x-2">
          <Cpu size={16} className="text-indigo-500" />
          <span>Recommended Vocal Commands</span>
        </h3>
        <p className="text-xs text-slate-400">LifePilot AI handles complex NLP prompts, updating your habits, calendar, and focus systems in real time.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {[
            { title: '📅 Schedule Events', phrase: '"Schedule DSA Practice tomorrow at 4 PM for 2 hours"', desc: 'Parses times, titles, and intervals to update your Smart Calendar.' },
            { title: '⚡ Complete Tasks', phrase: '"Set Hackathon MVP task to completed"', desc: 'Instantly completes tasks and adds +20 XP to your level progression.' },
            { title: '🔥 Focus Sprints', phrase: '"Start a 25 minute focus session"', desc: 'Triggers the Pomodoro timer in focus mode with personalized ambient audio.' }
          ].map((item, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
              <p className="font-mono text-indigo-600 dark:text-indigo-400 font-bold text-[11px] leading-relaxed">{item.phrase}</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
