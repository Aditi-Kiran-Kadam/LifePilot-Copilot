/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Commitment } from '../types';
import { 
  CreditCard, 
  Calendar, 
  Plus, 
  Check, 
  Trash, 
  Sparkles, 
  Filter, 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  Bell, 
  Zap, 
  Award, 
  RefreshCw, 
  ShieldAlert, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SmartCommitments: React.FC = () => {
  const { commitments, addCommitment, payCommitment, deleteCommitment, updateCommitment } = useApp();

  // Component local states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Utility');
  const [frequency, setFrequency] = useState<Commitment['frequency']>('monthly');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Commitment['priority']>('Medium');
  const [autopayEnabled, setAutopayEnabled] = useState(false);
  const [lateFeeEstimate, setLateFeeEstimate] = useState('0');
  
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'cards' | 'analytics' | 'history'>('cards');
  const [snoozedAlerts, setSnoozedAlerts] = useState<Record<string, boolean>>({});

  // Gamification Streak State
  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('lp_commitment_streak');
      return saved ? parseInt(saved) : 5;
    } catch {
      return 5;
    }
  });

  useEffect(() => {
    localStorage.setItem('lp_commitment_streak', streakCount.toString());
  }, [streakCount]);

  // Anchor date is June 27, 2026
  const anchorDateStr = '2026-06-27';

  const calculateDaysRemaining = (dueDateStr: string): number => {
    const today = new Date(anchorDateStr);
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRiskScore = (com: Commitment): 'Safe' | 'Attention Needed' | 'Critical' | 'Missed' => {
    if (com.paidThisPeriod) return 'Safe';
    const days = calculateDaysRemaining(com.dueDate);
    if (days < 0) return 'Missed';
    if (days === 0) return 'Critical';
    if (days === 1) return 'Attention Needed';
    return 'Safe';
  };

  const parseAmountNum = (amountStr: string): number => {
    const clean = amountStr.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
  };

  const getCurrencySymbol = (amountStr: string): string => {
    if (amountStr.includes('₹')) return '₹';
    if (amountStr.includes('$')) return '$';
    return '₹';
  };

  // Calculations for commitment insights
  const totalCount = commitments.length;
  const paidCount = commitments.filter(c => c.paidThisPeriod).length;
  const unpaidCount = commitments.filter(c => !c.paidThisPeriod).length;
  
  const missedCount = commitments.filter(c => !c.paidThisPeriod && calculateDaysRemaining(c.dueDate) < 0).length;
  const dueThisWeekCount = commitments.filter(c => {
    if (c.paidThisPeriod) return false;
    const days = calculateDaysRemaining(c.dueDate);
    return days >= 0 && days <= 7;
  }).length;

  const totalAmountDueThisMonth = commitments
    .filter(c => !c.paidThisPeriod)
    .reduce((acc, c) => acc + parseAmountNum(c.amount), 0);

  // Reliability and life stability scoring
  const reliabilityScore = Math.max(30, Math.min(100, Math.round(100 - (unpaidCount * 5) - (missedCount * 15))));
  const lifeStabilityScore = Math.min(100, Math.max(40, Math.round(70 + (reliabilityScore * 0.2) + (streakCount * 1.5) - (missedCount * 8))));
  
  const getDisciplineGrade = (score: number): 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 55) return 'Fair';
    return 'Needs Attention';
  };

  // Get dynamic AI Alerts
  const getAIAlerts = () => {
    const alerts: Array<{ id: string; message: string; type: 'critical' | 'warning' | 'info' }> = [];
    commitments.forEach(c => {
      if (!c.paidThisPeriod && !snoozedAlerts[c.id]) {
        const days = calculateDaysRemaining(c.dueDate);
        if (days === 0) {
          alerts.push({ id: c.id, message: `🚨 Critical Alert: ${c.title} renews today!`, type: 'critical' });
        } else if (days === 1) {
          alerts.push({ id: c.id, message: `⚠️ Warning: ${c.title} is due tomorrow!`, type: 'warning' });
        } else if (days < 0) {
          alerts.push({ id: c.id, message: `❌ Delinquent: ${c.title} was missed! (Due ${c.dueDate})`, type: 'critical' });
        } else if (days === 5 && c.title.toLowerCase().includes('lic')) {
          alerts.push({ id: c.id, message: `📅 LIC Premium expires in 5 days.`, type: 'info' });
        } else if (days === 2 && c.title.toLowerCase().includes('exam')) {
          alerts.push({ id: c.id, message: `📅 College exam registration closes in 2 days.`, type: 'critical' });
        } else if (days > 0 && days <= 7) {
          alerts.push({ id: c.id, message: `🔔 Reminding: ${c.title} subscription renews next week.`, type: 'info' });
        }
      }
    });
    return alerts;
  };

  // Get custom AI Recommendations
  const getRecommendations = () => {
    const recs: string[] = [];
    const unpaid = commitments.filter(c => !c.paidThisPeriod);
    const missed = unpaid.filter(c => calculateDaysRemaining(c.dueDate) < 0);
    const dueSoon = unpaid.filter(c => {
      const days = calculateDaysRemaining(c.dueDate);
      return days >= 0 && days <= 4;
    });

    if (missed.length > 0) {
      missed.forEach(m => {
        recs.push(`🚨 **Recover recommendation:** Your payment for **${m.title}** was missed! Pay now to stop late fees of ₹${m.lateFeeEstimate || 100}, avoid service blocks, and restore your Reliability Score.`);
      });
    }

    if (dueSoon.length >= 3) {
      recs.push(`💡 **Discipline suggestion:** You have three commitments due within four days. Consider enabling autopay to automate these tasks and stay ahead of schedule.`);
    } else if (unpaid.some(u => !u.autopayEnabled && (u.category === 'Subscription' || u.category === 'Utility'))) {
      recs.push(`💡 **Seamless Operations:** Consider enabling autopay on subscription-style accounts to avoid service expiration interruptions.`);
    }

    if (unpaid.some(u => u.title.toLowerCase().includes('internet') && calculateDaysRemaining(u.dueDate) <= 1)) {
      recs.push(`⚠️ **Disruption alert:** Pay internet bill now to avoid internet disruption during high-focus study sessions.`);
    }

    recs.push(`💳 **Salary Alignment:** Move subscription payments to your primary salary week to maintain high cash liquidity.`);

    return recs;
  };

  // Canvas HTML5 Confettiburst
  const triggerPaymentConfetti = () => {
    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      radius: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }
    const particles: Particle[] = [];

    // Burst from center-bottom
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 25 - 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: Math.random() * 5 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        if (p.opacity > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.45; // gravity
          p.vx *= 0.98; // horizontal friction
          p.rotation += p.rotationSpeed;
          p.opacity -= 0.015;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
          ctx.restore();
        }
      });

      if (alive) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    animate();
  };

  const handlePay = (comId: string) => {
    const isPaying = !commitments.find(c => c.id === comId)?.paidThisPeriod;
    payCommitment(comId);
    if (isPaying) {
      setStreakCount(prev => prev + 1);
      triggerPaymentConfetti();
    } else {
      setStreakCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleToggleAutopay = (comId: string, currentState: boolean) => {
    updateCommitment(comId, { autopayEnabled: !currentState });
  };

  const handleReschedule = (comId: string, daysToAdd: number) => {
    const com = commitments.find(c => c.id === comId);
    if (!com) return;
    const current = new Date(com.dueDate);
    current.setDate(current.getDate() + daysToAdd);
    const newDateStr = current.toISOString().split('T')[0];
    updateCommitment(comId, { dueDate: newDateStr });
  };

  const handleSkipCycle = (comId: string) => {
    const com = commitments.find(c => c.id === comId);
    if (!com) return;
    // Calculate next cycle date based on frequency
    let daysToAdd = 30;
    if (com.frequency === 'daily') daysToAdd = 1;
    else if (com.frequency === 'weekly') daysToAdd = 7;
    else if (com.frequency === 'monthly') daysToAdd = 30;
    else if (com.frequency === 'quarterly') daysToAdd = 90;
    else if (com.frequency === 'half yearly') daysToAdd = 180;
    else if (com.frequency === 'yearly') daysToAdd = 365;

    const current = new Date(com.dueDate);
    current.setDate(current.getDate() + daysToAdd);
    const newDateStr = current.toISOString().split('T')[0];
    updateCommitment(comId, { dueDate: newDateStr, paidThisPeriod: false });
  };

  const handleSnoozeAlert = (comId: string) => {
    setSnoozedAlerts(prev => ({ ...prev, [comId]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount.trim() || !dueDate) return;

    const currencySymbol = amount.match(/[₹$]/) ? '' : '₹';
    addCommitment({
      title,
      amount: `${currencySymbol}${amount}`,
      category,
      frequency,
      dueDate,
      priority,
      autopayEnabled,
      lateFeeEstimate: parseFloat(lateFeeEstimate) || 0
    });

    // Reset Form
    setTitle('');
    setAmount('');
    setCategory('Utility');
    setFrequency('monthly');
    setDueDate('');
    setPriority('Medium');
    setAutopayEnabled(false);
    setLateFeeEstimate('0');
    setIsModalOpen(false);

    // Increments streak on creation sometimes or shows motivational spark
    triggerPaymentConfetti();
  };

  // Detailed risk descriptors for card items
  const getRiskDetails = (com: Commitment) => {
    const cat = com.category.toLowerCase();
    let potentialImpact = "Service or account lock out on due date.";
    let recommendation = "Pay now to keep account active.";
    let estTime = "2 minutes";

    if (cat.includes('utility') || cat.includes('internet')) {
      potentialImpact = "Internet disruption during study sessions.";
      recommendation = "Pay today";
      estTime = "2 minutes";
    } else if (cat.includes('sub') || cat.includes('netflix') || cat.includes('spotify')) {
      potentialImpact = "Temporary suspension of entertainment account streaming access.";
      recommendation = "Confirm auto-debit coverage";
      estTime = "1 minute";
    } else if (cat.includes('academic') || cat.includes('college') || cat.includes('fee')) {
      potentialImpact = "Withholding of exam admit card or registration cancellation.";
      recommendation = "Initiate net banking transfer";
      estTime = "5 minutes";
    } else if (cat.includes('finance') || cat.includes('invest') || cat.includes('sip') || cat.includes('card') || cat.includes('bill')) {
      potentialImpact = "Negative credit rating (CIBIL score) impact and high late fees.";
      recommendation = "Pay balance to stay reliable";
      estTime = "3 minutes";
    } else if (cat.includes('rent')) {
      potentialImpact = "Strained landlord relationship and late payment interest.";
      recommendation = "Authorize instant clearing payment";
      estTime = "2 minutes";
    } else if (cat.includes('gym') || cat.includes('membership')) {
      potentialImpact = "Gym access revoked at biometric entry gate.";
      recommendation = "Renew at desk or online app";
      estTime = "1 minute";
    } else if (cat.includes('insurance') || cat.includes('lic')) {
      potentialImpact = "Policy lapse, loss of health/life coverage benefits.";
      recommendation = "Renew premium today";
      estTime = "4 minutes";
    }

    return { potentialImpact, recommendation, estTime };
  };

  // Sorting and Filtering Commitments
  const filteredCommitments = commitments.filter((com) => {
    const matchesSearch = com.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          com.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'unpaid') return !com.paidThisPeriod;
    if (filter === 'paid') return com.paidThisPeriod;
    if (filter === 'overdue') return !com.paidThisPeriod && calculateDaysRemaining(com.dueDate) < 0;
    return true;
  }).sort((a, b) => {
    // Put missed/overdue and critical at the very top, then sort by due date
    if (a.paidThisPeriod !== b.paidThisPeriod) {
      return a.paidThisPeriod ? 1 : -1;
    }
    const daysA = calculateDaysRemaining(a.dueDate);
    const daysB = calculateDaysRemaining(b.dueDate);
    return daysA - daysB;
  });

  const activeAlerts = getAIAlerts();
  const activeRecommendations = getRecommendations();

  // Categories spending distribution
  const categoryTotals: Record<string, number> = {};
  commitments.forEach(c => {
    categoryTotals[c.category] = (categoryTotals[c.category] || 0) + parseAmountNum(c.amount);
  });
  const maxCategoryAmt = Math.max(...Object.values(categoryTotals), 1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto selection:bg-indigo-200">
      
      {/* Confetti canvas */}
      <canvas 
        id="confetti-canvas" 
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard className="text-indigo-600 animate-pulse" />
              Smart Commitments
            </h1>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono">
              AI Powered
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">Continuous auto-tracking recurring obligations, billing, and learning subscriptions.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          id="btn-add-commitment-trigger"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all duration-200 scale-100 hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span className="text-sm">Record Commitment</span>
        </button>
      </div>

      {/* AI Monitor Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 flex items-start space-x-3 backdrop-blur-md animate-pulse">
          <Bell className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div className="flex-1 space-y-1">
            <span className="text-xs font-bold text-amber-800 font-mono tracking-wider uppercase block">AI Continuous Monitoring</span>
            <div className="space-y-1">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between text-xs text-slate-700">
                  <span className="font-semibold">{alert.message}</span>
                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <button 
                      onClick={() => handlePay(alert.id)}
                      className="text-indigo-650 hover:text-indigo-800 font-bold underline cursor-pointer"
                    >
                      Pay Now
                    </button>
                    <span className="text-slate-300">|</span>
                    <button 
                      onClick={() => handleSnoozeAlert(alert.id)}
                      className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                    >
                      Snooze
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6 Stats Cards: Commitment Insights & Gamification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Upcoming obligations */}
        <div className="backdrop-blur-xl bg-white/45 rounded-2xl p-4 border border-white/60 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">Upcoming This Week</span>
            <p className="text-3xl font-display font-black text-slate-900 mt-1">{dueThisWeekCount}</p>
            <span className="text-[10px] text-slate-500 font-semibold block mt-1">Pending payments in next 7d</span>
          </div>
          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-indigo-600">
            <Calendar size={22} />
          </div>
        </div>

        {/* Card 2: Amount Due This Month */}
        <div className="backdrop-blur-xl bg-white/45 rounded-2xl p-4 border border-white/60 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 font-mono block">Amount Due This Month</span>
            <p className="text-3xl font-display font-black text-slate-900 mt-1">₹{totalAmountDueThisMonth.toLocaleString()}</p>
            <span className="text-[10px] text-amber-700 font-semibold block mt-1">{unpaidCount} unresolved cycles</span>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-600">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Card 3: Missed Commitments */}
        <div className="backdrop-blur-xl bg-white/45 rounded-2xl p-4 border border-white/60 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 font-mono block font-bold">Missed Commitments</span>
            <p className="text-3xl font-display font-black text-rose-700 mt-1">{missedCount}</p>
            <span className="text-[10px] text-rose-600 font-bold block mt-1">Requires immediate recovery</span>
          </div>
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-rose-600">
            <ShieldAlert size={22} />
          </div>
        </div>

        {/* Card 4: Streak (Gamification) */}
        <div className="backdrop-blur-xl bg-white/45 rounded-2xl p-4 border border-white/60 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 font-mono block">Commitment Streak</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <p className="text-3xl font-display font-black text-slate-900">{streakCount}x</p>
              <Flame size={20} className="text-orange-500 fill-orange-500 animate-bounce" />
            </div>
            <span className="text-[10px] text-slate-500 font-semibold block mt-1">Consecutive timely clearances</span>
          </div>
          <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-orange-600">
            <Award size={22} />
          </div>
        </div>

        {/* Card 5: Consistency Score (Reliability) */}
        <div className="backdrop-blur-xl bg-white/45 rounded-2xl p-5 border border-white/60 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 font-mono block">Reliability Score</span>
            <p className="text-3xl font-display font-black text-slate-900 mt-1">{reliabilityScore}%</p>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-1">Grade: {getDisciplineGrade(reliabilityScore)}</span>
          </div>
          {/* Progress Ring */}
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
              <circle cx="28" cy="28" r="22" stroke="#10b981" strokeWidth="4" fill="transparent" 
                strokeDasharray={138} strokeDashoffset={138 - (reliabilityScore / 100) * 138} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono text-emerald-700">{reliabilityScore}%</span>
          </div>
        </div>

        {/* Card 6: Life Stability Index */}
        <div className="backdrop-blur-xl bg-white/45 rounded-2xl p-5 border border-white/60 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-mono block">Life Stability Index</span>
            <p className="text-3xl font-display font-black text-slate-900 mt-1">{lifeStabilityScore}%</p>
            <span className="text-[10px] text-indigo-700 font-semibold block mt-1">Excellent administrative flow</span>
          </div>
          {/* Progress Ring */}
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
              <circle cx="28" cy="28" r="22" stroke="#6366f1" strokeWidth="4" fill="transparent" 
                strokeDasharray={138} strokeDashoffset={138 - (lifeStabilityScore / 100) * 138} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono text-indigo-700">{lifeStabilityScore}%</span>
          </div>
        </div>

      </div>

      {/* AI Recommendations Panel */}
      <div className="bg-gradient-to-br from-indigo-900/90 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-505/20 backdrop-blur-2xl">
        <div className="flex items-center space-x-2 border-b border-indigo-800/60 pb-3 mb-4">
          <Sparkles className="text-indigo-400" size={18} />
          <h2 className="text-base font-display font-black tracking-tight">AI Insights & Action Plan</h2>
        </div>
        <div className="space-y-3">
          {activeRecommendations.map((rec, i) => (
            <div key={i} className="flex items-start space-x-2 text-sm text-indigo-100">
              <span className="text-indigo-400 mt-1 shrink-0">✦</span>
              <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: rec }} />
            </div>
          ))}
        </div>
      </div>

      {/* Primary tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('cards')}
          className={`pb-3 px-5 text-sm font-bold border-b-2 transition-all ${activeTab === 'cards' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          My Commitments ({filteredCommitments.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-5 text-sm font-bold border-b-2 transition-all ${activeTab === 'analytics' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Spending Analytics
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-5 text-sm font-bold border-b-2 transition-all ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Completion Log
        </button>
      </div>

      {activeTab === 'cards' && (
        <div className="space-y-4">
          
          {/* Filters, search, and count */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/30 backdrop-blur-md p-3 rounded-2xl border border-white/50">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <Filter size={14} className="text-slate-500 mr-1" />
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white/50 text-slate-600 hover:bg-white/80'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('unpaid')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${filter === 'unpaid' ? 'bg-amber-500/15 text-amber-800 border border-amber-500/20' : 'bg-white/50 text-slate-600 hover:bg-white/80'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setFilter('overdue')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${filter === 'overdue' ? 'bg-rose-500/15 text-rose-800 border border-rose-500/20' : 'bg-white/50 text-slate-600 hover:bg-white/80'}`}
              >
                Overdue
              </button>
              <button 
                onClick={() => setFilter('paid')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${filter === 'paid' ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/20' : 'bg-white/50 text-slate-600 hover:bg-white/80'}`}
              >
                Completed
              </button>
            </div>

            {/* Simple Search */}
            <input
              type="text"
              placeholder="Search commitments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-1.5 outline-none rounded-xl bg-white/60 border border-white/80 text-xs font-semibold focus:border-indigo-500 max-w-xs w-full text-slate-800"
            />
          </div>

          {/* List of commitment cards */}
          {commitments.length === 0 ? (
            <div className="text-center py-16 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-white/50 dark:border-white/5 shadow-sm text-slate-500 p-8 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500 text-xl font-bold">💳</div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No commitments added. Stay ahead of recurring responsibilities.</p>
              <p className="text-slate-400 text-xs">Add utility bills, academic fees, Netflix subscriptions, or card payments.</p>
            </div>
          ) : filteredCommitments.length === 0 ? (
            <div className="text-center py-12 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-white/50 dark:border-white/5 shadow-sm text-slate-500 text-xs font-semibold">
              No matching recurring commitments found. Adjust your filters or add a new commitment!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredCommitments.map((com) => {
                  const days = calculateDaysRemaining(com.dueDate);
                  const risk = getRiskScore(com);
                  const isMissed = risk === 'Missed';
                  const isCritical = risk === 'Critical';
                  const isAttention = risk === 'Attention Needed';
                  const riskDetails = getRiskDetails(com);

                  return (
                    <motion.div 
                      key={com.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`
                        p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-md backdrop-blur-xl group
                        ${com.paidThisPeriod 
                          ? 'bg-white/20 border-white/30 opacity-75' 
                          : 'bg-white/60 border-white/70 hover:border-indigo-250 hover:shadow-lg'}
                      `}
                    >
                      {/* Top row */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-display font-black text-slate-900 group-hover:text-indigo-900 transition-colors">{com.title}</span>
                            {com.priority === 'High' && (
                              <span className="bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">High Priority</span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-mono">
                              {com.category}
                            </span>
                            <span className="text-[10px] text-slate-500 capitalize font-bold">
                              • {com.frequency} cycle
                            </span>
                            {com.autopayEnabled && (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5 font-mono uppercase">
                                <Check size={8} /> Autopay
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="font-display font-black text-lg text-slate-900 shrink-0">{com.amount}</span>
                      </div>

                      {/* Days remaining badge & Risk Score */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
                        {com.paidThisPeriod ? (
                          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold">
                            <CheckCircle2 size={14} className="fill-emerald-50 text-emerald-600" />
                            <span>Paid This Period</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
                            <Calendar size={13} className="text-slate-400" />
                            {days < 0 ? (
                              <span className="text-rose-700 font-bold">Overdue by {Math.abs(days)}d</span>
                            ) : days === 0 ? (
                              <span className="text-red-700 font-bold animate-pulse">DUE TODAY 🚨</span>
                            ) : days === 1 ? (
                              <span className="text-amber-700 font-bold">Due Tomorrow</span>
                            ) : (
                              <span>Due in {days} days</span>
                            )}
                          </div>
                        )}

                        {/* Risk Level Badge */}
                        {!com.paidThisPeriod && (
                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] text-slate-500 font-bold">Risk Level:</span>
                            <span className={`
                              text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full font-mono
                              ${isMissed ? 'bg-red-100 text-red-800 border border-red-200' :
                                isCritical ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse' :
                                isAttention ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                'bg-emerald-100 text-emerald-800 border border-emerald-200'}
                            `}>
                              {risk === 'Missed' ? 'Missed' : risk === 'Critical' ? 'Critical' : risk === 'Attention Needed' ? 'Attention Needed' : 'Safe'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Extended Risk Analysis Panel (Only for unpaid/pending items) */}
                      {!com.paidThisPeriod && (
                        <div className="p-3 bg-indigo-50/40 rounded-2xl border border-indigo-100/40 space-y-2 text-xs">
                          <div className="flex items-start gap-1">
                            <span className="font-bold text-slate-700 block shrink-0">Potential Impact:</span>
                            <span className="text-slate-600 block">{riskDetails.potentialImpact}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-indigo-100/40">
                            <span>👉 Recommendation: <strong className="text-indigo-950 font-bold">{riskDetails.recommendation}</strong></span>
                            <span>⏳ Est. Time: <strong className="text-indigo-950 font-bold">{riskDetails.estTime}</strong></span>
                          </div>
                          {com.lateFeeEstimate !== undefined && com.lateFeeEstimate > 0 && (
                            <div className="text-[10px] font-bold text-rose-600 flex items-center gap-1 font-mono">
                              <AlertTriangle size={10} /> Late Fee Estimate if unpaid: {getCurrencySymbol(com.amount)}{com.lateFeeEstimate}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bottom Quick Actions bar */}
                      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 gap-2">
                        {/* Left action tags */}
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleToggleAutopay(com.id, com.autopayEnabled)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${com.autopayEnabled ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'}`}
                            title={com.autopayEnabled ? "Disable Autopay" : "Enable Autopay"}
                          >
                            {com.autopayEnabled ? "Disable Autopay" : "Enable Autopay"}
                          </button>
                          
                          {!com.paidThisPeriod && (
                            <>
                              <button
                                onClick={() => handleReschedule(com.id, 7)}
                                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-all"
                                title="Reschedule by +1 week"
                              >
                                Postpone 7d
                              </button>
                              <button
                                onClick={() => handleSkipCycle(com.id)}
                                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-all"
                                title="Skip this billing cycle"
                              >
                                Skip Cycle
                              </button>
                            </>
                          )}

                          <button 
                            onClick={() => deleteCommitment(com.id)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            title="Delete obligation"
                          >
                            <Trash size={12} />
                          </button>
                        </div>

                        {/* Payment Toggle button */}
                        <button
                          onClick={() => handlePay(com.id)}
                          className={`
                            px-4 py-2 rounded-xl font-bold flex items-center space-x-1.5 text-xs transition-all cursor-pointer scale-100 active:scale-95
                            ${com.paidThisPeriod 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200/60' 
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md shadow-indigo-600/10'}
                          `}
                        >
                          {com.paidThisPeriod ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>Cleared</span>
                            </>
                          ) : (
                            <>
                              <span>Pay Now</span>
                              <ArrowRight size={13} />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Analytics view tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category breakdown progress list */}
            <div className="backdrop-blur-xl bg-white/45 rounded-3xl p-6 border border-white/60 shadow-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono mb-4 flex items-center gap-2">
                <TrendingUp size={16} /> Category Distribution
              </h3>
              <div className="space-y-4">
                {Object.keys(categoryTotals).map((cat) => {
                  const amt = categoryTotals[cat];
                  const percentage = Math.round((amt / maxCategoryAmt) * 100);
                  return (
                    <div key={cat} className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>{cat}</span>
                        <span>₹{amt.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulated spending chart */}
            <div className="backdrop-blur-xl bg-white/45 rounded-3xl p-6 border border-white/60 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono mb-2 flex items-center gap-2">
                  <Info size={16} /> Cash-Flow Obligations Schedule
                </h3>
                <p className="text-xs text-slate-500 mb-4">Obligations mapped in 2026 chronological buckets.</p>
              </div>
              {/* Custom SVG Spending Schedule Bar Chart */}
              <div className="h-44 flex items-end justify-between px-2 pt-4">
                <div className="flex flex-col items-center flex-1 space-y-2">
                  <div className="text-[10px] font-bold text-indigo-700 font-mono">₹2.4k</div>
                  <div className="w-8 bg-indigo-500/20 border-t-2 border-indigo-500 rounded-t-md h-12" />
                  <span className="text-[10px] text-slate-400 font-bold">Jan</span>
                </div>
                <div className="flex flex-col items-center flex-1 space-y-2">
                  <div className="text-[10px] font-bold text-indigo-700 font-mono">₹1.8k</div>
                  <div className="w-8 bg-indigo-500/20 border-t-2 border-indigo-500 rounded-t-md h-8" />
                  <span className="text-[10px] text-slate-400 font-bold">Feb</span>
                </div>
                <div className="flex flex-col items-center flex-1 space-y-2">
                  <div className="text-[10px] font-bold text-indigo-700 font-mono">₹4.2k</div>
                  <div className="w-8 bg-indigo-500/30 border-t-2 border-indigo-600 rounded-t-md h-20 animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-bold">Mar</span>
                </div>
                <div className="flex flex-col items-center flex-1 space-y-2">
                  <div className="text-[10px] font-bold text-indigo-700 font-mono">₹2.0k</div>
                  <div className="w-8 bg-indigo-500/20 border-t-2 border-indigo-500 rounded-t-md h-10" />
                  <span className="text-[10px] text-slate-400 font-bold">Apr</span>
                </div>
                <div className="flex flex-col items-center flex-1 space-y-2">
                  <div className="text-[10px] font-bold text-indigo-700 font-mono">₹3.1k</div>
                  <div className="w-8 bg-indigo-500/20 border-t-2 border-indigo-500 rounded-t-md h-16" />
                  <span className="text-[10px] text-slate-400 font-bold">May</span>
                </div>
                <div className="flex flex-col items-center flex-1 space-y-2">
                  <div className="text-[10px] font-bold text-indigo-700 font-mono">₹{Math.round(totalAmountDueThisMonth / 1000)}k</div>
                  <div className="w-8 bg-gradient-to-t from-indigo-500 to-violet-600 rounded-t-md h-28 shadow-lg shadow-indigo-600/10" />
                  <span className="text-[10px] text-slate-900 font-black">Jun</span>
                </div>
              </div>
            </div>

          </div>

          {/* Upcoming Obligations Timeline */}
          <div className="backdrop-blur-xl bg-white/45 rounded-3xl p-6 border border-white/60 shadow-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono mb-4">Chronological Due Dates Timeline</h3>
            <div className="relative pl-6 border-l border-indigo-200/60 space-y-5">
              {commitments.filter(c => !c.paidThisPeriod).map((com) => {
                const d = calculateDaysRemaining(com.dueDate);
                return (
                  <div key={com.id} className="relative">
                    <span className="absolute -left-8 top-1 bg-indigo-600 w-4.5 h-4.5 rounded-full border-4 border-white shadow shadow-indigo-600/30" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold text-slate-700">
                      <div>
                        <span className="font-bold text-slate-900">{com.title}</span>
                        <span className="text-[10px] text-slate-500 block">Category: {com.category} • Cycle: {com.frequency}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono bg-white/60 py-1 px-2.5 border border-white rounded-md shrink-0 mt-1 sm:mt-0 font-bold">
                        {com.dueDate} (In {d} days)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Completion History Log */}
      {activeTab === 'history' && (
        <div className="backdrop-blur-xl bg-white/45 rounded-3xl p-6 border border-white/60 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="text-emerald-500" size={16} /> Completed Obligations Log
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold py-1 px-2.5 rounded-md font-mono">
              Cleared: {paidCount} / {totalCount}
            </span>
          </div>

          {commitments.filter(c => c.paidThisPeriod).length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 font-semibold">
              No cleared obligations this cycle yet. Settle pending dues to register completion history log!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Obligation Name</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Cleared Cycle</th>
                    <th className="py-3 px-2 text-right">Settled Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {commitments.filter(c => c.paidThisPeriod).map((com) => (
                    <tr key={com.id} className="text-slate-700 hover:bg-slate-50/50">
                      <td className="py-3 px-2 font-bold text-slate-900">{com.title}</td>
                      <td className="py-3 px-2 capitalize">{com.category}</td>
                      <td className="py-3 px-2 text-emerald-600 font-bold flex items-center gap-1">
                        <Check size={12} /> Auto-Cleared Cycle
                      </td>
                      <td className="py-3 px-2 text-right font-bold font-mono text-slate-900">{com.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* RECORD COMMITMENT MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-2xl bg-white/70 rounded-3xl shadow-2xl max-w-md w-full border border-white/50 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-white/25 flex justify-between items-center bg-white/30">
              <div className="flex items-center space-x-2 text-slate-900">
                <CreditCard size={18} className="text-indigo-600" />
                <h3 className="font-display font-black text-slate-900">Record Commitment</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 text-sm font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Commitment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Internet Bill, SIP Mutual Fund, Exam Fee"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full backdrop-blur-md bg-white/40 border-2 border-white/40 focus:border-indigo-500 rounded-2xl py-3 px-4 outline-none text-slate-800 text-sm font-semibold shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold font-mono">₹</span>
                    <input
                      type="text"
                      required
                      placeholder="1200"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full backdrop-blur-md bg-white/40 border-2 border-white/40 focus:border-indigo-500 rounded-2xl py-3 pl-8 pr-4 outline-none text-slate-800 text-sm font-semibold shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full backdrop-blur-md bg-white/45 border-2 border-white/40 focus:border-indigo-500 rounded-2xl py-3 px-3 outline-none text-slate-800 text-xs font-bold cursor-pointer"
                  >
                    <option value="Utility">Utility / Bills</option>
                    <option value="Finance">Investment / SIP</option>
                    <option value="Academics">College / Exam Fees</option>
                    <option value="Subscription">Premium / Subscription</option>
                    <option value="EMI">EMI Payments</option>
                    <option value="Rent">Rent / Landlord</option>
                    <option value="Membership">Gym / Memberships</option>
                    <option value="Insurance">Insurance Premium</option>
                    <option value="Routine">Personal Routines</option>
                    <option value="Other">Other Obligations</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cycle Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full backdrop-blur-md bg-white/45 border-2 border-white/40 focus:border-indigo-500 rounded-2xl py-3 px-3 outline-none text-slate-800 text-xs font-bold cursor-pointer"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half yearly">Half Yearly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom interval">Custom Interval</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full backdrop-blur-md bg-white/40 border-2 border-white/40 focus:border-indigo-500 rounded-2xl py-2.5 px-3 outline-none text-slate-800 text-xs font-semibold shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full backdrop-blur-md bg-white/45 border-2 border-white/40 focus:border-indigo-500 rounded-2xl py-3 px-3 outline-none text-slate-800 text-xs font-bold cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Late Fee Estimate (₹)</label>
                  <input
                    type="number"
                    value={lateFeeEstimate}
                    onChange={(e) => setLateFeeEstimate(e.target.value)}
                    className="w-full backdrop-blur-md bg-white/40 border-2 border-white/40 focus:border-indigo-500 rounded-2xl py-2.5 px-3 outline-none text-slate-800 text-xs font-semibold shadow-inner"
                  />
                </div>
              </div>

              {/* Autopay enabled checkbox toggle */}
              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="autopayEnabled"
                  checked={autopayEnabled}
                  onChange={(e) => setAutopayEnabled(e.target.checked)}
                  className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="autopayEnabled" className="text-xs text-slate-600 font-bold select-none cursor-pointer">
                  Enable Autopay (auto-debited from linked account)
                </label>
              </div>

              <button
                type="submit"
                id="btn-add-commitment"
                className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/15 transition-all duration-200 scale-100 hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <span>Add Smart Commitment</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
