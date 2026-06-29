/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutGrid, Timer, AlertTriangle, CreditCard, 
  GraduationCap, Calendar, User, Sparkles, Menu, X, Trophy, Wrench 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, profile } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'focus', label: 'Focus Mode', icon: Timer },
    { id: 'panic', label: 'Panic Mode', icon: AlertTriangle, alert: true },
    { id: 'growth', label: 'Growth Hub', icon: GraduationCap },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'commitments', label: 'Smart Commitments', icon: CreditCard },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: User },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden h-16 border-b border-white/20 backdrop-blur-md bg-white/40 flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-display font-bold text-sm">
            L
          </div>
          <span className="font-display font-bold text-slate-800 text-base">LifePilot Copilot</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-600 hover:bg-white/40 rounded-xl"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 lg:sticky lg:h-screen w-64 backdrop-blur-xl bg-white/30 dark:bg-slate-950/65 text-slate-800 dark:text-slate-200 border-r border-white/20 dark:border-white/5 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col flex-grow pt-6 overflow-y-auto">
          {/* Logo */}
          <div className="px-6 mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-display font-bold">
                L
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-slate-800 dark:text-slate-100 text-base tracking-tight leading-none">LifePilot Copilot</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono mt-0.5 tracking-widest uppercase">Version 1.0</span>
              </div>
            </div>
            <button className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-white" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* User Brief Badge */}
          {profile && (
            <div className="mx-4 mb-6 p-4 backdrop-blur-md bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-white/5 rounded-2xl flex items-center space-x-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-display font-semibold text-white">
                {profile.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{profile.name}</p>
                <div className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[9px] font-semibold tracking-wide mt-0.5">
                  <Sparkles size={8} />
                  <span>{profile.role}</span>
                </div>
              </div>
            </div>
          )}

          {/* Nav Items */}
          <nav className="flex-1 px-3 space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  id={`nav-${item.id}`}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 group
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-650/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-900/40 hover:text-slate-900 dark:hover:text-slate-100'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent size={20} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'} />
                    <span>{item.label}</span>
                  </div>
                  {item.alert && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/20 dark:border-white/5">
          <button
            onClick={() => {
              if (typeof (window as any).clearLifePilotAuth === 'function') {
                (window as any).clearLifePilotAuth();
              } else {
                localStorage.removeItem("lifepilot_authenticated");
                localStorage.removeItem("lifepilotAuthenticated");
                localStorage.removeItem("lifepilotUser");
                localStorage.removeItem("lifepilot_user");
                window.location.reload();
              }
            }}
            id="btn-developer-reset"
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-900/40 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            title="Reset LifePilot Auth & Data"
          >
            <Wrench size={16} />
            <span>Developer Reset</span>
          </button>
        </div>
      </aside>
    </>
  );
};
