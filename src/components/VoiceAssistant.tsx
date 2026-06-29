/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Send, Mic, MicOff, X, ArrowDownRight, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const VoiceAssistant: React.FC = () => {
  const { 
    messages, isAssistantOpen, setIsAssistantOpen, isRecording, 
    setIsRecording, sendAssistantMessage, isAssistantLoading, clearAssistantHistory,
    executeAssistantAction, updateMessageActionStatus, setActiveTab
  } = useApp();

  const [input, setInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAssistantOpen, isAssistantLoading]);

  // Cleanup timers and speech on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const resetSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      console.log('Speech recognition: stopping automatically due to silence.');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }, 4500); // Stop automatically after 4.5 seconds of silence
  };

  const handleMicToggle = async () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setErrorMsg('Speech recognition is not supported in this browser. Please use Chrome, Safari, or Microsoft Edge.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Failed to stop speech recognition:', e);
        }
      }
      setIsRecording(false);
      clearSilenceTimer();
    } else {
      setInput('');
      setErrorMsg(null);
      try {
        // Explicitly request microphone access correctly
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        
        // Setup new speech recognition instance to clear stale state
        const rec = new SpeechRecognitionClass();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsRecording(true);
          setErrorMsg(null);
          resetSilenceTimer();
        };

        rec.onresult = (event: any) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; ++i) {
            fullTranscript += event.results[i][0].transcript;
          }
          if (fullTranscript) {
            setInput(fullTranscript);
          }
          resetSilenceTimer();
        };

        rec.onerror = (event: any) => {
          clearSilenceTimer();
          if (event.error === 'no-speech' || event.error === 'aborted') {
            setIsRecording(false);
            return;
          }
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setErrorMsg('Microphone access denied. Please click the "Open in new tab" button on the top right to grant microphone permission directly.');
          } else {
            setErrorMsg(`Microphone error: ${event.error}`);
          }
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
          clearSilenceTimer();
        };

        recognitionRef.current = rec;
        recognitionRef.current.start();
      } catch (err: any) {
        console.error('Failed to start speech recognition:', err);
        if (err.name === 'NotAllowedError' || err.message?.includes('denied')) {
          setErrorMsg('Microphone access denied. Please click the "Open in new tab" button on the top right to grant microphone permission directly.');
        } else {
          setErrorMsg(`Microphone error: ${err.message || err}`);
        }
        setIsRecording(false);
        clearSilenceTimer();
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const text = input;
    setInput('');
    await sendAssistantMessage(text);
  };

  const handleConfirmActions = async (msgId: string, actions: any[]) => {
    const feedbacks: string[] = [];
    for (const act of actions) {
      const res = await executeAssistantAction(act);
      feedbacks.push(res.feedback);
    }
    updateMessageActionStatus(msgId, 'confirmed', feedbacks);
  };

  const handleCancelActions = (msgId: string) => {
    updateMessageActionStatus(msgId, 'cancelled');
  };

  const handleSuggestionClick = async (sug: string) => {
    // Intercept layouts and dashboard switches for ultra-fast response
    if (sug.includes('Start Focus Mode')) {
      setActiveTab('focus');
      return;
    }
    if (sug.includes('Open Calendar')) {
      setActiveTab('calendar');
      return;
    }
    if (sug.includes('View Dashboard')) {
      setActiveTab('dashboard');
      return;
    }
    if (sug.includes('Continue Learning Roadmap') || sug.includes('Continue Roadmap')) {
      setActiveTab('growth');
      return;
    }
    if (sug.includes('Ask Another Question')) {
      const inputEl = document.querySelector('input[placeholder="Type or ask copilot..."]') as HTMLInputElement;
      if (inputEl) {
        inputEl.focus();
      }
      return;
    }
    
    await sendAssistantMessage(sug);
  };

  if (!isAssistantOpen) {
    return (
      /* FLOATING AI ICON TRIGGER */
      <button
        onClick={() => setIsAssistantOpen(true)}
        id="btn-voice-assistant-trigger"
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-tr from-indigo-650 to-indigo-750 hover:from-indigo-700 hover:to-indigo-850 text-white p-4.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 group flex items-center justify-center border border-white/20"
        title="Open Voice Companion"
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform animate-spin-slow" />
        <span className="absolute right-full mr-3 bg-slate-950/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl shadow-slate-950/20 font-mono tracking-wider uppercase">
          AI LifePilot Copilot
        </span>
      </button>
    );
  }

  return (
    /* CHAT PANEL SIDEBAR */
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden animate-slide-in">
      
      {/* Panel Header */}
      <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm leading-none">LifePilot Copilot Brain</h3>
            <span className="text-[10px] text-slate-400 font-mono">Context-Aware AI Assistant</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button 
            onClick={clearAssistantHistory}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset Conversation"
          >
            <RefreshCw size={14} />
          </button>
          <button 
            onClick={() => setIsAssistantOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
            title="Close Companion"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950/50">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col max-w-[90%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
          >
            <div className={`
              p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-xs backdrop-blur-xs
              ${msg.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'}
            `}>
              {msg.sender === 'user' ? (
                <p className="whitespace-pre-wrap font-semibold">{msg.text}</p>
              ) : (
                <div className="markdown-body prose dark:prose-invert prose-xs max-w-none text-xs md:text-sm space-y-2">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}

              {/* Action proposal and execution cards */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-3.5 pt-2.5 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                  {/* PENDING CONFIRMATION CARD */}
                  {msg.actionStatus === 'pending' && (
                    <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 p-3 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block font-mono">
                        ⚡ Proposed LifePilot Action
                      </span>
                      <div className="space-y-1.5 max-w-full">
                        {msg.actions.map((act, i) => (
                          <div key={i} className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-start space-x-1.5">
                            <span className="text-amber-500 shrink-0 mt-0.5">➔</span>
                            <span>
                              {act.type === 'ADD_TASK' && `Create Task: "${act.payload.title}" (${act.payload.priority} Priority, Due ${act.payload.deadline})`}
                              {act.type === 'ADD_COMMITMENT' && `Add Recurring Bill: "${act.payload.title}" (${act.payload.amount}, Due ${act.payload.dueDate})`}
                              {act.type === 'ADD_GOAL' && `Set Growth Goal: "${act.payload.title}" (Due ${act.payload.deadline})`}
                              {act.type === 'ADD_HABIT' && `Build Daily Habit: "${act.payload.title}"`}
                              {act.type === 'ACTIVATE_PANIC' && `Activate Panic Mode for "${act.payload.deadlineTitle}"`}
                              {act.type === 'GENERATE_ROADMAP' && `Generate Custom Syllabus for "${act.payload.topic}"`}
                              {act.type === 'DELETE_HABIT' && `Delete Habit: "${act.payload.title}"`}
                              {act.type === 'DELETE_TASK' && `Delete Task: "${act.payload.title}"`}
                              {act.type === 'UPDATE_TASK_PROGRESS' && `Mark "${act.payload.title}" as ${act.payload.status || 'Done'}`}
                              {act.type === 'UPDATE_GOAL_PROGRESS' && `Set Progress of Goal "${act.payload.title}" to ${act.payload.progress}%`}
                              {act.type === 'RESCHEDULE_TASK' && `Reschedule Task "${act.payload.title}" to ${act.payload.deadline}`}
                              {act.type === 'START_FOCUS_MODE' && `Initiate Pomodoro Focus Mode`}
                              {act.type === 'NAVIGATE_TAB' && `Navigate to "${act.payload.tab}" module`}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleConfirmActions(msg.id, msg.actions!)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 px-2.5 rounded-lg shadow-xs cursor-pointer select-none transition-all active:scale-95"
                        >
                          ✅ Confirm & Apply
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancelActions(msg.id)}
                          className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold py-1.5 px-2.5 rounded-lg cursor-pointer select-none transition-all active:scale-95"
                        >
                          ❌ Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CANCELLED ACTION CARD */}
                  {msg.actionStatus === 'cancelled' && (
                    <div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 p-2.5 rounded-xl flex items-center space-x-1.5">
                      <span className="text-slate-400">❌</span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                        Proposed system actions declined by user.
                      </span>
                    </div>
                  )}

                  {/* CONFIRMED & EXECUTED CARD */}
                  {msg.actionStatus === 'confirmed' && msg.actionFeedbacks && (
                    <div className="space-y-2">
                      {msg.actionFeedbacks.map((fb, idx) => (
                        <div key={idx} className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl text-[11px] font-medium text-emerald-800 dark:text-emerald-400 space-y-1">
                          <ReactMarkdown>{fb}</ReactMarkdown>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'ai' && msg.suggestions && msg.suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-full">
                {msg.suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(sug)}
                    className="text-[10px] md:text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-200 dark:hover:border-indigo-800/60 py-1.5 px-3 rounded-xl transition-all shadow-xs cursor-pointer select-none active:scale-95"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isAssistantLoading && (
          <div className="flex flex-col max-w-[85%] mr-auto items-start">
            <div className="p-3.5 backdrop-blur-md bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none shadow-xs flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-bold font-mono">Synthesizing strategic coaching advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-t border-rose-100 dark:border-rose-900/30 text-xs flex justify-between items-center font-semibold">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded shadow-xs cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Mic listening overlay */}
      {isRecording && (
        <div className="p-4 bg-indigo-500/10 dark:bg-indigo-500/5 border-t border-indigo-100 dark:border-indigo-900/30 flex flex-col items-center justify-center space-y-2 text-center animate-pulse">
          <div className="p-3 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg relative">
            <Mic size={20} className="animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
          </div>
          <span className="text-xs font-bold text-indigo-950 dark:text-indigo-400">Microphone Input Active</span>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 max-w-xs leading-relaxed font-semibold">
            I am listening in real-time. Speak your query and click the microphone button again or pause to stop.
          </p>
        </div>
      )}

      {/* Quick speech cues list */}
      {!isRecording && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-nowrap overflow-x-auto gap-2 scrollbar-none select-none">
          {["Plan my day", "Start Focus Mode", "What should I do today?", "Schedule Python goal"].map((cue, idx) => (
            <button
              key={idx}
              onClick={() => setInput(cue)}
              className="text-[10px] font-bold text-slate-700 dark:text-slate-300 backdrop-blur-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 py-1.5 px-2.5 rounded-lg whitespace-nowrap shrink-0 transition-colors shadow-xs cursor-pointer"
            >
              🎤 {cue}
            </button>
          ))}
        </div>
      )}

      {/* Input controls */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2 bg-white dark:bg-slate-900 backdrop-blur-md">
        <button
          type="button"
          onClick={handleMicToggle}
          className={`
            p-3.5 rounded-2xl shrink-0 transition-all shadow-xs cursor-pointer
            ${isRecording 
              ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/20' 
              : 'backdrop-blur-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}
          `}
          title={isRecording ? "Stop Listening" : "Start Listening"}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isRecording ? 'Listening live...' : 'Type or ask copilot...'}
          className="flex-1 backdrop-blur-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 rounded-2xl py-2.5 px-3.5 outline-none text-slate-800 dark:text-slate-100 text-xs md:text-sm font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />

        <button
          type="submit"
          disabled={!input.trim()}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center shrink-0 transition-all duration-150 shadow-sm cursor-pointer"
        >
          <Send size={16} />
        </button>
      </form>

    </div>
  );
};
