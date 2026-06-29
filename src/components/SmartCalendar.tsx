/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarEvent } from '../types';
import { 
  Calendar, Clock, Plus, Tag, ShieldAlert, Sparkles, 
  Check, Layout, List, ChevronLeft, ChevronRight, 
  Activity, Zap, Info, RefreshCw, BarChart2, ShieldCheck, 
  BookOpen, BrainCircuit, CalendarPlus2
} from 'lucide-react';

export const SmartCalendar: React.FC = () => {
  const { 
    tasks, 
    commitments, 
    habits, 
    roadmaps,
    addTask,
    calendarEvents,
    generateCalendarSchedule,
    optimizeWeek,
    balanceWorkload,
    recoverLostTime,
    updateCalendarEvents,
    moveCalendarEvent
  } = useApp();

  const [activeView, setActiveView] = useState<'day' | 'week' | 'month' | 'agenda' | 'timeline'>('week');
  const [selectedDate, setSelectedDate] = useState('2026-06-25'); // Anchored Today
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New task form states
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('2026-06-26');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [complexity, setComplexity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [category, setCategory] = useState<'Deep Work' | 'Study' | 'Coding' | 'Meetings' | 'Personal' | 'Exercise' | 'Learning' | 'Finance' | 'Commitments'>('Deep Work');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);

  // Dynamic completed focus hours from localStorage
  const [focusHours, setFocusHours] = useState(0);
  useEffect(() => {
    try {
      const historyStr = localStorage.getItem('lifepilot_focus_history');
      if (historyStr) {
        const history = JSON.parse(historyStr);
        const mins = history.reduce((acc: number, curr: any) => acc + (curr.durationMinutes || 0), 0);
        setFocusHours(Math.round((mins / 60) * 10) / 10);
      }
    } catch (e) {
      console.error(e);
    }
  }, [calendarEvents]); // Refresh if schedule changes

  // Dynamic learning hours from completed roadmap steps
  const completedSteps = roadmaps.reduce((acc, curr) => {
    return acc + (curr.steps?.filter(s => s.status === 'Completed').length || 0);
  }, 0);
  const learningHours = completedSteps * 1.5; // Assume 1.5 hours per completed lesson step

  // Seven days schedule starting from current date: Thursday, June 25, 2026
  const scheduleDays = [
    { date: '2026-06-25', name: 'Thursday', label: '25 Jun (Today)' },
    { date: '2026-06-26', name: 'Friday', label: '26 Jun' },
    { date: '2026-06-27', name: 'Saturday', label: '27 Jun' },
    { date: '2026-06-28', name: 'Sunday', label: '28 Jun' },
    { date: '2026-06-29', name: 'Monday', label: '29 Jun' },
    { date: '2026-06-30', name: 'Tuesday', label: '30 Jun' },
    { date: '2026-07-01', name: 'Wednesday', label: '1 Jul' },
  ];

  // Helper to determine what is scheduled for a given day (including default distribution and custom blocks)
  const getEventsForDay = (dateStr: string) => {
    return calendarEvents.filter(e => e.date === dateStr);
  };

  const getSmartColor = (colorName: string) => {
    switch (colorName) {
      case 'Green': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300';
      case 'Yellow': return 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300';
      case 'Red': return 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300';
      case 'Purple': return 'bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300';
      case 'Blue': return 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300';
      default: return 'bg-slate-500/10 border-slate-500/20 text-slate-700 dark:text-slate-300';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    // Add to main tasks list
    addTask({
      title,
      deadline,
      priority,
      complexity,
      category,
      estimatedHours,
      status: 'Todo',
      subtasks: []
    });

    // Also auto insert as calendar event block
    const newEvent: CalendarEvent = {
      id: `cal-${Date.now()}`,
      title,
      priority,
      effort: complexity,
      deadline,
      estimatedTime: `${estimatedHours} hours`,
      completionProbability: 85,
      stressImpact: complexity,
      energyLevel: priority,
      date: deadline,
      start: '10:00',
      end: `${10 + estimatedHours}:00`,
      category,
      color: priority === 'High' ? 'Red' : priority === 'Medium' ? 'Yellow' : 'Green'
    };

    updateCalendarEvents([...calendarEvents, newEvent]);

    // Reset Form
    setTitle('');
    setDeadline('2026-06-26');
    setPriority('Medium');
    setComplexity('Medium');
    setCategory('Deep Work');
    setEstimatedHours(2);
    setIsModalOpen(false);
  };

  // Drag and drop handlers
  const handleDragStart = (id: string) => {
    setDraggedEventId(id);
  };

  const handleDrop = (dateStr: string) => {
    if (draggedEventId) {
      moveCalendarEvent(draggedEventId, dateStr);
      setDraggedEventId(null);
    }
  };

  // Metrics calculations for Insights panel
  const tasksDueCount = tasks.filter(t => t.status !== 'Done').length;
  const totalMeetingsCount = calendarEvents.filter(e => e.category === 'Meetings').length;
  const highStressBlocks = calendarEvents.filter(e => e.stressImpact === 'High').length;
  const burnoutRisk = highStressBlocks >= 3 ? 'High' : highStressBlocks >= 1 ? 'Medium' : 'Low';

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 text-slate-900 dark:text-slate-100">
      
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black tracking-tight text-slate-950 dark:text-white">AI Calendar Intelligence</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Adaptive scheduling, workload balancing, and focus sync.</p>
        </div>

        {/* Calendar View Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center shadow-inner">
            {(['day', 'week', 'month', 'agenda', 'timeline'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  activeView === view
                    ? 'bg-white dark:bg-slate-700 text-indigo-650 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            id="btn-add-task-trigger"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl flex items-center space-x-1.5 shadow-md shadow-indigo-600/10 transition-all text-xs"
          >
            <Plus size={15} />
            <span>Schedule Block</span>
          </button>
        </div>
      </div>

      {/* AI Orchestrator Action Buttons */}
      <div className="bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 backdrop-blur-md rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="text-indigo-600 dark:text-indigo-400 shrink-0" size={18} />
          <div className="text-left">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Adaptive Schedule Engine</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Let LifePilot auto-recalculate and distribute study hours safely.</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
          <button
            onClick={() => generateCalendarSchedule(5, 'day')}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 text-slate-800 dark:text-slate-200 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <CalendarPlus2 size={13} />
            <span>Generate Day</span>
          </button>
          <button
            onClick={optimizeWeek}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 text-slate-800 dark:text-slate-200 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Zap size={13} className="text-indigo-600 dark:text-indigo-400" />
            <span>Optimize Week</span>
          </button>
          <button
            onClick={balanceWorkload}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 text-slate-800 dark:text-slate-200 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <BarChart2 size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Balance Workload</span>
          </button>
          <button
            onClick={recoverLostTime}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 text-slate-800 dark:text-slate-200 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCw size={13} className="text-rose-600 dark:text-rose-400" />
            <span>Recover Lost Time</span>
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT/CENTER 3 COLS: ACTIVE CALENDAR VIEW */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Calendar Rendering Block */}
          {calendarEvents.length === 0 ? (
            /* EMPTY STATE SCREEN */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[450px]">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-slate-400 dark:text-slate-500">
                <Calendar size={48} />
              </div>
              <div className="max-w-md">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">No schedule generated yet.</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-relaxed">
                  Let LifePilot AI distribute your pending roadmap steps, habits, and tasks across your calendar. Simply generate a calendar now.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => generateCalendarSchedule(5, 'day')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-indigo-600/10"
                >
                  Generate My Day
                </button>
                <button
                  onClick={() => generateCalendarSchedule(5, 'week')}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-sm font-bold py-2.5 px-6 rounded-xl transition-all"
                >
                  Generate My Week
                </button>
              </div>
            </div>
          ) : (
            /* RENDER THE ACTIVE CALENDAR VIEW */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs overflow-hidden">
              
              {/* Day View */}
              {activeView === 'day' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Clock size={16} className="text-indigo-500" />
                      <span>Timeline Schedule for {selectedDate === '2026-06-25' ? '25 Jun (Today)' : selectedDate}</span>
                    </h3>
                    <div className="flex items-center gap-1">
                      <select 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 border-none outline-none"
                      >
                        {scheduleDays.map(d => (
                          <option key={d.date} value={d.date}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Hour slots rendering */}
                    {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((hour) => {
                      // Match events that are scheduled for this date and roughly start near this hour
                      const matchingEvents = getEventsForDay(selectedDate).filter(e => e.start.startsWith(hour.split(':')[0]));
                      return (
                        <div key={hour} className="flex items-start gap-4 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
                          <div className="w-12 text-right text-[10px] text-slate-400 font-mono font-bold pt-1">{hour}</div>
                          <div className="flex-1 min-h-[48px] border-l-2 border-slate-100 dark:border-slate-800 pl-4 flex flex-col gap-1">
                            {matchingEvents.length === 0 ? (
                              <div className="text-[10px] text-slate-400 font-bold italic py-2">Open Slot</div>
                            ) : (
                              matchingEvents.map(e => (
                                <div
                                  key={e.id}
                                  className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${getSmartColor(e.color)}`}
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold">{e.title}</span>
                                    <span className="text-[9px] font-mono opacity-80">{e.start} - {e.end}</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono font-bold uppercase opacity-85">
                                    <span>{e.category}</span>
                                    <span>•</span>
                                    <span>Stress: {e.stressImpact}</span>
                                    <span>•</span>
                                    <span>Est: {e.estimatedTime}</span>
                                    <span>•</span>
                                    <span className="text-indigo-650 dark:text-indigo-300">Prob: {e.completionProbability}%</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Week View */}
              {activeView === 'week' && (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                  {scheduleDays.map((day) => {
                    const dayEvents = getEventsForDay(day.date);
                    const isToday = day.date === '2026-06-25';
                    return (
                      <div 
                        key={day.date}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(day.date)}
                        className={`rounded-2xl p-3 flex flex-col space-y-2 min-h-[360px] transition-all border ${
                          isToday 
                            ? 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-400/80 ring-2 ring-indigo-500/5' 
                            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                        }`}
                      >
                        <div className="border-b border-slate-200/50 dark:border-slate-800 pb-2 text-left">
                          <p className="font-bold text-xs text-slate-900 dark:text-white">{day.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono font-bold mt-0.5">{day.label}</p>
                        </div>

                        <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                          {dayEvents.length === 0 ? (
                            <span className="text-[10px] text-slate-400 font-bold text-center py-12 italic">Open Slot</span>
                          ) : (
                            dayEvents.map((e) => (
                              <div
                                key={e.id}
                                draggable
                                onDragStart={() => handleDragStart(e.id)}
                                className={`p-2.5 rounded-xl border text-[11px] leading-relaxed flex flex-col gap-1 shadow-xs cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all ${getSmartColor(e.color)}`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <span className="font-black line-clamp-2">{e.title}</span>
                                  <span className="text-[8px] font-bold bg-white/60 dark:bg-slate-800/80 px-1 py-0.2 rounded font-mono shrink-0">
                                    {e.start}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[8px] font-mono font-bold uppercase opacity-80 mt-1">
                                  <span>{e.category}</span>
                                  <span className="text-indigo-650 dark:text-indigo-300">P: {e.completionProbability}%</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Month View (June 2026 grid) */}
              {activeView === 'month' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Month View: June 2026</h3>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wide">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {/* Padding cells for June 1st which starts on Monday */}
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={`prev-${i}`} className="bg-slate-50/30 dark:bg-slate-900/10 min-h-[60px] rounded-lg p-1 opacity-20 border border-transparent">
                        <span className="text-[10px] font-bold text-slate-400">{i + 1}</span>
                      </div>
                    ))}
                    {/* Real schedule range */}
                    {scheduleDays.map((d, index) => {
                      const dayEvents = getEventsForDay(d.date);
                      return (
                        <div 
                          key={d.date} 
                          onClick={() => { setSelectedDate(d.date); setActiveView('day'); }}
                          className={`min-h-[65px] rounded-xl p-1.5 border text-left hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer ${
                            d.date === '2026-06-25' 
                              ? 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-400/80' 
                              : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                          }`}
                        >
                          <span className={`text-[10px] font-mono font-bold ${d.date === '2026-06-25' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400'}`}>
                            {25 + index}
                          </span>
                          {dayEvents.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              <div className="text-[9px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded px-1 py-0.2 truncate">
                                {dayEvents.length} AI Event{dayEvents.length > 1 ? 's' : ''}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {/* Fill in rest of month */}
                    {Array.from({ length: 29 }).map((_, i) => (
                      <div key={`next-${i}`} className="bg-slate-50/30 dark:bg-slate-900/10 min-h-[60px] rounded-lg p-1 opacity-20 border border-transparent">
                        <span className="text-[10px] font-bold text-slate-400">{2 + i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agenda View */}
              {activeView === 'agenda' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Agenda: List View</h3>
                  </div>

                  <div className="space-y-6">
                    {scheduleDays.map((d) => {
                      const dayEvents = getEventsForDay(d.date);
                      if (dayEvents.length === 0) return null;
                      return (
                        <div key={d.date} className="space-y-2 text-left">
                          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                            {d.label}
                          </h4>
                          <div className="space-y-2">
                            {dayEvents.map(e => (
                              <div 
                                key={e.id}
                                className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${getSmartColor(e.color)}`}
                              >
                                <div className="space-y-1">
                                  <h5 className="font-black text-sm">{e.title}</h5>
                                  <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono font-bold uppercase opacity-80">
                                    <span>{e.category}</span>
                                    <span>•</span>
                                    <span>Effort: {e.effort}</span>
                                    <span>•</span>
                                    <span>Deadline: {e.deadline}</span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                                  <div className="bg-white/40 dark:bg-slate-800/40 px-3 py-1 rounded-lg">
                                    <span className="font-bold block text-[8px] uppercase tracking-wider text-slate-400">Time Block</span>
                                    <span className="font-black text-[10px]">{e.start} - {e.end}</span>
                                  </div>
                                  <div className="bg-white/40 dark:bg-slate-800/40 px-3 py-1 rounded-lg">
                                    <span className="font-bold block text-[8px] uppercase tracking-wider text-slate-400">Stress impact</span>
                                    <span className="font-black text-[10px]">{e.stressImpact}</span>
                                  </div>
                                  <div className="bg-white/40 dark:bg-slate-800/40 px-3 py-1 rounded-lg">
                                    <span className="font-bold block text-[8px] uppercase tracking-wider text-slate-400">Success Probability</span>
                                    <span className="font-black text-[10px] text-indigo-650 dark:text-indigo-300">{e.completionProbability}%</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Timeline View */}
              {activeView === 'timeline' && (
                <div className="space-y-6 text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <BrainCircuit size={16} className="text-indigo-500" />
                      <span>AI Horizontal Focus Timeline (Today)</span>
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Legend block */}
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono font-bold uppercase opacity-80">
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded bg-blue-500/20 border border-blue-500/30"></div>
                        <span>Deep Work</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded bg-purple-500/20 border border-purple-500/30"></div>
                        <span>Learning / Coding</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/30"></div>
                        <span>Rest & Personal</span>
                      </div>
                    </div>

                    {/* Timeline slider representation */}
                    <div className="relative bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 shadow-inner min-h-[120px] flex items-stretch gap-1">
                      {/* Morning Sleep Slot */}
                      <div className="w-[20%] bg-slate-200/50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center p-2 text-center border border-dashed border-slate-300/40">
                        <span className="text-[9px] font-mono font-extrabold text-slate-400">00:00 - 08:00 Sleep Cycle</span>
                      </div>
                      {/* Active blocks from scheduled day June 25 */}
                      {getEventsForDay('2026-06-25').map((e, index) => {
                        let colorClass = 'bg-blue-500/20 border-blue-500/30';
                        if (e.category === 'Learning' || e.category === 'Coding') {
                          colorClass = 'bg-purple-500/20 border-purple-500/30';
                        } else if (e.category === 'Personal') {
                          colorClass = 'bg-emerald-500/20 border-emerald-500/30';
                        }
                        return (
                          <div 
                            key={e.id}
                            className={`flex-1 rounded-xl p-2.5 border text-left flex flex-col justify-between hover:scale-[1.01] transition-all cursor-pointer ${colorClass}`}
                          >
                            <span className="text-[10px] font-black line-clamp-2">{e.title}</span>
                            <span className="text-[8px] font-mono font-extrabold opacity-75 mt-1 block">{e.start} - {e.end}</span>
                          </div>
                        );
                      })}
                      {/* Late night buffer */}
                      <div className="w-[15%] bg-slate-200/50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center p-2 text-center border border-dashed border-slate-300/40">
                        <span className="text-[9px] font-mono font-extrabold text-slate-400">Buffer</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* RIGHT 1 COL: INSIGHTS & SUGGESTIONS SIDEBAR */}
        <div className="space-y-6">
          
          {/* Calendar Insights Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs text-left">
            <h3 className="font-bold text-sm text-slate-950 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Activity size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>Calendar Insights</span>
            </h3>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase font-mono block">Tasks Due</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">{tasksDueCount}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase font-mono block">Meetings</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">{totalMeetingsCount}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase font-mono block">Focus Hours</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block flex items-center gap-1">
                    <BrainCircuit size={15} className="text-indigo-500" />
                    <span>{focusHours}h</span>
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase font-mono block">Learning Hours</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block flex items-center gap-1">
                    <BookOpen size={15} className="text-purple-500" />
                    <span>{learningHours}h</span>
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase font-mono block">Burnout Risk</span>
                  <span className={`text-xs font-black mt-0.5 block ${burnoutRisk === 'High' ? 'text-rose-600' : 'text-amber-500'}`}>{burnoutRisk} Risk</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase font-mono block">Consistency Score</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">94% Stable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Suggestions Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs text-left space-y-3.5">
            <h3 className="font-bold text-sm text-slate-950 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles size={16} className="text-indigo-500" />
              <span>Smart Suggestions</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-50/50 dark:bg-slate-800 p-2 rounded-xl text-indigo-650 dark:text-indigo-400 shrink-0 mt-0.5">
                  <Clock size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Best Study Window</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    Your optimal focus performance aligns at **4:00 PM – 6:00 PM**. Avoid scheduling routine administrative tasks here.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-indigo-50/50 dark:bg-slate-800 p-2 rounded-xl text-indigo-650 dark:text-indigo-400 shrink-0 mt-0.5">
                  <Zap size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Peak Productivity Mode</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    Your cognitive bandwidth is highest during **Mornings (9 AM – 12 PM)**.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-indigo-50/50 dark:bg-slate-800 p-2 rounded-xl text-indigo-650 dark:text-indigo-400 shrink-0 mt-0.5">
                  <Info size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Recommended Break Interval</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    Take a 10-minute break after every **90 minutes** of intense coding blocks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Deadline Predictor Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs text-left">
            <h3 className="font-bold text-sm text-slate-950 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>AI Deadline Predictor</span>
            </h3>

            <div className="mt-4 space-y-3.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Hackathon Project</span>
                  <span className="text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md uppercase">
                    Risk: Medium
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-semibold">
                  <span>Completion Probability:</span>
                  <span className="font-extrabold text-indigo-650 dark:text-indigo-400">82%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '82%' }}></div>
                </div>
                <div className="text-[9px] text-slate-400 font-semibold mt-2">
                  💡 Suggested Action: Start high-focus block **Today** to avoid backlog congestion.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* SCHEDULING FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-2xl bg-white/90 dark:bg-slate-900/95 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200/55 dark:border-slate-850 overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-slate-950 dark:text-white">
                <CalendarPlus2 size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-display font-black text-base">Schedule Work Block</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Block Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DBMS Homework assignment, Git upskilling"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl py-2.5 px-3.5 outline-none text-slate-800 dark:text-white text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Date</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl py-2 px-3 outline-none text-slate-800 dark:text-white text-xs font-semibold font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={isNaN(estimatedHours) ? 2 : estimatedHours}
                    onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 2)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl py-2 px-3 outline-none text-slate-800 dark:text-white text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl py-2 px-1.5 outline-none text-slate-800 dark:text-white text-xs font-semibold"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Complexity</label>
                  <select
                    value={complexity}
                    onChange={(e) => setComplexity(e.target.value as any)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl py-2 px-1.5 outline-none text-slate-800 dark:text-white text-xs font-semibold"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl py-2 px-1.5 outline-none text-slate-800 dark:text-white text-xs font-semibold"
                  >
                    <option value="Deep Work">Deep Work</option>
                    <option value="Study">Study</option>
                    <option value="Coding">Coding</option>
                    <option value="Meetings">Meetings</option>
                    <option value="Personal">Personal</option>
                    <option value="Exercise">Exercise</option>
                    <option value="Learning">Learning</option>
                    <option value="Finance">Finance</option>
                    <option value="Commitments">Commitments</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-xl flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/15 transition-all text-xs"
              >
                <span>Add Custom Focus block</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
