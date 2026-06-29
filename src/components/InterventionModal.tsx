/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Sparkles, X, ChevronRight, Check } from 'lucide-react';

export const InterventionModal: React.FC = () => {
  const { activeIntervention, closeIntervention, applyInterventionSuggestion } = useApp();

  const [customResponse, setCustomResponse] = useState('');

  if (!activeIntervention || !activeIntervention.active) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customResponse.trim()) return;
    applyInterventionSuggestion(`Pivot: ${customResponse}`);
    setCustomResponse('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="backdrop-blur-2xl bg-white/60 rounded-3xl shadow-2xl border border-white/50 max-w-lg w-full overflow-hidden animate-fade-in">
        
        {/* Header block */}
        <div className="p-6 bg-amber-500/10 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-amber-900 font-bold">
            <div className="p-2 bg-white/60 text-amber-750 rounded-xl shadow-sm border border-white/40">
              <ShieldAlert size={20} className="animate-bounce" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base">Adaptive Intervention Coach</h3>
              <p className="text-[10px] text-amber-700 font-mono font-semibold">Anti-procrastination engine triggered</p>
            </div>
          </div>

          <button 
            onClick={closeIntervention}
            className="text-slate-500 hover:text-slate-800 p-1 bg-white/40 hover:bg-white/60 border border-white/30 rounded-lg transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Question */}
          <div className="space-y-2 text-center max-w-sm mx-auto">
            <h4 className="text-slate-900 font-bold text-sm md:text-base leading-snug">
              {activeIntervention.question}
            </h4>
            <p className="text-slate-500 text-xs font-semibold">
              Let's bypass the resistance loop. Choose a micro-step below to break the inertia block.
            </p>
          </div>

          {/* Suggestions List */}
          <div className="space-y-2">
            {activeIntervention.suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => applyInterventionSuggestion(sug)}
                className="w-full p-3.5 backdrop-blur-md bg-white/40 hover:bg-white/60 hover:text-indigo-700 border border-white/30 hover:border-indigo-200 rounded-2xl text-left text-xs md:text-sm font-bold text-slate-800 transition-all flex items-center justify-between group shadow-sm"
              >
                <span>🎯 {sug}</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0 ml-2" />
              </button>
            ))}
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-[10px] tracking-wider uppercase font-mono font-bold">or tell coach in your words</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>

          {/* Custom micro pivot input */}
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g., I'll just write the first paragraph..."
              value={customResponse}
              onChange={(e) => setCustomResponse(e.target.value)}
              className="flex-1 backdrop-blur-md bg-white/40 border-2 border-white/40 focus:border-amber-500 rounded-2xl py-2.5 px-3.5 outline-none text-slate-800 text-xs md:text-sm font-semibold placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!customResponse.trim()}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl py-2.5 px-4 text-xs font-bold shrink-0 transition-all flex items-center space-x-1 shadow-md"
            >
              <Check size={14} />
              <span>Confirm</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
