/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTheme, applyTheme } from '../context/ThemeContext';
import { PersonalizationSettings } from '../types';
import { 
  Sun, Moon, Monitor, Palette, Zap, Check, CheckCircle, 
  RotateCcw, Save, ShieldAlert, Sparkles, Sliders 
} from 'lucide-react';

export const ThemeSettingsPanel: React.FC = () => {
  const { settings, updateSettings, resetTheme } = useTheme();

  // Local temp settings for instant preview
  const [tempSettings, setTempSettings] = useState<PersonalizationSettings>(() => ({
    ...settings,
    glassSettings: settings.glassSettings ? { ...settings.glassSettings } : {
      backdropBlur: '18px',
      transparentCards: 'rgba(255,255,255,0.08)',
      glassShadows: 'soft',
      frostedPanels: true,
      animatedGradients: true
    }
  }));

  const [hasChanges, setHasChanges] = useState(false);

  // Sync tempSettings with master settings on load or external change
  useEffect(() => {
    setTempSettings({
      ...settings,
      glassSettings: settings.glassSettings ? { ...settings.glassSettings } : {
        backdropBlur: '18px',
        transparentCards: 'rgba(255,255,255,0.08)',
        glassShadows: 'soft',
        frostedPanels: true,
        animatedGradients: true
      }
    });
  }, [settings]);

  // Apply changes to DOM instantly whenever tempSettings changes
  useEffect(() => {
    applyTheme(
      tempSettings.themeMode,
      tempSettings.themeStyle,
      tempSettings.accentColor,
      tempSettings.customAccentHex,
      tempSettings.glassSettings
    );

    // Check if there are changes between temp and permanent settings
    const changed = 
      tempSettings.themeMode !== settings.themeMode ||
      tempSettings.themeStyle !== settings.themeStyle ||
      tempSettings.accentColor !== settings.accentColor ||
      tempSettings.customAccentHex !== settings.customAccentHex ||
      tempSettings.animationsEnabled !== settings.animationsEnabled ||
      tempSettings.reducedMotion !== settings.reducedMotion ||
      JSON.stringify(tempSettings.glassSettings) !== JSON.stringify(settings.glassSettings);
    
    setHasChanges(changed);
  }, [tempSettings, settings]);

  const handleUpdateTemp = (newFields: Partial<PersonalizationSettings>) => {
    setTempSettings(prev => ({
      ...prev,
      ...newFields,
      glassSettings: newFields.glassSettings
        ? { ...prev.glassSettings, ...newFields.glassSettings }
        : prev.glassSettings
    }));
  };

  const handleSave = () => {
    updateSettings(tempSettings);
    // Notify user using global system or just local state
    const alertElement = document.getElementById('theme-alert-toast');
    if (alertElement) {
      alertElement.classList.remove('opacity-0', 'translate-y-2');
      setTimeout(() => {
        alertElement.classList.add('opacity-0', 'translate-y-2');
      }, 3000);
    }
  };

  const handleReset = () => {
    resetTheme();
    // Reapply default theme to DOM instantly
    const defaults = {
      themeMode: 'dark' as const,
      themeStyle: 'Glass' as const,
      accentColor: 'Purple' as const,
      customAccentHex: '#8b5cf6',
      animationsEnabled: true,
      reducedMotion: false,
      glassSettings: {
        backdropBlur: '18px',
        transparentCards: 'rgba(255,255,255,0.08)',
        glassShadows: 'soft' as const,
        frostedPanels: true,
        animatedGradients: true
      }
    };
    setTempSettings(prev => ({
      ...prev,
      ...defaults
    }));
    applyTheme(
      defaults.themeMode,
      defaults.themeStyle,
      defaults.accentColor,
      defaults.customAccentHex,
      defaults.glassSettings
    );
  };

  // Preset information for Theme Styles
  const themePresets = [
    { id: 'Glass' as const, label: 'Glass Theme', desc: 'Frosted translucency, backdrop blurs and subtle reflections.', previewBg: 'bg-slate-500/20 backdrop-blur-md border border-white/10' },
    { id: 'Minimal' as const, label: 'Minimalist Theme', desc: 'Flat retro fills, high-contrast crisp borders and neat layouts.', previewBg: 'bg-white dark:bg-black border border-slate-900 dark:border-white' },
    { id: 'Gradient' as const, label: 'Gradient Theme', desc: 'Rich moving ambient backdrops with soft organic transitions.', previewBg: 'bg-gradient-to-tr from-pink-500/30 via-purple-500/30 to-blue-500/30 border border-purple-500/20' },
    { id: 'Academic' as const, label: 'Academic Theme', desc: 'Bookish warm cream paper sheets, elegant layouts, sepia vibes.', previewBg: 'bg-[#FFFDF9] dark:bg-[#201C18] border border-[#E5D5C0] dark:border-[#3D352E]' },
    { id: 'Cyber' as const, label: 'Cyber Tech Theme', desc: 'Dark neon glowing frames, digital synth grids, monospace font.', previewBg: 'bg-[#0c0a1c] border border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.4)] font-mono' },
    { id: 'Aurora' as const, label: 'Aurora Theme', desc: 'Ethereal northern lights background with dynamic color layers.', previewBg: 'bg-gradient-to-tr from-teal-500/20 via-emerald-500/10 to-indigo-500/20 border border-teal-500/10' },
    { id: 'Focus' as const, label: 'Focus Theme', desc: 'Solid, non-distracting colors optimized for deep cognitive work.', previewBg: 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800' }
  ];

  // Accent list
  const accents = [
    { id: 'Blue' as const, label: 'Blue', colorClass: 'bg-blue-500', hex: '#3B82F6' },
    { id: 'Purple' as const, label: 'Purple', colorClass: 'bg-purple-500', hex: '#8B5CF6' },
    { id: 'Green' as const, label: 'Green', colorClass: 'bg-emerald-500', hex: '#10B981' },
    { id: 'Orange' as const, label: 'Orange', colorClass: 'bg-amber-500', hex: '#F59E0B' },
    { id: 'Pink' as const, label: 'Pink', colorClass: 'bg-pink-500', hex: '#EC4899' },
    { id: 'Teal' as const, label: 'Teal', colorClass: 'bg-teal-500', hex: '#0D9488' }
  ];

  return (
    <div className="space-y-6 w-full relative">
      {/* Dynamic Success Alert Toast */}
      <div 
        id="theme-alert-toast" 
        className="fixed bottom-6 right-6 z-[9999] opacity-0 translate-y-2 pointer-events-none transition-all duration-300 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 font-semibold text-xs border border-emerald-500"
      >
        <CheckCircle size={16} />
        <span>Theme saved and synchronized globally!</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Theme Mode & Dropdown Style Selection */}
        <div className="space-y-6">
          {/* Mode Selector Card */}
          <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <Sun size={16} className="text-indigo-500" />
                <span>Theme Mode</span>
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Choose the base brightness setting for the workspace.</p>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { id: 'light' as const, label: 'Light Mode', desc: 'Crisp, high-contrast daylight interface', icon: Sun },
                { id: 'dark' as const, label: 'Dark Mode', desc: 'Eye-friendly twilight dark theme', icon: Moon },
                { id: 'system' as const, label: 'System Mode', desc: 'Follows your operating system schedule', icon: Monitor }
              ].map((mode) => {
                const Icon = mode.icon;
                const isActive = tempSettings.themeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleUpdateTemp({ themeMode: mode.id })}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive 
                        ? 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-400 shadow-sm' 
                        : 'border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-950 text-slate-500'}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{mode.label}</p>
                        <p className="text-[9px] text-slate-400">{mode.desc}</p>
                      </div>
                    </div>
                    {isActive && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Dropdown Selector */}
          <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <Palette size={16} className="text-indigo-500" />
                <span>Theme Dropdown Selector</span>
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Quickly select or toggle your preset theme style.</p>
            </div>

            <select
              value={tempSettings.themeStyle}
              onChange={(e) => handleUpdateTemp({ themeStyle: e.target.value as any })}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-3 text-xs font-semibold cursor-pointer text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {themePresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Middle Column: Visual Preset Cards */}
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-4 xl:col-span-1">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <Sparkles size={16} className="text-indigo-500" />
              <span>Theme Style Cards</span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Click on a visual card to load its prefab colors & rules instantly.</p>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {themePresets.map((preset) => {
              const isActive = tempSettings.themeStyle === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleUpdateTemp({ themeStyle: preset.id })}
                  className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                    isActive 
                      ? 'border-indigo-600 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-sm' 
                      : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${preset.previewBg}`}>
                    <span className="text-[10px] font-bold opacity-60">A</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{preset.label}</p>
                    <p className="text-[9px] text-slate-400 line-clamp-2 mt-0.5">{preset.desc}</p>
                  </div>
                  {isActive && <CheckCircle size={16} className="text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Accent Colors & Animation/Glass settings & Save/Reset Actions */}
        <div className="space-y-6">
          {/* Accent Color Picker */}
          <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <Zap size={16} className="text-indigo-500" />
                <span>Accent Color</span>
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Customize global highlight badges, buttons, and progress rings.</p>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {accents.map((acc) => {
                const isActive = tempSettings.accentColor === acc.id;
                return (
                  <button
                    key={acc.id}
                    title={acc.label}
                    onClick={() => handleUpdateTemp({ accentColor: acc.id })}
                    className={`h-10 rounded-xl flex items-center justify-center cursor-pointer border-2 transition-all ${
                      isActive ? 'border-slate-800 dark:border-white scale-105 shadow-md' : 'border-transparent'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${acc.colorClass} flex items-center justify-center text-white shadow-sm`}>
                      {isActive && <Check size={12} />}
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => handleUpdateTemp({ accentColor: 'Custom' })}
                className={`col-span-6 h-10 px-3 rounded-xl border flex items-center justify-between cursor-pointer text-xs font-semibold ${
                  tempSettings.accentColor === 'Custom' 
                    ? 'border-indigo-600 bg-indigo-500/5' 
                    : 'border-slate-100 dark:border-white/5 hover:bg-slate-50'
                }`}
              >
                <span>Custom Accent Color</span>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono opacity-60 uppercase">{tempSettings.customAccentHex || '#8B5CF6'}</span>
                  <input
                    type="color"
                    value={tempSettings.customAccentHex || '#8b5cf6'}
                    onChange={(e) => handleUpdateTemp({ accentColor: 'Custom', customAccentHex: e.target.value })}
                    className="w-5 h-5 rounded border-0 p-0 cursor-pointer"
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Performance and Advanced Preferences */}
          <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <Sliders size={16} className="text-indigo-500" />
                <span>Performance & Advanced</span>
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Tune animation motion style & advanced variables.</p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer p-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">Enable visual transitions (300ms)</span>
                <input
                  type="checkbox"
                  checked={tempSettings.animationsEnabled}
                  onChange={(e) => handleUpdateTemp({ animationsEnabled: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">Reduced Motion limits</span>
                <input
                  type="checkbox"
                  checked={tempSettings.reducedMotion}
                  onChange={(e) => handleUpdateTemp({ reducedMotion: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              {tempSettings.themeStyle === 'Glass' && (
                <div className="border-t border-slate-100 dark:border-white/5 pt-3 mt-2 space-y-2">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Glass Engine Config</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Backdrop blur limit</span>
                    <select
                      value={tempSettings.glassSettings?.backdropBlur || '18px'}
                      onChange={(e) => handleUpdateTemp({
                        glassSettings: {
                          ...tempSettings.glassSettings,
                          backdropBlur: e.target.value
                        } as any
                      })}
                      className="bg-slate-100 dark:bg-slate-950 p-1 text-[11px] rounded border border-slate-200 dark:border-white/10"
                    >
                      <option value="4px">4px (Light Blur)</option>
                      <option value="12px">12px (Medium)</option>
                      <option value="18px">18px (Proper Frost)</option>
                      <option value="28px">28px (Heavy Blur)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Glass shadows style</span>
                    <select
                      value={tempSettings.glassSettings?.glassShadows || 'soft'}
                      onChange={(e) => handleUpdateTemp({
                        glassSettings: {
                          ...tempSettings.glassSettings,
                          glassShadows: e.target.value as any
                        } as any
                      })}
                      className="bg-slate-100 dark:bg-slate-950 p-1 text-[11px] rounded border border-slate-200 dark:border-white/10"
                    >
                      <option value="none">None</option>
                      <option value="soft">Soft & subtle</option>
                      <option value="heavy">Heavy & deep</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save, Apply and Reset Actions Banner */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <Sliders size={20} />
          </div>
          <div>
            <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200">Theme Sync System</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {hasChanges 
                ? '⚠️ You have unsaved changes in your active visual profile!' 
                : '✓ Your active visual preferences are fully synced.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleReset}
            className="cursor-pointer flex items-center space-x-2 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-2xl transition-colors"
          >
            <RotateCcw size={14} />
            <span>Reset Settings</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`cursor-pointer flex items-center space-x-2 text-xs font-semibold px-5 py-2.5 rounded-2xl transition-all ${
              hasChanges 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' 
                : 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-white/5'
            }`}
          >
            <Save size={14} />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
