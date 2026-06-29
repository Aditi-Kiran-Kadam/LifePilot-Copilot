/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LifePilotSplash } from './LifePilotSplash';
import { NeuralLoginModal } from './NeuralLoginModal';
import { useLifePilotAuth } from './useLifePilotAuth';
import { useApp } from '../context/AppContext';

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { setActiveTab } = useApp();
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [bootPhase, setBootPhase] = useState<'splash' | 'login' | 'app'>('splash');

  // Determine splash duration: 3 seconds (3000 ms) as requested
  const splashDuration = 3000;

  useEffect(() => {
    const auth = localStorage.getItem("lifepilot_authenticated") === "true" ||
                 localStorage.getItem("lifepilotAuthenticated") === "true";
    
    setAuthenticated(auth);
    setInitialized(true);
    
    if (auth) {
      setBootPhase('app');
    } else {
      setBootPhase('splash');
    }
  }, []);

  useEffect(() => {
    // Expose developer helper function globally
    (window as any).clearLifePilotAuth = () => {
      localStorage.removeItem("lifepilot_authenticated");
      localStorage.removeItem("lifepilotAuthenticated");
      localStorage.removeItem("lifepilotUser");
      localStorage.removeItem("lifepilot_user");
      window.location.reload();
    };
  }, []);

  const handleResetAuth = () => {
    localStorage.removeItem("lifepilot_authenticated");
    localStorage.removeItem("lifepilotAuthenticated");
    localStorage.removeItem("lifepilotUser");
    localStorage.removeItem("lifepilot_user");
    window.location.reload();
  };

  useEffect(() => {
    // Keep URL paths synchronized with auth state for a native router feeling
    const syncURL = () => {
      try {
        if (bootPhase === 'app') {
          if (window.location.pathname !== '/dashboard') {
            window.history.replaceState({}, '', '/dashboard');
          }
        } else if (bootPhase === 'login') {
          if (window.location.pathname !== '/login') {
            window.history.replaceState({}, '', '/login');
          }
        } else {
          if (window.location.pathname !== '/') {
            window.history.replaceState({}, '', '/');
          }
        }
      } catch (err) {
        console.warn('URL sync blocked or failed inside sandboxed environment:', err);
      }
    };
    syncURL();
  }, [bootPhase]);

  const handleSplashComplete = () => {
    const auth = localStorage.getItem("lifepilot_authenticated") === "true" ||
                 localStorage.getItem("lifepilotAuthenticated") === "true";
    if (auth) {
      setAuthenticated(true);
      setBootPhase('app');
    } else {
      setBootPhase('login');
    }
  };

  const handleLoginSuccess = () => {
    localStorage.setItem("lifepilot_authenticated", "true");
    localStorage.setItem("lifepilotAuthenticated", "true");
    try {
      localStorage.setItem('lp_active_tab', 'dashboard');
      if (setActiveTab) {
        setActiveTab('dashboard');
      }
    } catch (e) {
      console.warn('Failed to direct to dashboard:', e);
    }
    setAuthenticated(true);
    setBootPhase('app');
  };

  // Support for dynamic state changes / triggers (like reset onboarding / logout from settings) as fallback
  useEffect(() => {
    if (!initialized) return;

    const interval = setInterval(() => {
      const currentAuth = localStorage.getItem("lifepilot_authenticated") === "true" ||
                          localStorage.getItem("lifepilotAuthenticated") === "true";
      if (!currentAuth && bootPhase === 'app') {
        // Logout occurred
        setAuthenticated(false);
        setBootPhase('login');
      } else if (currentAuth && bootPhase === 'login') {
        // Logged in from elsewhere / state sync
        setAuthenticated(true);
        setBootPhase('app');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [initialized, bootPhase]);

  if (!initialized) {
    return null;
  }

  return (
    <>
      {bootPhase === 'splash' && (
        <LifePilotSplash duration={splashDuration} onComplete={handleSplashComplete} />
      )}
      {bootPhase === 'login' && (
        <NeuralLoginModal onLoginSuccess={handleLoginSuccess} />
      )}
      {bootPhase === 'app' && children}
    </>
  );
};
