/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PersonalizationSettings } from '../types';

interface ThemeContextType {
  settings: PersonalizationSettings;
  updateSettings: (newSettings: Partial<PersonalizationSettings>) => void;
  applyThemeToDOM: (
    mode: 'light' | 'dark' | 'system',
    style: 'Glass' | 'Minimal' | 'Gradient' | 'Academic' | 'Cyber' | 'Aurora' | 'Focus',
    accent: 'Blue' | 'Purple' | 'Green' | 'Orange' | 'Pink' | 'Teal' | 'Custom',
    customHex?: string,
    glass?: any
  ) => void;
  resetTheme: () => void;
}

const defaultGlassSettings = {
  backdropBlur: '18px',
  transparentCards: 'rgba(255,255,255,0.08)',
  glassShadows: 'soft' as const,
  frostedPanels: true,
  animatedGradients: true
};

const defaultSettings: PersonalizationSettings = {
  themeMode: 'dark',
  themeStyle: 'Glass',
  accentColor: 'Purple',
  customAccentHex: '#8b5cf6',
  animationsEnabled: true,
  reducedMotion: false,
  glassSettings: defaultGlassSettings,
  aiPersonality: 'Coach',
  notifications: {
    pushEnabled: true,
    emailEnabled: false,
    habitReminders: true,
    focusReminders: true,
    commitmentReminders: true,
    deadlineAlerts: true,
    aiCoachingNudges: true
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const getActiveMode = (mode: 'light' | 'dark' | 'system'): 'light' | 'dark' => {
  if (mode === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }
  return mode;
};

export const applyTheme = (
  mode: 'light' | 'dark' | 'system',
  style: 'Glass' | 'Minimal' | 'Gradient' | 'Academic' | 'Cyber' | 'Aurora' | 'Focus',
  accent: 'Blue' | 'Purple' | 'Green' | 'Orange' | 'Pink' | 'Teal' | 'Custom',
  customHex?: string,
  glass?: any
) => {
  if (typeof window === 'undefined') return;

  const activeMode = getActiveMode(mode);
  const root = document.documentElement;

  // 1. Sync classes
  if (activeMode === 'dark') {
    root.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    root.classList.remove('dark');
    document.body.classList.remove('dark');
  }

  // Clear existing theme-style classes
  const styles: Array<string> = ['theme-glass', 'theme-minimal', 'theme-gradient', 'theme-academic', 'theme-cyber', 'theme-aurora', 'theme-focus'];
  styles.forEach(s => root.classList.remove(s));
  root.classList.add(`theme-${style.toLowerCase()}`);

  // Clear existing accent classes
  const accents: Array<string> = ['accent-blue', 'accent-purple', 'accent-green', 'accent-orange', 'accent-pink', 'accent-teal', 'accent-custom'];
  accents.forEach(a => root.classList.remove(a));
  root.classList.add(`accent-${accent.toLowerCase()}`);

  // Sync animations state
  root.classList.remove('animations-enabled', 'reduced-motion');
  // We can add a class to body
  root.classList.add('animations-enabled');

  // 2. Resolve Accent Color Hex
  let accentHex = '#8b5cf6'; // default purple
  let accentHoverHex = '#7c3aed';
  if (accent === 'Blue') {
    accentHex = activeMode === 'dark' ? '#60A5FA' : '#2563EB';
    accentHoverHex = activeMode === 'dark' ? '#93c5fd' : '#1d4ed8';
  } else if (accent === 'Purple') {
    accentHex = activeMode === 'dark' ? '#A78BFA' : '#8B5CF6';
    accentHoverHex = activeMode === 'dark' ? '#c084fc' : '#7c3aed';
  } else if (accent === 'Green') {
    accentHex = activeMode === 'dark' ? '#34D399' : '#10B981';
    accentHoverHex = activeMode === 'dark' ? '#6ee7b7' : '#059669';
  } else if (accent === 'Orange') {
    accentHex = activeMode === 'dark' ? '#FBBF24' : '#F59E0B';
    accentHoverHex = activeMode === 'dark' ? '#fcd34d' : '#d97706';
  } else if (accent === 'Pink') {
    accentHex = activeMode === 'dark' ? '#F472B6' : '#EC4899';
    accentHoverHex = activeMode === 'dark' ? '#f472b6' : '#db2777';
  } else if (accent === 'Teal') {
    accentHex = activeMode === 'dark' ? '#2DD4BF' : '#0D9488';
    accentHoverHex = activeMode === 'dark' ? '#5eead4' : '#0f766e';
  } else if (accent === 'Custom' && customHex) {
    accentHex = customHex;
    accentHoverHex = customHex;
  }

  root.style.setProperty('--accent-color', accentHex);
  root.style.setProperty('--accent-color-hover', accentHoverHex);

  // 3. Resolve Base Colors for Style Prefabs
  let bg = '#FFFFFF';
  let card = '#F8FAFC';
  let cardSec = '#F1F5F9';
  let text = '#111827';
  let textMuted = '#64748B';
  let border = '#E2E8F0';
  let shadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
  let blur = '0px';

  if (activeMode === 'dark') {
    bg = '#0A0A0A';
    card = '#151515';
    cardSec = '#1E1E1E';
    text = '#F8FAFC';
    textMuted = '#94A3B8';
    border = 'rgba(255,255,255,0.06)';
    shadow = '0 8px 32px 0 rgba(0,0,0,0.4)';
  }

  // Style customization mappings
  if (style === 'Glass') {
    blur = glass?.backdropBlur || '18px';
    shadow = glass?.glassShadows === 'heavy' ? '0 20px 40px rgba(0,0,0,0.3)' : '0 8px 32px 0 rgba(31, 38, 135, 0.08)';
    if (activeMode === 'dark') {
      bg = 'linear-gradient(135deg, #030712 0%, #0c0a24 100%)';
      card = glass?.transparentCards || 'rgba(255,255,255,0.08)';
      cardSec = 'rgba(255,255,255,0.04)';
      border = 'rgba(255,255,255,0.08)';
      text = '#F8FAFC';
      textMuted = '#94A3B8';
    } else {
      bg = 'linear-gradient(135deg, #fdfbf7 0%, #eef2f7 100%)';
      card = 'rgba(255, 255, 255, 0.45)';
      cardSec = 'rgba(255, 255, 255, 0.25)';
      border = 'rgba(255, 255, 255, 0.35)';
      text = '#0F172A';
      textMuted = '#475569';
    }
  } else if (style === 'Cyber') {
    shadow = '0 0 15px rgba(139, 92, 246, 0.15)';
    if (activeMode === 'dark') {
      bg = '#05050d';
      card = '#0c0a1c';
      cardSec = '#14102c';
      border = 'rgba(139, 92, 246, 0.3)';
      text = '#f8fafc';
      textMuted = '#a78bfa';
    } else {
      bg = '#f5f3ff';
      card = '#ffffff';
      cardSec = '#ede9fe';
      border = '#8b5cf6';
      text = '#1e1b4b';
      textMuted = '#6d28d9';
    }
  } else if (style === 'Academic') {
    shadow = '0 1px 3px rgba(0,0,0,0.05)';
    if (activeMode === 'dark') {
      bg = '#181512';
      card = '#201C18';
      cardSec = '#2C2621';
      border = '#3D352E';
      text = '#F4ECE1';
      textMuted = '#A89B8F';
    } else {
      bg = '#FAF6EE';
      card = '#FFFDF9';
      cardSec = '#F3ECE0';
      border = '#E5D5C0';
      text = '#2D251E';
      textMuted = '#6B5D52';
    }
  } else if (style === 'Minimal') {
    shadow = 'none';
    if (activeMode === 'dark') {
      bg = '#0A0A0A';
      card = '#121212';
      cardSec = '#1C1C1C';
      border = '#2E2E2E';
      text = '#F3F4F6';
      textMuted = '#9CA3AF';
    } else {
      bg = '#FFFFFF';
      card = '#FAF9F6';
      cardSec = '#F2F1E8';
      border = '#111827';
      text = '#111827';
      textMuted = '#4B5563';
    }
  } else if (style === 'Gradient') {
    shadow = '0 10px 30px rgba(0,0,0,0.05)';
    if (activeMode === 'dark') {
      bg = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)';
      card = 'rgba(30, 41, 59, 0.7)';
      cardSec = 'rgba(15, 23, 42, 0.6)';
      border = 'rgba(255, 255, 255, 0.05)';
      text = '#F8FAFC';
      textMuted = '#94A3B8';
    } else {
      bg = 'linear-gradient(135deg, #fbf2eb 0%, #eef2f7 50%, #e6eefc 100%)';
      card = 'rgba(255, 255, 255, 0.85)';
      cardSec = 'rgba(255, 255, 255, 0.6)';
      border = '#E2E8F0';
      text = '#1E293B';
      textMuted = '#64748B';
    }
  } else if (style === 'Aurora') {
    shadow = '0 10px 25px rgba(0,0,0,0.08)';
    if (activeMode === 'dark') {
      bg = 'linear-gradient(135deg, #050e14 0%, #0b1a24 50%, #030d08 100%)';
      card = 'rgba(20, 32, 43, 0.85)';
      cardSec = 'rgba(12, 23, 31, 0.7)';
      border = 'rgba(255, 255, 255, 0.06)';
      text = '#F1F5F9';
      textMuted = '#94A3B8';
    } else {
      bg = 'linear-gradient(135deg, #eefaf6 0%, #e3f2fd 50%, #f3e5f5 100%)';
      card = 'rgba(255, 255, 255, 0.9)';
      cardSec = 'rgba(255, 255, 255, 0.6)';
      border = '#E2E8F0';
      text = '#0F172A';
      textMuted = '#475569';
    }
  } else if (style === 'Focus') {
    shadow = 'none';
    if (activeMode === 'dark') {
      bg = '#090D16';
      card = '#0E131F';
      cardSec = '#171D2C';
      border = '#222B3E';
      text = '#E2E8F0';
      textMuted = '#64748B';
    } else {
      bg = '#F1F5F9';
      card = '#FFFFFF';
      cardSec = '#E2E8F0';
      border = '#CBD5E1';
      text = '#1E293B';
      textMuted = '#64748B';
    }
  }

  root.style.setProperty('--bg-app', bg);
  root.style.setProperty('--bg-card', card);
  root.style.setProperty('--bg-card-secondary', cardSec);
  root.style.setProperty('--text-main', text);
  root.style.setProperty('--text-muted', textMuted);
  root.style.setProperty('--border-app', border);
  root.style.setProperty('--shadow-app', shadow);
  root.style.setProperty('--backdrop-blur-app', blur);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PersonalizationSettings>(() => {
    try {
      const saved = localStorage.getItem('lp_personalization_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultSettings,
          ...parsed,
          glassSettings: {
            ...defaultGlassSettings,
            ...(parsed.glassSettings || {})
          }
        };
      }
    } catch (e) {
      console.error('Error loading theme settings:', e);
    }
    return defaultSettings;
  });

  const updateSettings = (newSettings: Partial<PersonalizationSettings>) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        glassSettings: newSettings.glassSettings
          ? { ...prev.glassSettings, ...newSettings.glassSettings }
          : prev.glassSettings
      };
      localStorage.setItem('lp_personalization_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const applyThemeToDOM = (
    mode: 'light' | 'dark' | 'system',
    style: 'Glass' | 'Minimal' | 'Gradient' | 'Academic' | 'Cyber' | 'Aurora' | 'Focus',
    accent: 'Blue' | 'Purple' | 'Green' | 'Orange' | 'Pink' | 'Teal' | 'Custom',
    customHex?: string,
    glass?: any
  ) => {
    applyTheme(mode, style, accent, customHex, glass);
  };

  const resetTheme = () => {
    updateSettings({
      themeMode: defaultSettings.themeMode,
      themeStyle: defaultSettings.themeStyle,
      accentColor: defaultSettings.accentColor,
      customAccentHex: defaultSettings.customAccentHex,
      animationsEnabled: defaultSettings.animationsEnabled,
      reducedMotion: defaultSettings.reducedMotion,
      glassSettings: defaultSettings.glassSettings
    });
  };

  // Sync theme mode with system preference if 'system' is selected
  useEffect(() => {
    const handleSystemChange = () => {
      if (settings.themeMode === 'system') {
        applyTheme(
          settings.themeMode,
          settings.themeStyle,
          settings.accentColor,
          settings.customAccentHex,
          settings.glassSettings
        );
      }
    };

    if (settings.themeMode === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }
  }, [settings.themeMode, settings.themeStyle, settings.accentColor, settings.customAccentHex, settings.glassSettings]);

  // Initial and subsequent sync to DOM
  useEffect(() => {
    applyTheme(
      settings.themeMode,
      settings.themeStyle,
      settings.accentColor,
      settings.customAccentHex,
      settings.glassSettings
    );
  }, [settings.themeMode, settings.themeStyle, settings.accentColor, settings.customAccentHex, settings.glassSettings]);

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, applyThemeToDOM, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
