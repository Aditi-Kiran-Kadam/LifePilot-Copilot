/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Sparkles, LogIn, ChevronRight, GraduationCap, Briefcase, Rocket } from 'lucide-react';
import { motion } from 'motion/react';

export const Onboarding: React.FC = () => {
  const { onboardUser } = useApp();
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState<'welcome' | 'signin' | 'chat'>('welcome');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const sampleBio = (role: 'student' | 'pro' | 'ent') => {
    if (role === 'student') {
      setBio("Hi, I am Aditi, a first-year B.Tech Computer Engineering student. I am currently learning Full Stack Development, C programming, and Linux. I enjoy building projects, participating in hackathons, improving my communication skills, and my goal is to become a software engineer at companies like Google or Microsoft.");
    } else if (role === 'pro') {
      setBio("Hi, I am Rajesh, a senior UI/UX designer. I am currently learning React to expand my front-end skills. I enjoy designing clean user interfaces and mentoring juniors. My goal is to transition to a Product Design Lead position at a high-growth SaaS startup within the next year.");
    } else {
      setBio("Hi, I am Sarah, founder of a green energy startup. I am currently focusing on fundraising, scaling our sales team, and building strategic partnerships. My goal is to secure our seed funding round and double our monthly active user base by Q4.");
    }
    setStage('chat');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bio.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      await onboardUser(bio);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check your network connection or API key setting.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 selection:bg-indigo-250 relative overflow-hidden">
      
      {/* Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 left-1/2 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-6 left-6 flex items-center space-x-2 z-10">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-display font-bold shadow-md">
          L
        </div>
        <span className="font-display font-bold text-slate-900 tracking-tight text-base">LifePilot Copilot</span>
      </div>

      <div className="w-full max-w-xl backdrop-blur-xl bg-white/40 rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative z-10">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-white/25 relative">
          <div 
            className="absolute left-0 top-0 h-full bg-indigo-600 transition-all duration-500 ease-out" 
            style={{ 
              width: stage === 'welcome' ? '33%' : stage === 'signin' ? '66%' : '100%' 
            }}
          />
        </div>

        <div className="p-8 md:p-10">
          {stage === 'welcome' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-700 rounded-2xl border border-indigo-500/10 shadow-sm">
                <Sparkles size={32} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight leading-none">
                  Your AI Life Copilot.
                </h1>
                <p className="text-slate-600 text-base font-semibold leading-relaxed">
                  LifePilot Copilot is an adaptive system designed to personalize your goals, schedule tasks, coach you through procrastination, and help you survive last-minute deadlines.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setStage('signin')}
                  id="btn-get-started"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/15 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <span>Get Started</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {stage === 'signin' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
                  Welcome back
                </h2>
                <p className="text-slate-600 font-semibold text-sm">
                  Access your synchronized dashboard and personalized adaptive routines.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    // Pre-populate with user details
                    setName("Aditi");
                    setEmail("kadamaditi266@gmail.com");
                    setStage('chat');
                  }}
                  id="btn-google-signin"
                  className="w-full backdrop-blur-md bg-white/40 border-2 border-white/40 hover:bg-white/60 text-slate-800 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-3 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.514 5.514 0 0 1 8.5 13a5.514 5.514 0 0 1 5.491-5.514c1.4 0 2.682.527 3.664 1.39l3.055-3.055A9.457 9.457 0 0 0 13.991 3C8.473 3 4 7.473 4 13s4.473 10 9.991 10c5.773 0 9.614-4.05 9.614-9.782 0-.663-.06-1.3-.173-1.933H12.24z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/20"></div>
                  <span className="flex-shrink mx-4 text-slate-500 text-xs tracking-wider uppercase font-mono font-bold">or email</span>
                  <div className="flex-grow border-t border-white/20"></div>
                </div>

                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full backdrop-blur-md bg-white/40 border-2 border-white/40 focus:border-indigo-500 rounded-2xl py-3 px-4 outline-none transition-all text-slate-800 text-sm font-semibold"
                  />
                  <button
                    onClick={() => {
                      if (email) setStage('chat');
                    }}
                    disabled={!email}
                    className="w-full bg-indigo-950 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-md transition-all duration-200"
                  >
                    <LogIn size={18} />
                    <span>Continue with Email</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {stage === 'chat' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 text-indigo-700 rounded-full text-xs font-semibold tracking-wide uppercase border border-indigo-500/10">
                  <Sparkles size={12} />
                  <span>Onboarding Conversation</span>
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight leading-snug">
                  Tell me about yourself in your own words
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                  Describe what you do, what you are learning or working on, your passions, current focus, and what you hope to achieve. I will craft a bespoke, adaptive productivity interface just for you.
                </p>
              </div>

              {/* Sample Profiles selection */}
              {!bio && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold tracking-wider text-slate-500 uppercase font-mono block">Choose a sample profile to try:</span>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => sampleBio('student')}
                      className="p-3 backdrop-blur-md bg-white/30 hover:bg-white/50 border border-white/30 hover:border-indigo-200 rounded-xl text-left transition-all duration-150 flex items-start space-x-3 group shadow-sm"
                    >
                      <div className="p-2 bg-blue-500/10 text-blue-700 rounded-lg shrink-0">
                        <GraduationCap size={16} />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">College Student (Aditi)</p>
                        <p className="text-slate-500 mt-0.5 line-clamp-1 font-semibold">Learning Full Stack, C, Linux; aims to join Google/Microsoft</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => sampleBio('pro')}
                      className="p-3 backdrop-blur-md bg-white/30 hover:bg-white/50 border border-white/30 hover:border-indigo-200 rounded-xl text-left transition-all duration-150 flex items-start space-x-3 group shadow-sm"
                    >
                      <div className="p-2 bg-emerald-500/10 text-emerald-700 rounded-lg shrink-0">
                        <Briefcase size={16} />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Working Professional (Rajesh)</p>
                        <p className="text-slate-500 mt-0.5 line-clamp-1 font-semibold">UI/UX designer; learning React; transitioning to Design Lead</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => sampleBio('ent')}
                      className="p-3 backdrop-blur-md bg-white/30 hover:bg-white/50 border border-white/30 hover:border-indigo-200 rounded-xl text-left transition-all duration-150 flex items-start space-x-3 group shadow-sm"
                    >
                      <div className="p-2 bg-amber-500/10 text-amber-700 rounded-lg shrink-0">
                        <Rocket size={16} />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Founder & Entrepreneur (Sarah)</p>
                        <p className="text-slate-500 mt-0.5 line-clamp-1 font-semibold">Fundraising, scaling sales, doubling active users for green startup</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Type your bio or select a template above..."
                  disabled={isLoading}
                  rows={5}
                  className="w-full backdrop-blur-md bg-white/40 border-2 border-white/40 focus:border-indigo-500 rounded-2xl py-3 px-4 outline-none transition-all resize-none disabled:opacity-75 text-slate-800 placeholder:text-slate-500 text-sm font-semibold leading-relaxed"
                />

                {error && (
                  <div className="text-rose-600 bg-rose-500/10 text-xs py-2.5 px-4 rounded-xl font-bold border border-rose-500/10">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !bio.trim()}
                  id="btn-analyze-bio"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/15 transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Gemini is analyzing your persona...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Synthesize Digital Persona</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
