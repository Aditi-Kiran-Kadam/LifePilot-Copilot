/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { 
  UserProfile, Task, Habit, Goal, Commitment, 
  Roadmap, PanicPlan, Message, AppAction, CalendarEvent,
  InterventionHistoryItem, PersonalizationSettings, GamificationState,
  StatisticsState, PersonaProfileData
} from '../types';

interface AppContextType {
  profile: UserProfile | null;
  updateProfile: (updatedProfile: Partial<UserProfile>) => void;
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  commitments: Commitment[];
  roadmaps: Roadmap[];
  panicPlan: PanicPlan | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  messages: Message[];
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  isAssistantLoading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  // App Operations
  onboardUser: (bio: string) => Promise<void>;
  resetOnboarding: () => void;
  addTask: (task: Omit<Task, 'id' | 'procrastinationCount'>) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  delayTask: (taskId: string) => void; // Procrastination engine trigger
  addHabit: (habit: Omit<Habit, 'id' | 'streak'>) => void;
  completeHabit: (habitId: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'progress'>) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  addCommitment: (commitment: Omit<Commitment, 'id' | 'paidThisPeriod'>) => void;
  payCommitment: (commitmentId: string) => void;
  deleteCommitment: (commitmentId: string) => void;
  updateCommitment: (commitmentId: string, updates: Partial<Commitment>) => void;
  generateRoadmap: (topic: string) => Promise<void>;
  updateRoadmapStep: (roadmapId: string, stepId: string, status: 'Pending' | 'InProgress' | 'Completed') => void;
  activatePanicMode: (deadlineTitle: string, remainingHours: number, currentProgress: string, complexity: string) => Promise<void>;
  deactivatePanicMode: (showMetrics?: boolean) => void;
  togglePanicStep: (index: number) => void;
  generateWeeklyReview: () => Promise<any>;
  sendAssistantMessage: (text: string) => Promise<void>;
  clearAssistantHistory: () => void;
  deleteHabit: (habitId: string) => void;
  deleteTask: (taskId: string) => void;
  rescheduleTask: (taskId: string, newDate: string) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
  copilotMemory: Record<string, any>;
  setCopilotMemory: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  executeAssistantAction: (action: AppAction) => Promise<{ success: boolean; feedback: string }>;
  updateMessageActionStatus: (messageId: string, status: 'confirmed' | 'cancelled', feedbacks?: string[]) => void;
  
  // AI Calendar Intelligence State & Operations
  calendarEvents: CalendarEvent[];
  generateCalendarSchedule: (freeHours?: number, mode?: 'day' | 'week') => void;
  optimizeWeek: () => void;
  balanceWorkload: () => void;
  recoverLostTime: () => void;
  updateCalendarEvents: (events: CalendarEvent[]) => void;
  moveCalendarEvent: (eventId: string, newDate: string, newStart?: string, newEnd?: string) => void;

  // Procrastination Engine UI state
  activeIntervention: {
    active: boolean;
    taskId?: string;
    habitId?: string;
    question: string;
    suggestions: string[];
  } | null;
  closeIntervention: () => void;
  applyInterventionSuggestion: (actionText: string) => void;
  triggerIntervention: (task: Task) => void;
  interventionHistory: InterventionHistoryItem[];
  addInterventionHistory: (item: Omit<InterventionHistoryItem, 'id' | 'timestamp'>) => void;
  focusSessionsSkipped: number;
  setFocusSessionsSkipped: React.Dispatch<React.SetStateAction<number>>;
  missedHabitCount: number;
  setMissedHabitCount: React.Dispatch<React.SetStateAction<number>>;
  toast: { message: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  hideToast: () => void;

  // Personalization Center States
  settings: PersonalizationSettings;
  updateSettings: (newSettings: Partial<PersonalizationSettings>) => void;
  gamification: GamificationState;
  setGamification: React.Dispatch<React.SetStateAction<GamificationState>>;
  addXP: (amount: number, reason: string) => void;
  userXP: number;
  setUserXP: React.Dispatch<React.SetStateAction<number>>;
  level: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  streak: number;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  badges: string[];
  setBadges: React.Dispatch<React.SetStateAction<string[]>>;
  completedChallenges: string[];
  setCompletedChallenges: React.Dispatch<React.SetStateAction<string[]>>;
  recentAchievement: { text: string; xp: number } | null;
  setRecentAchievement: React.Dispatch<React.SetStateAction<{ text: string; xp: number } | null>>;
  statistics: StatisticsState;
  incrementStat: (key: keyof StatisticsState, amount: number) => void;
  personaProfile: PersonaProfileData;
  updatePersonaProfile: (newProfile: Partial<PersonaProfileData>) => void;
  generatePersonaInsights: (data: any) => Promise<void>;
  weeklyCelebrationOpen: boolean;
  setWeeklyCelebrationOpen: (open: boolean) => void;
  switchDemoPersona: (personaName: 'aditi' | 'rajesh' | 'priya') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default seed data for brand new users - Fully initialized with Aditi Kadam's real workspace parameters
const defaultTasks: Task[] = [
  {
    id: 't-lp-1',
    title: 'DBMS Assignment',
    deadline: '2026-07-02',
    complexity: 'Medium',
    priority: 'High',
    status: 'Todo',
    subtasks: [
      { id: 'st-dbms-1', title: 'Complete ER diagram', completed: false },
      { id: 'st-dbms-2', title: 'Write SQL query schema solutions', completed: false }
    ],
    category: 'Academics',
    estimatedHours: 4,
    procrastinationCount: 0
  },
  {
    id: 't-lp-2',
    title: 'Operating Systems Assignment',
    deadline: '2026-07-04',
    complexity: 'High',
    priority: 'High',
    status: 'InProgress',
    subtasks: [
      { id: 'st-os-1', title: 'Implement Banker\'s Algorithm in C', completed: true },
      { id: 'st-os-2', title: 'Answer CPU Scheduling questions', completed: false }
    ],
    category: 'Academics',
    estimatedHours: 5,
    procrastinationCount: 0
  },
  {
    id: 't-lp-3',
    title: 'Computer Networks Assignment',
    deadline: '2026-07-06',
    complexity: 'Medium',
    priority: 'Medium',
    status: 'Todo',
    subtasks: [
      { id: 'st-cn-1', title: 'Explain TCP 3-way handshake', completed: false }
    ],
    category: 'Academics',
    estimatedHours: 3,
    procrastinationCount: 0
  },
  {
    id: 't-lp-4',
    title: 'LifePilot Deployment',
    deadline: '2026-06-29',
    complexity: 'Medium',
    priority: 'High',
    status: 'InProgress',
    subtasks: [
      { id: 'st-dep-1', title: 'Build production bundles', completed: true },
      { id: 'st-dep-2', title: 'Deploy to cloud runtime container', completed: false }
    ],
    category: 'Development',
    estimatedHours: 2,
    procrastinationCount: 0
  },
  {
    id: 't-lp-5',
    title: 'README Completion',
    deadline: '2026-06-29',
    complexity: 'Low',
    priority: 'Medium',
    status: 'InProgress',
    subtasks: [],
    category: 'Development',
    estimatedHours: 1,
    procrastinationCount: 0
  },
  {
    id: 't-lp-6',
    title: 'Submission Document',
    deadline: '2026-06-29',
    complexity: 'Low',
    priority: 'Medium',
    status: 'Todo',
    subtasks: [],
    category: 'Academics',
    estimatedHours: 2,
    procrastinationCount: 0
  },
  {
    id: 't-lp-7',
    title: 'Demo Video Recording',
    deadline: '2026-06-29',
    complexity: 'Medium',
    priority: 'High',
    status: 'Todo',
    subtasks: [],
    category: 'Development',
    estimatedHours: 2,
    procrastinationCount: 0
  },
  {
    id: 't-lp-8',
    title: 'Hackathon Final Submission',
    deadline: '2026-06-29',
    complexity: 'High',
    priority: 'High',
    status: 'InProgress',
    subtasks: [
      { id: 'st-hack-1', title: 'Verify core full-stack features', completed: true },
      { id: 'st-hack-2', title: 'Push codebase to GitHub repository', completed: false }
    ],
    category: 'Development',
    estimatedHours: 4,
    procrastinationCount: 0
  },
  {
    id: 't-lp-9',
    title: 'Resume Review',
    deadline: '2026-07-10',
    complexity: 'Low',
    priority: 'Medium',
    status: 'Todo',
    subtasks: [],
    category: 'Career',
    estimatedHours: 1,
    procrastinationCount: 0
  },
  {
    id: 't-lp-10',
    title: 'Placement Preparation',
    deadline: '2026-07-15',
    complexity: 'High',
    priority: 'High',
    status: 'InProgress',
    subtasks: [
      { id: 'st-prep-1', title: 'Revise Tree and Graph concepts', completed: false },
      { id: 'st-prep-2', title: 'Practice system design mock templates', completed: false }
    ],
    category: 'Career',
    estimatedHours: 6,
    procrastinationCount: 0
  }
];

const defaultHabits: Habit[] = [
  { id: 'h-lp-1', title: 'Coding Practice', frequency: 'daily', streak: 12, completedToday: true },
  { id: 'h-lp-2', title: 'LeetCode Daily', frequency: 'daily', streak: 12, completedToday: true },
  { id: 'h-lp-3', title: 'Exercise', frequency: 'daily', streak: 5, completedToday: false },
  { id: 'h-lp-4', title: 'Reading', frequency: 'daily', streak: 7, completedToday: true },
  { id: 'h-lp-5', title: 'Journal Reflection', frequency: 'daily', streak: 4, completedToday: false }
];

const defaultGoals: Goal[] = [
  {
    id: 'g-lp-1',
    title: 'Become Software Engineer',
    category: 'Career',
    progress: 75,
    deadline: '2027-06-01',
    milestones: [
      { id: 'm-g1-1', title: 'Master Data Structures and Algorithms', completed: true },
      { id: 'm-g1-2', title: 'Build strong project portfolio', completed: true },
      { id: 'm-g1-3', title: 'Crack placements coding rounds', completed: false }
    ]
  },
  {
    id: 'g-lp-2',
    title: 'Master Full Stack Development',
    category: 'Career',
    progress: 60,
    deadline: '2026-12-31',
    milestones: [
      { id: 'm-g2-1', title: 'Learn React ecosystem', completed: true },
      { id: 'm-g2-2', title: 'Learn Node/Express and DB structures', completed: true },
      { id: 'm-g2-3', title: 'Build modular production apps', completed: false }
    ]
  },
  {
    id: 'g-lp-3',
    title: 'Learn Docker',
    category: 'Academics',
    progress: 80,
    deadline: '2026-07-15',
    milestones: [
      { id: 'm-g3-1', title: 'Understand Docker concepts & images', completed: true },
      { id: 'm-g3-2', title: 'Write production Dockerfiles', completed: true },
      { id: 'm-g3-3', title: 'Manage multi-container setups via Compose', completed: false }
    ]
  },
  {
    id: 'g-lp-4',
    title: 'Learn Kubernetes',
    category: 'Academics',
    progress: 40,
    deadline: '2026-08-30',
    milestones: [
      { id: 'm-g4-1', title: 'Learn Pods, Deployments and Services', completed: true },
      { id: 'm-g4-2', title: 'Set up multi-node local cluster', completed: false },
      { id: 'm-g4-3', title: 'Configure auto-scaling systems', completed: false }
    ]
  },
  {
    id: 'g-lp-5',
    title: 'Prepare for Placements',
    category: 'Career',
    progress: 50,
    deadline: '2026-09-15',
    milestones: [
      { id: 'm-g5-1', title: 'Solve core 200+ DSA coding questions', completed: true },
      { id: 'm-g5-2', title: 'Revise OS, DBMS, and CN concepts', completed: false },
      { id: 'm-g5-3', title: 'Attempt mock technical interview rounds', completed: false }
    ]
  },
  {
    id: 'g-lp-6',
    title: 'Build 10 Projects',
    category: 'Personal',
    progress: 40,
    deadline: '2026-12-31',
    milestones: [
      { id: 'm-g6-1', title: 'Build 4 beginner level projects', completed: true },
      { id: 'm-g6-2', title: 'Build 4 intermediate level projects', completed: false },
      { id: 'm-g6-3', title: 'Build 2 advanced full-stack projects', completed: false }
    ]
  }
];

const defaultCommitments: Commitment[] = [
  {
    id: 'c-lp-1',
    title: 'Hackathon Submission',
    amount: '₹0',
    category: 'Project',
    frequency: 'one-time',
    dueDate: '2026-06-29',
    paidThisPeriod: false,
    priority: 'High',
    autopayEnabled: false,
    lateFeeEstimate: 0,
    status: 'Unpaid'
  },
  {
    id: 'c-lp-2',
    title: 'Deployment',
    amount: '₹0',
    category: 'Project',
    frequency: 'one-time',
    dueDate: '2026-06-29',
    paidThisPeriod: false,
    priority: 'High',
    autopayEnabled: false,
    lateFeeEstimate: 0,
    status: 'Unpaid'
  },
  {
    id: 'c-lp-3',
    title: 'README',
    amount: '₹0',
    category: 'Project',
    frequency: 'one-time',
    dueDate: '2026-06-29',
    paidThisPeriod: false,
    priority: 'High',
    autopayEnabled: false,
    lateFeeEstimate: 0,
    status: 'Unpaid'
  },
  {
    id: 'c-lp-4',
    title: 'Demo Video',
    amount: '₹0',
    category: 'Project',
    frequency: 'one-time',
    dueDate: '2026-06-29',
    paidThisPeriod: false,
    priority: 'High',
    autopayEnabled: false,
    lateFeeEstimate: 0,
    status: 'Unpaid'
  },
  {
    id: 'c-lp-5',
    title: 'Submission Document',
    amount: '₹0',
    category: 'Project',
    frequency: 'one-time',
    dueDate: '2026-06-29',
    paidThisPeriod: false,
    priority: 'High',
    autopayEnabled: false,
    lateFeeEstimate: 0,
    status: 'Unpaid'
  },
  {
    id: 'c-lp-new-1',
    title: '💳 Internet Bill',
    amount: '₹999',
    category: 'Bills',
    frequency: 'Monthly',
    dueDate: '2026-06-29',
    paidThisPeriod: false,
    priority: 'Medium',
    autopayEnabled: false,
    lateFeeEstimate: 0,
    status: 'Unpaid'
  },
  {
    id: 'c-lp-new-2',
    title: '📱 Mobile Recharge',
    amount: '₹299',
    category: 'Bills',
    frequency: 'Monthly',
    dueDate: '2026-07-02',
    paidThisPeriod: false,
    priority: 'Medium',
    autopayEnabled: false,
    lateFeeEstimate: 0,
    status: 'Unpaid'
  },
  {
    id: 'c-lp-new-3',
    title: '🎓 Semester Fee Installment',
    amount: '₹18,000',
    category: 'College Fees',
    frequency: 'one-time',
    dueDate: '2026-07-15',
    paidThisPeriod: false,
    priority: 'High',
    autopayEnabled: false,
    lateFeeEstimate: 0,
    status: 'Unpaid'
  },
  {
    id: 'c-lp-new-4',
    title: '🎵 Spotify Premium',
    amount: '₹119',
    category: 'Subscriptions',
    frequency: 'Monthly',
    dueDate: '2026-07-05',
    paidThisPeriod: false,
    priority: 'Low',
    autopayEnabled: false,
    lateFeeEstimate: 0,
    status: 'Unpaid'
  },
  {
    id: 'c-lp-new-5',
    title: '📚 Library Book Return',
    amount: '₹0',
    category: 'Other',
    frequency: 'one-time',
    dueDate: '2026-07-01',
    paidThisPeriod: false,
    priority: 'Low',
    autopayEnabled: false,
    lateFeeEstimate: 10,
    status: 'Unpaid',
    notes: 'Penalty: ₹10/day'
  },
  {
    id: 'c-lp-new-6',
    title: '☁️ Portfolio Hosting Renewal',
    amount: '₹499/year',
    category: 'Subscriptions',
    frequency: 'Yearly',
    dueDate: '2026-07-20',
    paidThisPeriod: false,
    priority: 'Medium',
    autopayEnabled: false,
    lateFeeEstimate: 0,
    status: 'Unpaid'
  },
  {
    id: 'c-lp-new-7',
    title: '💻 Coding Practice',
    amount: '₹0',
    category: 'Habits',
    frequency: 'Daily',
    dueDate: '2026-06-29',
    paidThisPeriod: false,
    priority: 'Medium',
    autopayEnabled: false,
    lateFeeEstimate: 0,
    status: 'Unpaid',
    notes: 'Streak: 12 Days | Goal: Maintain Daily Habit'
  },
  {
    id: 'c-lp-new-8',
    title: '🚀 Hackathon Registration',
    amount: '₹0',
    category: 'Project',
    frequency: 'one-time',
    dueDate: '2026-07-10',
    paidThisPeriod: false,
    priority: 'High',
    autopayEnabled: false,
    lateFeeEstimate: 0,
    status: 'Unpaid',
    notes: 'Status: Upcoming'
  }
];

const defaultRoadmaps: Roadmap[] = [
  {
    id: 'r-lp-1',
    topic: 'Linux',
    progress: 70,
    steps: [
      { id: 'r1-s1', title: 'File System Hierarchy & Basics', description: 'Master navigation, listing, permissions, and basic file operations.', estimatedHours: 4, status: 'Completed' },
      { id: 'r1-s2', title: 'User Administration & Processes', description: 'Understand process hierarchy, signals, scheduling priorities, and background tasks.', estimatedHours: 6, status: 'Completed' },
      { id: 'r1-s3', title: 'Shell Scripting & Networking', description: 'Write bash utilities, handle environment variables, and diagnose network interfaces.', estimatedHours: 8, status: 'InProgress' }
    ]
  },
  {
    id: 'r-lp-2',
    topic: 'Docker',
    progress: 80,
    steps: [
      { id: 'r2-s1', title: 'Images and Containers', description: 'Learn layers, base images, cache hits, running detached states.', estimatedHours: 4, status: 'Completed' },
      { id: 'r2-s2', title: 'Dockerfiles & Environment Variables', description: 'Write optimized Dockerfiles with multi-stage builds.', estimatedHours: 6, status: 'Completed' },
      { id: 'r2-s3', title: 'Docker Compose Architecture', description: 'Orchestrate multi-container applications (Node + DB).', estimatedHours: 8, status: 'InProgress' }
    ]
  },
  {
    id: 'r-lp-3',
    topic: 'Kubernetes',
    progress: 30,
    steps: [
      { id: 'r3-s1', title: 'Pods, Deployments, and Services', description: 'Understand YAML configuration structures for resilient containers.', estimatedHours: 8, status: 'Completed' },
      { id: 'r3-s2', title: 'Persistent Volumes and StatefulSets', description: 'Handle storage state across pod restarts.', estimatedHours: 10, status: 'Pending' },
      { id: 'r3-s3', title: 'Ingress and Secret Management', description: 'Control external traffic routing and sensitive environment variables.', estimatedHours: 12, status: 'Pending' }
    ]
  },
  {
    id: 'r-lp-4',
    topic: 'DSA',
    progress: 60,
    steps: [
      { id: 'r4-s1', title: 'Linear Structures and Complexity', description: 'Master Arrays, Linked Lists, Stacks, Queues, and Big O analysis.', estimatedHours: 15, status: 'Completed' },
      { id: 'r4-s2', title: 'Non-linear Structures', description: 'Master Binary Trees, Heaps, BSTs, and Graphs.', estimatedHours: 25, status: 'InProgress' },
      { id: 'r4-s3', title: 'Advanced Dynamic Programming', description: 'Solve knapsack, partition, and optimized caching algorithms.', estimatedHours: 30, status: 'Pending' }
    ]
  },
  {
    id: 'r-lp-5',
    topic: 'Web Development',
    progress: 85,
    steps: [
      { id: 'r5-s1', title: 'React Ecosystem and State Management', description: 'Hooks, Custom states, Context API, performance optimization.', estimatedHours: 20, status: 'Completed' },
      { id: 'r5-s2', title: 'API Integration & Middleware servers', description: 'Write clean Express endpoints, CORS, secure proxy lines.', estimatedHours: 15, status: 'Completed' },
      { id: 'r5-s3', title: 'Production bundling & optimization', description: 'Configure Vite, esbuild, bundle splitting, and standalone production runtimes.', estimatedHours: 10, status: 'InProgress' }
    ]
  },
  {
    id: 'r-lp-6',
    topic: 'System Design',
    progress: 20,
    steps: [
      { id: 'r6-s1', title: 'Scalability & Load Balancing', description: 'Learn horizontal scaling, reverse proxies, and session management.', estimatedHours: 12, status: 'Completed' },
      { id: 'r6-s2', title: 'Database Partitioning & Sharding', description: 'Compare Relational vs NoSQL, master caching strategies with Redis.', estimatedHours: 18, status: 'Pending' }
    ]
  },
  {
    id: 'r-lp-7',
    topic: 'DevOps',
    progress: 40,
    steps: [
      { id: 'r7-s1', title: 'CI/CD Pipelines', description: 'Configure GitHub Actions, automated tests, linting gates.', estimatedHours: 10, status: 'Completed' },
      { id: 'r7-s2', title: 'Infrastructure as Code', description: 'Manage resources programmatically via Terraform.', estimatedHours: 15, status: 'Pending' }
    ]
  }
];

const generateHeuristicPersonaInsights = (
  role: string,
  interests: string[] = [],
  skills: string[] = [],
  goals: string[] = [],
  learningPreferences: string[] = [],
  focusPatterns: string[] = [],
  energyPatterns: string[] = [],
  stressTrends: string[] = [],
  habits: string[] = [],
  productivityStyle: string = '',
  careerAspirations: string = ''
): PersonaProfileData => {
  let dynamicPersona = `${role || 'Focus'} Explorer`;
  let productivityArchetype = 'Systems Thinker';

  if (role === 'Student') {
    dynamicPersona = 'Aspiring Software Engineer';
    productivityArchetype = 'Consistency Champion';
  } else if (role === 'Developer') {
    dynamicPersona = 'Focused Builder';
    productivityArchetype = 'Systems Thinker';
  } else if (role === 'Researcher') {
    dynamicPersona = 'Creative Explorer';
    productivityArchetype = 'Systems Thinker';
  } else if (role === 'Founder' || role === 'Entrepreneur') {
    dynamicPersona = 'Startup Founder';
    productivityArchetype = 'Consistency Champion';
  } else if (role === 'Freelancer') {
    dynamicPersona = 'Creative Explorer';
    productivityArchetype = 'Creative Explorer';
  } else if (role === 'Designer' || role === 'Creator') {
    dynamicPersona = 'Creative Explorer';
    productivityArchetype = 'Creative Explorer';
  } else if (role === 'Professional') {
    dynamicPersona = 'Systems Thinker';
    productivityArchetype = 'Systems Thinker';
  }

  const strengths = [
    `Strong background in ${skills[0] || 'solving complex tasks'}`,
    `Self-motivated approach toward ${goals[0] || 'your core objectives'}`,
    `Adaptable learning pattern matching ${learningPreferences[0] || 'highly structured concepts'}`
  ];

  const growthOpportunities = [
    `Strengthening focus during peak ${stressTrends[0] || 'deadline pressure'} times`,
    `Expanding domain expertise in ${interests[0] || 'cross-functional topics'}`,
    `Managing context-switching during ${focusPatterns[0] || 'multitasking'} periods`
  ];

  const currentIdentity = `A dedicated and ambitious ${role || 'individual'} utilizing tactical focus to excel in ${careerAspirations || 'professional goals'}. You prefer ${learningPreferences.join(', ') || 'structured visual and interactive learning'} with an energy pattern of ${energyPatterns[0] || 'morning high velocity'}.`;

  const suggestedImprovements = [
    `Establish a dedicated deep-focus block matching your energy peak: ${energyPatterns[0] || 'morning'}`,
    `Implement daily habit check-ins for: ${habits.slice(0, 2).join(', ') || 'regular hydration and short study breaks'}`,
    `Protect focus boundaries when dealing with: ${stressTrends[0] || 'deadline urgency'}`
  ];

  return {
    dynamicPersona,
    productivityArchetype,
    strengths,
    growthOpportunities,
    currentIdentity,
    suggestedImprovements
  };
};

const getLevelName = (lvl: number): string => {
  if (lvl === 1) return 'Beginner';
  if (lvl === 2) return 'Strategist';
  if (lvl === 3) return 'Engineer';
  if (lvl === 4) return 'Architect';
  return 'Mastermind';
};

// Ensure Aditi's personal workspace is pre-configured and logged in on first-load
if (typeof window !== 'undefined' && !localStorage.getItem("lifepilotAuthenticated")) {
  const userProfilePayload = {
    name: "Aditi Kadam",
    email: "aditi@university.edu",
    department: "Computer Science",
    semester: "Third Year",
    careerGoal: "Software Engineer",
    goal: "Software Engineer",
    avatar: "🎓",
    college: "University Department of Computer Science",
    role: "Student"
  };
  localStorage.setItem("lifepilot_user", JSON.stringify(userProfilePayload));
  localStorage.setItem("lifepilotUser", JSON.stringify(userProfilePayload));
  // Keep authenticated as false initially so splash and login pages are presented on first-load
  // localStorage.setItem("lifepilotAuthenticated", "true");
  // localStorage.setItem("lifepilot_seen_intro", "true");
  
  const lpProfileData = {
    name: "Aditi Kadam",
    role: "Student",
    bio: "Computer Science Student in Third Year, preparing for Software Engineer career goal.",
    strengths: ["Rigorous DSA skills", "Keen curiosity", "Strong Linux terminal proficiency"],
    challenges: ["Context switching under heavy workload", "Occasions of exam-season anxiety"],
    coreGoals: ["Become Software Engineer", "Prepare for Placements", "Master Full Stack Development"],
    interests: ["Linux", "Docker", "Kubernetes", "DSA", "Web Development", "System Design", "DevOps"],
    growthAreas: ["Effective time boxing", "Project portfolio construction"],
    recommendedSkills: ["Docker", "Kubernetes", "DSA", "Linux", "Web Development"],
    onboarded: true
  };
  localStorage.setItem("lp_profile", JSON.stringify(lpProfileData));
  localStorage.setItem("userXP", "420");
  localStorage.setItem("level", "3");
  localStorage.setItem("streak", "12");
  localStorage.setItem("badges", JSON.stringify(['First Login', 'First Focus Session', 'First Roadmap', '7 Day Coding Streak', 'Hackathon Builder']));
  localStorage.setItem("completedChallenges", JSON.stringify([]));
  
  // Pre-seed tasks, habits, goals, commitments, roadmaps in local storage
  localStorage.setItem("lp_tasks", JSON.stringify(defaultTasks));
  localStorage.setItem("lp_habits", JSON.stringify(defaultHabits));
  localStorage.setItem("lp_goals", JSON.stringify(defaultGoals));
  localStorage.setItem("lp_commitments", JSON.stringify(defaultCommitments));
  localStorage.setItem("lp_roadmaps", JSON.stringify(defaultRoadmaps));
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('lp_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    
    const seededProfile: UserProfile = {
      name: 'Aditi Kadam',
      role: 'Student',
      bio: 'Computer Science Student in Third Year, preparing for Software Engineer career goal.',
      strengths: ['Rigorous DSA skills', 'Keen curiosity', 'Strong Linux terminal proficiency'],
      challenges: ['Context switching under heavy workload', 'Occasions of exam-season anxiety'],
      coreGoals: ['Become Software Engineer', 'Prepare for Placements', 'Master Full Stack Development'],
      interests: ['Linux', 'Docker', 'Kubernetes', 'DSA', 'Web Development', 'System Design', 'DevOps'],
      growthAreas: ['Effective time boxing', 'Project portfolio construction'],
      recommendedSkills: ['Docker', 'Kubernetes', 'DSA', 'Linux', 'Web Development'],
      onboarded: true
    };
    try {
      localStorage.setItem('lp_profile', JSON.stringify(seededProfile));
    } catch {}
    return seededProfile;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('lp_tasks');
      return saved ? JSON.parse(saved) : defaultTasks;
    } catch {
      return defaultTasks;
    }
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem('lp_habits');
      return saved ? JSON.parse(saved) : defaultHabits;
    } catch {
      return defaultHabits;
    }
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem('lp_goals');
      return saved ? JSON.parse(saved) : defaultGoals;
    } catch {
      return defaultGoals;
    }
  });

  const [commitments, setCommitments] = useState<Commitment[]>(() => {
    try {
      const saved = localStorage.getItem('lp_commitments');
      let current = saved ? JSON.parse(saved) : defaultCommitments;
      const requiredTitles = [
        '💳 Internet Bill',
        '📱 Mobile Recharge',
        '🎓 Semester Fee Installment',
        '🎵 Spotify Premium',
        '📚 Library Book Return',
        '☁️ Portfolio Hosting Renewal',
        '💻 Coding Practice',
        '🚀 Hackathon Registration'
      ];
      const hasNewCommitments = current.some((c: any) => requiredTitles.includes(c.title));
      if (!hasNewCommitments) {
        const missing = defaultCommitments.filter(dc => !current.some((cc: any) => cc.title === dc.title));
        if (missing.length > 0) {
          current = [...current, ...missing];
        }
      }
      return current;
    } catch {
      return defaultCommitments;
    }
  });

  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(() => {
    try {
      const saved = localStorage.getItem('lp_roadmaps');
      return saved ? JSON.parse(saved) : defaultRoadmaps;
    } catch {
      return defaultRoadmaps;
    }
  });

  const [panicPlan, setPanicPlan] = useState<PanicPlan | null>(() => {
    try {
      const saved = localStorage.getItem('lp_panic');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      return localStorage.getItem('lp_active_tab') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const [copilotMemory, setCopilotMemory] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('lp_copilot_memory');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('lp_calendar_events');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('lp_messages');
      return saved ? JSON.parse(saved) : [
        {
          id: 'msg-init',
          sender: 'ai',
          text: 'Hello! I am your LifePilot Copilot Companion. I can help you plan your schedule, trigger focus timers, outline learning pathways, or configure Panic Mode. What would you like to accomplish today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    } catch {
      return [
        {
          id: 'msg-init',
          sender: 'ai',
          text: 'Hello! I am your LifePilot Copilot Companion. I can help you plan your schedule, trigger focus timers, outline learning pathways, or configure Panic Mode. What would you like to accomplish today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    }
  });

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

  // Intervention modal state
  const [activeIntervention, setActiveIntervention] = useState<{
    active: boolean;
    taskId?: string;
    habitId?: string;
    question: string;
    suggestions: string[];
  } | null>(null);

  const [interventionHistory, setInterventionHistory] = useState<InterventionHistoryItem[]>(() => {
    const saved = localStorage.getItem('lifepilot_intervention_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return [
      {
        id: 'int-1',
        type: 'procrastination',
        title: 'Review DBMS Assignment',
        questionOrMessage: "DBMS assignment delayed multiple times. Block bypassed.",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'Accepted',
        actionTaken: 'Broke into microtasks',
        impactMetrics: '+15% Focus Efficiency'
      },
      {
        id: 'int-2',
        type: 'burnout',
        title: 'High Load Alert',
        questionOrMessage: "Completed 18 hours of work in the last two days. Burnout risk detected.",
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'Accepted',
        actionTaken: 'Took a 30-minute recovery block',
        impactMetrics: 'Paced Workload Saved'
      },
      {
        id: 'int-3',
        type: 'momentum',
        title: 'Coding Streak broken',
        questionOrMessage: "Your LeetCode streak ended yesterday. Restarted with simple task.",
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        status: 'Accepted',
        actionTaken: 'Resume Habit',
        impactMetrics: '10-min study loop activated'
      },
      {
        id: 'int-4',
        type: 'deadline',
        title: 'Deadline Approaching',
        questionOrMessage: "3 assignments due in 48 hours. Secure critical path.",
        timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
        status: 'Ignored',
        actionTaken: 'Postponed micro-prep',
        impactMetrics: 'No action'
      }
    ];
  });

  const [focusSessionsSkipped, setFocusSessionsSkipped] = useState<number>(() => {
    const saved = localStorage.getItem('lifepilot_focus_skipped_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [missedHabitCount, setMissedHabitCount] = useState<number>(() => {
    const saved = localStorage.getItem('lifepilot_missed_habit_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('lifepilot_intervention_history', JSON.stringify(interventionHistory));
  }, [interventionHistory]);

  useEffect(() => {
    localStorage.setItem('lifepilot_focus_skipped_count', focusSessionsSkipped.toString());
  }, [focusSessionsSkipped]);

  useEffect(() => {
    localStorage.setItem('lifepilot_missed_habit_count', missedHabitCount.toString());
  }, [missedHabitCount]);

  // Toast notifications state and actions
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  // --- Personalization & Gamification States ---
  const { settings, updateSettings, resetTheme } = useTheme();

  // Unified Theme support mapped to Personalization Settings
  const theme = settings.themeMode === 'system'
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : (settings.themeMode === 'light' ? 'light' : 'dark');

  const toggleTheme = () => {
    const nextMode = theme === 'dark' ? 'light' : 'dark';
    updateSettings({ themeMode: nextMode });
  };

  const [userXP, setUserXP] = useState<number>(() => {
    const saved = localStorage.getItem('userXP');
    if (saved !== null) return parseInt(saved);
    // Newly installed AI OS: Set to Aditi Kadam's real stats
    localStorage.setItem('userXP', '420');
    localStorage.setItem('level', '3');
    localStorage.setItem('streak', '12');
    localStorage.setItem('badges', JSON.stringify(['First Login', 'First Focus Session', 'First Roadmap', '7 Day Coding Streak', 'Hackathon Builder']));
    localStorage.setItem('completedChallenges', JSON.stringify([]));
    return 420;
  });

  const [level, setLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('level') || '3');
  });

  const [streak, setStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('streak') || '12');
  });

  const [badges, setBadges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('badges');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['First Login', 'First Focus Session', 'First Roadmap', '7 Day Coding Streak', 'Hackathon Builder'];
  });

  const [completedChallenges, setCompletedChallenges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('completedChallenges');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [recentAchievement, setRecentAchievement] = useState<{ text: string; xp: number } | null>(null);

  // Sync states to local storage
  useEffect(() => {
    localStorage.setItem('userXP', userXP.toString());
  }, [userXP]);

  useEffect(() => {
    localStorage.setItem('level', level.toString());
  }, [level]);

  useEffect(() => {
    localStorage.setItem('streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));
  }, [completedChallenges]);

  const [statistics, setStatistics] = useState<StatisticsState>(() => {
    try {
      const saved = localStorage.getItem('lp_statistics');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          tasksCompleted: parsed.tasksCompleted ?? 14,
          hoursFocused: parsed.hoursFocused ?? 8.5,
          lessonsWatched: parsed.lessonsWatched ?? 3,
          habitsMaintained: parsed.habitsMaintained ?? 22,
          commitmentsPaid: parsed.commitmentsPaid ?? 4,
          goalsAchieved: parsed.goalsAchieved ?? 1,
          focusSessionsCompleted: parsed.focusSessionsCompleted ?? 12,
          panicSessionsRecovered: parsed.panicSessionsRecovered ?? 2,
          pathwaysCompleted: parsed.pathwaysCompleted ?? 1,
          nightOwlConsecutiveDays: parsed.nightOwlConsecutiveDays ?? 3,
          tasksCompletedBeforeDeadline: parsed.tasksCompletedBeforeDeadline ?? 4
        };
      }
    } catch {}
    return {
      tasksCompleted: 14,
      hoursFocused: 8.5,
      lessonsWatched: 3,
      habitsMaintained: 22,
      commitmentsPaid: 4,
      goalsAchieved: 1,
      focusSessionsCompleted: 12,
      panicSessionsRecovered: 2,
      pathwaysCompleted: 1,
      nightOwlConsecutiveDays: 3,
      tasksCompletedBeforeDeadline: 4
    };
  });

  const gamification = React.useMemo<GamificationState>(() => {
    return {
      xp: userXP,
      level,
      badges,
      streak,
      achievements: [
        { id: 'streak-7', title: '7 Day Streak', description: 'Maintain a 7-day habit streak', unlocked: streak >= 7 },
        { id: 'streak-30', title: '30 Day Streak', description: 'Maintain a 30-day habit streak', unlocked: streak >= 30 },
        { id: 'focus-100', title: 'Deep Worker', description: 'Complete 100 focus hours', unlocked: badges.includes('Focus Master') },
        { id: 'tasks-50', title: 'Task Slayer', description: 'Complete 50 tasks', unlocked: badges.includes('Productivity Beast') },
        { id: 'goals-10', title: 'Goal Master', description: 'Achieve 10 goals', unlocked: badges.includes('Consistency Warrior') },
        { id: 'lessons-100', title: 'Learning Machine', description: 'Complete 100 master lessons', unlocked: badges.includes('Lifelong Learner') },
        { id: 'deadline-defender', title: '🏆 Deadline Defender', description: 'Complete 10 tasks before deadline', unlocked: (statistics.tasksCompletedBeforeDeadline ?? 0) >= 10 },
        { id: 'productivity-master', title: '🎯 Productivity Master', description: 'Complete 25 focus sessions', unlocked: (statistics.focusSessionsCompleted ?? 0) >= 25 },
        { id: 'panic-survivor', title: '⚡ Panic Survivor', description: 'Successfully recover from 5 panic mode sessions', unlocked: (statistics.panicSessionsRecovered ?? 0) >= 5 },
        { id: 'learning-enthusiast', title: '🧠 Learning Enthusiast', description: 'Finish 5 learning pathways', unlocked: (statistics.pathwaysCompleted ?? 0) >= 5 },
        { id: 'night-owl', title: '🌙 Night Owl', description: 'Work after 10 PM for 7 consecutive days', unlocked: (statistics.nightOwlConsecutiveDays ?? 0) >= 7 }
      ]
    };
  }, [userXP, level, badges, streak, statistics]);

  const setGamification = React.useCallback((val: React.SetStateAction<GamificationState>) => {
    const nextVal = typeof val === 'function' ? val({ xp: userXP, level, badges, streak, achievements: [] }) : val;
    setUserXP(nextVal.xp);
    setLevel(nextVal.level);
    setBadges(nextVal.badges);
    setStreak(nextVal.streak);
  }, [userXP, level, badges, streak]);

  const [personaProfile, setPersonaProfile] = useState<PersonaProfileData>(() => {
    try {
      const saved = localStorage.getItem('lp_persona_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      dynamicPersona: 'Consistency Champion',
      productivityArchetype: 'Systems Thinker',
      strengths: ['Highly curious mindset', 'Self-motivated approach', 'Strong focus commitment'],
      growthOpportunities: ['Sleep schedule consistency', 'Context switching under heavy loads', 'Overcommitment management'],
      currentIdentity: 'An ambitious explorer using digital tools to automate, focus, and optimize life velocity. You prefer structured learning environments.',
      suggestedImprovements: ['Establish a deep focus block during high energy hours', 'Protect focus boundaries by logging recovery sessions', 'Integrate consistent mini hydration habits']
    };
  });

  const [weeklyCelebrationOpen, setWeeklyCelebrationOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('lp_personalization_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('lp_gamification', JSON.stringify(gamification));
  }, [gamification]);

  useEffect(() => {
    localStorage.setItem('lp_statistics', JSON.stringify(statistics));
  }, [statistics]);

  useEffect(() => {
    localStorage.setItem('lp_persona_profile', JSON.stringify(personaProfile));
  }, [personaProfile]);

  const addXP = (amount: number, reason: string) => {
    setUserXP(prev => {
      const nextXp = prev + amount;
      localStorage.setItem('userXP', nextXp.toString());
      
      // Calculate level based on thresholds:
      // Level 1: 0 XP
      // Level 2: 100 XP
      // Level 3: 250 XP
      // Level 4: 500 XP
      // Level 5: 1000 XP
      let nextLevel = 1;
      if (nextXp >= 1000) {
        nextLevel = 5;
      } else if (nextXp >= 500) {
        nextLevel = 4;
      } else if (nextXp >= 250) {
        nextLevel = 3;
      } else if (nextXp >= 100) {
        nextLevel = 2;
      }

      setLevel(prevLevel => {
        if (nextLevel > prevLevel) {
          localStorage.setItem('level', nextLevel.toString());
          setTimeout(() => {
            showToast(`🎉 LEVEL UP! You reached Level ${nextLevel} (${getLevelName(nextLevel)})! 🏆`, 'success');
          }, 300);
        }
        return nextLevel;
      });

      // Show floating notification
      setRecentAchievement({ text: reason, xp: amount });
      setTimeout(() => {
        setRecentAchievement(null);
      }, 4000);

      showToast(`+${amount} XP: ${reason}`, 'success');

      // Check badge unlocks
      setTimeout(() => {
        setBadges(prevBadges => {
          const newBadges = [...prevBadges];
          let unlocked = false;

          const unlock = (badge: string) => {
            if (!newBadges.includes(badge)) {
              newBadges.push(badge);
              unlocked = true;
              setTimeout(() => {
                showToast(`🏅 New Badge Unlocked: ${badge}!`, 'success');
              }, 600);
            }
          };

          // 🏅 Consistency Warrior: 7 day streak
          if (streak >= 7) unlock('Consistency Warrior');

          // 🔥 Focus Master: 10 pomodoros
          if (statistics.hoursFocused >= 4.0) unlock('Focus Master'); // 4 hours is about 10 Pomodoro blocks

          // 📚 Lifelong Learner: 20 lessons completed
          if (statistics.lessonsWatched >= 20) unlock('Lifelong Learner');

          // 🚨 Crisis Survivor: 5 Panic sessions completed
          // If we have some goals achieved or similar
          if (statistics.goalsAchieved >= 5) unlock('Crisis Survivor');

          // ⚡ Productivity Beast: 100 tasks completed
          if (statistics.tasksCompleted >= 100) unlock('Productivity Beast');

          if (unlocked) {
            localStorage.setItem('badges', JSON.stringify(newBadges));
          }
          return newBadges;
        });
      }, 100);

      return nextXp;
    });
  };

  const incrementStat = (key: keyof StatisticsState, amount: number) => {
    setStatistics(prev => {
      const newVal = (prev[key] ?? 0) + amount;
      
      let xpEarned = 0;
      let reason = '';
      if (key === 'tasksCompleted') { xpEarned = amount * 20; reason = `Task Completed`; }
      else if (key === 'hoursFocused') { xpEarned = amount * 25; reason = `Finished Focus Session`; }
      else if (key === 'lessonsWatched') { xpEarned = amount * 15; reason = `Roadmap Lesson Completed`; }
      else if (key === 'habitsMaintained') { xpEarned = amount * 10; reason = `Habit Completed`; }
      else if (key === 'commitmentsPaid') { xpEarned = amount * 20; reason = `Commitment Met`; }
      else if (key === 'goalsAchieved') { xpEarned = amount * 50; reason = `Goal Accomplished`; }
      else if (key === 'focusSessionsCompleted') { xpEarned = amount * 15; reason = `Completed Focus Session`; }
      else if (key === 'panicSessionsRecovered') { xpEarned = amount * 50; reason = `Recovered from Panic Mode`; }
      else if (key === 'pathwaysCompleted') { xpEarned = amount * 40; reason = `Completed Learning Path`; }
      else if (key === 'nightOwlConsecutiveDays') { xpEarned = amount * 20; reason = `Night Owl Streak Up!`; }
      else if (key === 'tasksCompletedBeforeDeadline') { xpEarned = amount * 15; reason = `Completed Task Before Deadline`; }
      
      if (xpEarned > 0) {
        addXP(xpEarned, reason);
      }

      return {
        ...prev,
        [key]: newVal
      };
    });
  };

  const updateProfile = (updatedFields: Partial<UserProfile>) => {
    setProfile(prev => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('lp_profile', JSON.stringify(merged));
      
      // Sync lifepilot_user as well to keep neural ID in perfect alignment
      const savedNeuralUser = localStorage.getItem('lifepilot_user') || localStorage.getItem('lifepilotUser');
      if (savedNeuralUser) {
        try {
          const nu = JSON.parse(savedNeuralUser);
          const updatedNu = {
            ...nu,
            name: merged.name,
            role: merged.role,
            department: merged.bio.includes("Majoring in") ? merged.bio.split("Majoring in ")[1].split(" (")[0] : nu.department,
            careerGoal: merged.coreGoals?.[0] || nu.careerGoal,
            goal: merged.coreGoals?.[0] || nu.goal
          };
          localStorage.setItem('lifepilot_user', JSON.stringify(updatedNu));
          localStorage.setItem('lifepilotUser', JSON.stringify(updatedNu));
        } catch {}
      }
      
      return merged;
    });
  };

  const updatePersonaProfile = (newProfile: Partial<PersonaProfileData>) => {
    setPersonaProfile(prev => ({ ...prev, ...newProfile }));
  };

  const generatePersonaInsights = async (inputData: any) => {
    try {
      const response = await fetch('/api/persona-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData),
      });
      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }
      const result = await response.json();
      setPersonaProfile(result);
      showToast('🧠 Personalization profile synchronized via LifePilot AI!', 'success');
    } catch (err) {
      console.error(err);
      const fallback = generateHeuristicPersonaInsights(
        inputData.role, inputData.interests, inputData.skills, inputData.goals,
        inputData.learningPreferences, inputData.focusPatterns, inputData.energyPatterns,
        inputData.stressTrends, inputData.habits, inputData.productivityStyle, inputData.careerAspirations
      );
      setPersonaProfile(fallback);
      showToast('🧠 Persona profile updated locally!', 'info');
    }
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('lp_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('lp_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('lp_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('lp_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('lp_commitments', JSON.stringify(commitments));
  }, [commitments]);

  useEffect(() => {
    localStorage.setItem('lp_roadmaps', JSON.stringify(roadmaps));
  }, [roadmaps]);

  useEffect(() => {
    localStorage.setItem('lp_panic', JSON.stringify(panicPlan));
  }, [panicPlan]);

  useEffect(() => {
    localStorage.setItem('lp_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('lp_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('lp_copilot_memory', JSON.stringify(copilotMemory));
  }, [copilotMemory]);

  useEffect(() => {
    localStorage.setItem('lp_calendar_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  // ONBOARDING
  const onboardUser = async (bio: string) => {
    try {
      const response = await fetch('/api/profile-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
      });
      if (!response.ok) throw new Error('Onboarding failed');
      const data = await response.json();
      
      const newProfile: UserProfile = {
        ...data,
        bio,
        onboarded: true
      };
      setProfile(newProfile);

      // Seed adaptive data based on user profile role
      let seedTasks: Task[] = [];
      let seedGoals: Goal[] = [];
      let seedHabits: Habit[] = [];

      if (data.role === 'Student') {
        seedTasks = [
          {
            id: 't-student-1',
            title: `Study roadmap for ${data.recommendedSkills?.[0] || 'Web Development'}`,
            deadline: '2026-06-28',
            complexity: 'High',
            priority: 'High',
            status: 'Todo',
            subtasks: [
              { id: 'st-s1', title: 'Review core handbook materials', completed: false },
              { id: 'st-s2', title: 'Complete first practice assignment', completed: false }
            ],
            category: 'Academics',
            estimatedHours: 6,
            procrastinationCount: 0
          },
          {
            id: 't-student-2',
            title: 'Participate in engineering mock interview session',
            deadline: '2026-07-02',
            complexity: 'Medium',
            priority: 'Medium',
            status: 'Todo',
            subtasks: [],
            category: 'Career Growth',
            estimatedHours: 2,
            procrastinationCount: 0
          }
        ];
        seedGoals = [
          {
            id: 'g-student-1',
            title: `Excel in ${data.interests?.[0] || 'Computer Engineering'}`,
            category: 'Academics',
            progress: 20,
            deadline: '2026-12-15',
            milestones: [
              { id: 'm-s1', title: 'Complete semesters course registrations', completed: true },
              { id: 'm-s2', title: 'Master first-tier complex framework', completed: false },
              { id: 'm-s3', title: 'Maintain cumulative GPA above 8.5', completed: false }
            ]
          }
        ];
        seedHabits = [
          { id: 'h-student-1', title: 'Coding Practice (daily)', frequency: 'daily', streak: 3 },
          { id: 'h-student-2', title: 'Solve 1 LeetCode problem', frequency: 'daily', streak: 5 },
          { id: 'h-student-3', title: 'Read tech blog article', frequency: 'weekly', streak: 1 }
        ];
      } else if (data.role === 'Professional') {
        seedTasks = [
          {
            id: 't-prof-1',
            title: 'Prepare executive deck presentation',
            deadline: '2026-06-27',
            complexity: 'High',
            priority: 'High',
            status: 'Todo',
            subtasks: [
              { id: 'st-p1', title: 'Collect key performance indicators (KPIs)', completed: false },
              { id: 'st-p2', title: 'Draft visual slides outline', completed: false }
            ],
            category: 'Job Duty',
            estimatedHours: 4,
            procrastinationCount: 0
          },
          {
            id: 't-prof-2',
            title: `Learn ${data.recommendedSkills?.[0] || 'System Architecture'} for career advancement`,
            deadline: '2026-07-15',
            complexity: 'Medium',
            priority: 'Medium',
            status: 'Todo',
            subtasks: [],
            category: 'Professional Dev',
            estimatedHours: 12,
            procrastinationCount: 0
          }
        ];
        seedGoals = [
          {
            id: 'g-prof-1',
            title: 'Earn senior-level promotion',
            category: 'Career',
            progress: 40,
            deadline: '2026-11-30',
            milestones: [
              { id: 'm-p1', title: 'Deliver successful main system migration', completed: true },
              { id: 'm-p2', title: 'Lead mentoring sessions for 2 junior colleagues', completed: false },
              { id: 'm-p3', title: 'Complete cloud solutions architectural certification', completed: false }
            ]
          }
        ];
        seedHabits = [
          { id: 'h-prof-1', title: 'Inbox zero status check', frequency: 'daily', streak: 2 },
          { id: 'h-prof-2', title: 'Post on professional networks', frequency: 'weekly', streak: 4 },
          { id: 'h-prof-3', title: 'Deep Work blocks (90 mins)', frequency: 'daily', streak: 8 }
        ];
      } else { // Entrepreneur
        seedTasks = [
          {
            id: 't-ent-1',
            title: 'Review quarterly balance sheet and product roadmap',
            deadline: '2026-06-29',
            complexity: 'High',
            priority: 'High',
            status: 'Todo',
            subtasks: [
              { id: 'st-e1', title: 'Verify cash flow records', completed: false },
              { id: 'st-e2', title: 'Sync with design leads', completed: false }
            ],
            category: 'Finance & Strategy',
            estimatedHours: 5,
            procrastinationCount: 0
          },
          {
            id: 't-ent-2',
            title: 'Conduct investor advisory follow-up chats',
            deadline: '2026-07-01',
            complexity: 'Medium',
            priority: 'Medium',
            status: 'Todo',
            subtasks: [],
            category: 'Investor Relations',
            estimatedHours: 3,
            procrastinationCount: 0
          }
        ];
        seedGoals = [
          {
            id: 'g-ent-1',
            title: 'Successfully close Seed Funding round',
            category: 'Company Growth',
            progress: 50,
            deadline: '2026-09-30',
            milestones: [
              { id: 'm-e1', title: 'Lock down core data room documentation', completed: true },
              { id: 'm-e2', title: 'Obtain term sheet commitment letters', completed: false },
              { id: 'm-e3', title: 'Complete full cap-table modeling analysis', completed: false }
            ]
          }
        ];
        seedHabits = [
          { id: 'h-ent-1', title: 'Daily standup sync with core team', frequency: 'daily', streak: 15 },
          { id: 'h-ent-2', title: 'Review main strategic objectives', frequency: 'daily', streak: 20 },
          { id: 'h-ent-3', title: 'Read financial & industry logs', frequency: 'weekly', streak: 5 }
        ];
      }

      setTasks(seedTasks);
      setGoals(seedGoals);
      setHabits(seedHabits);

      // Add welcoming message
      setMessages(prev => [
        ...prev,
        {
          id: `msg-welcome-${Date.now()}`,
          sender: 'ai',
          text: `Welcome aboard, ${data.name}! I have successfully personalized your LifePilot Copilot interface for your role as a **${data.role}**. I can see your primary focus areas include: ${data.coreGoals?.slice(0, 2).join(' and ')}. Let's work together to make significant strides in mastering these areas!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const resetOnboarding = () => {
    const savedTheme = localStorage.getItem('lp_theme');
    const savedNeuralUser = localStorage.getItem('lifepilot_user') || localStorage.getItem('lifepilotUser');
    const savedAuth = localStorage.getItem('lifepilotAuthenticated');
    const savedSeenIntro = localStorage.getItem('lifepilot_seen_intro');

    localStorage.clear();

    if (savedTheme) {
      localStorage.setItem('lp_theme', savedTheme);
    }
    if (savedNeuralUser) {
      localStorage.setItem('lifepilot_user', savedNeuralUser);
      localStorage.setItem('lifepilotUser', savedNeuralUser);
    }
    if (savedAuth) {
      localStorage.setItem('lifepilotAuthenticated', savedAuth);
    }
    if (savedSeenIntro) {
      localStorage.setItem('lifepilot_seen_intro', savedSeenIntro);
    }
    
    let loggedInName = 'Aditi Kadam';
    let loggedInGoal = 'Software Engineer';
    let loggedInMajor = 'Computer Science';
    let loggedInSemester = 'Third Year';
    let loggedInEmail = 'aditi@university.edu';

    if (savedNeuralUser) {
      try {
        const nu = JSON.parse(savedNeuralUser);
        loggedInName = nu.name || loggedInName;
        loggedInGoal = nu.careerGoal || nu.goal || loggedInGoal;
        loggedInMajor = nu.major || nu.department || loggedInMajor;
        loggedInSemester = nu.semester || loggedInSemester;
        loggedInEmail = nu.email || loggedInEmail;
      } catch {}
    }

    const seededProfile: UserProfile = {
      name: loggedInName,
      role: 'Student',
      bio: `Computer Science Student in ${loggedInSemester}, preparing for ${loggedInGoal} career goal.`,
      strengths: ['Rigorous DSA skills', 'Keen curiosity', 'Strong Linux terminal proficiency'],
      challenges: ['Context switching under heavy workload', 'Occasions of exam-season anxiety'],
      coreGoals: [loggedInGoal, 'Prepare for Placements', 'Master Full Stack Development'],
      interests: ['Linux', 'Docker', 'Kubernetes', 'DSA', 'Web Development', 'System Design', 'DevOps'],
      growthAreas: ['Effective time boxing', 'Project portfolio construction'],
      recommendedSkills: ['Docker', 'Kubernetes', 'DSA', 'Linux', 'Web Development'],
      onboarded: true
    };

    localStorage.setItem('lp_profile', JSON.stringify(seededProfile));
    localStorage.setItem('lp_tasks', JSON.stringify(defaultTasks));
    localStorage.setItem('lp_habits', JSON.stringify(defaultHabits));
    localStorage.setItem('lp_goals', JSON.stringify(defaultGoals));
    localStorage.setItem('lp_commitments', JSON.stringify(defaultCommitments));
    localStorage.setItem('lp_roadmaps', JSON.stringify(defaultRoadmaps));
    localStorage.setItem('userXP', '420');
    localStorage.setItem('level', '3');
    localStorage.setItem('streak', '12');
    localStorage.setItem('badges', JSON.stringify(['First Login', 'First Focus Session', 'First Roadmap', '7 Day Coding Streak', 'Hackathon Builder']));
    localStorage.setItem('completedChallenges', JSON.stringify([]));

    setProfile(seededProfile);
    setTasks(defaultTasks);
    setHabits(defaultHabits);
    setGoals(defaultGoals);
    setCommitments(defaultCommitments);
    setRoadmaps(defaultRoadmaps);
    setUserXP(420);
    setLevel(3);
    setStreak(12);
    setBadges(['First Login', 'First Focus Session', 'First Roadmap', '7 Day Coding Streak', 'Hackathon Builder']);
    setCompletedChallenges([]);
    setPanicPlan(null);
    setActiveTab('dashboard');
    clearAssistantHistory();
  };

  // TASKS
  const addTask = (task: Omit<Task, 'id' | 'procrastinationCount'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      procrastinationCount: 0
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === taskId) {
          if (status === 'Done' && t.status !== 'Done') {
            setTimeout(() => {
              incrementStat('tasksCompleted', 1);
              if (t.deadline) {
                try {
                  const deadlineDate = new Date(t.deadline);
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  if (deadlineDate >= today) {
                    incrementStat('tasksCompletedBeforeDeadline', 1);
                  }
                } catch (err) {
                  console.error(err);
                }
              }
            }, 50);
          }
          return { ...t, status };
        }
        return t;
      });
      return updated;
    });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    }));
  };

  // Procrastination Coaching Engine trigger
  const delayTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const count = t.procrastinationCount + 1;
        // If procrastination pattern is detected (clicked delay repeatedly, let's say >= 2 times),
        // trigger proactive intervention coach instead of standard deferment!
        if (count >= 2) {
          triggerIntervention(t);
        }
        return { 
          ...t, 
          procrastinationCount: count,
          deadline: shiftDate(t.deadline, 1) // defer by 1 day
        };
      }
      return t;
    }));
  };

  const shiftDate = (dateStr: string, days: number): string => {
    try {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  const addInterventionHistory = (item: Omit<InterventionHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: InterventionHistoryItem = {
      ...item,
      id: `int-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setInterventionHistory(prev => [newItem, ...prev]);
  };

  // Trigger Procrastination Coach Intervention
  const triggerIntervention = (task: Task) => {
    if (!task) return;
    const title = task.title;
    const questions = [
      `Looks like you've postponed your ${title} three times. What feels like the main roadblock holding you back?`,
      `Let's break down "${title}". Procrastination usually comes from feeling overwhelmed. Shall we pivot our strategy?`,
      `We keep pushing "${title}" out. Shall we adjust our strategy and find a ridiculously easy step to start with?`
    ];
    const suggestions = [
      "Break into microtasks",
      "Schedule 30 minute session",
      "Move to tomorrow",
      "Activate Focus Mode",
      "Activate Panic Mode"
    ];

    setActiveIntervention({
      active: true,
      taskId: task.id,
      question: questions[0], // first one matches the DBMS assignment example precisely
      suggestions: suggestions
    });
  };

  const closeIntervention = () => {
    if (activeIntervention?.taskId) {
      const task = tasks.find(t => t.id === activeIntervention.taskId);
      if (task) {
        addInterventionHistory({
          type: 'procrastination',
          title: task.title,
          questionOrMessage: activeIntervention.question,
          status: 'Ignored',
          actionTaken: 'Dismissed coach suggestion',
          impactMetrics: 'No recovery gain'
        });
      }
    }
    setActiveIntervention(null);
  };

  const applyInterventionSuggestion = (actionText: string) => {
    if (!activeIntervention?.taskId) return;
    const task = tasks.find(t => t.id === activeIntervention.taskId);
    if (!task) return;

    let responseMsg = '';

    // Apply specific actions based on the clicked button text
    if (actionText === "Break into microtasks") {
      // Add subtasks if empty
      setTasks(prev => prev.map(t => {
        if (t.id === task.id) {
          return {
            ...t,
            subtasks: t.subtasks.length > 0 ? t.subtasks : [
              { id: `st-1-${Date.now()}`, title: 'Review core concepts (5m)', completed: false },
              { id: `st-2-${Date.now()}`, title: 'Setup workspace & files (5m)', completed: false },
              { id: `st-3-${Date.now()}`, title: 'Draft initial outline (10m)', completed: false }
            ]
          };
        }
        return t;
      }));
      setActiveTab('focus');
      responseMsg = `Excellent choice! I've broken "${task.title}" down into three ridiculously easy 5-to-10-minute microtasks. Let's tackle them one-by-one in Focus Mode to build instant momentum.`;
    } 
    else if (actionText === "Schedule 30 minute session") {
      // Add a calendar event
      const today = new Date().toISOString().split('T')[0];
      const newEvent: CalendarEvent = {
        id: `cal-int-${Date.now()}`,
        title: `⚡ Focus: ${task.title}`,
        priority: 'High',
        effort: 'Medium',
        deadline: task.deadline,
        estimatedTime: '30 mins',
        completionProbability: 95,
        stressImpact: 'Low',
        energyLevel: 'High',
        date: today,
        start: '15:00',
        end: '15:30',
        category: 'Deep Work',
        color: 'Purple'
      };
      setCalendarEvents(prev => [...prev, newEvent]);
      responseMsg = `Perfect! I have scheduled a dedicated 30-minute Focus block for "${task.title}" on your calendar today from 3:00 PM to 3:30 PM. I'll guard your attention during this block.`;
    } 
    else if (actionText === "Move to tomorrow") {
      const tomorrow = shiftDate(new Date().toISOString().split('T')[0], 1);
      setTasks(prev => prev.map(t => {
        if (t.id === task.id) {
          return { ...t, deadline: tomorrow, procrastinationCount: 0 };
        }
        return t;
      }));
      responseMsg = `Acknowledged. I have rescheduled "${task.title}" to tomorrow to clear your cognitive overhead for the rest of today. Take some deep breath and relax.`;
    } 
    else if (actionText === "Activate Focus Mode") {
      setActiveTab('focus');
      responseMsg = `Let's bypass the procrastination loop completely. Active focus mode has been initialized. I'm starting an ambient soundscape to help you lock in.`;
    } 
    else if (actionText === "Activate Panic Mode") {
      activatePanicMode(task.title, 12, 'Not Started', 'High');
      setActiveTab('panic');
      responseMsg = `Emergency mode initialized! We have locked down your schedule for "${task.title}". Focus ONLY on the micro-steps in the panic room. We will get this done together.`;
    } 
    else {
      // General click
      setActiveTab('focus');
      responseMsg = `Great choice! I have activated coaching intervention on "${task.title}". We have pivoted our strategy using your chosen micro-action: "${actionText}". Let's get to work!`;
    }
    
    // Save to Intervention history
    addInterventionHistory({
      type: 'procrastination',
      title: task.title,
      questionOrMessage: activeIntervention.question,
      status: 'Accepted',
      actionTaken: actionText,
      impactMetrics: '+18% Momentum Recovered'
    });

    // Reset procrastination counter
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, procrastinationCount: 0 } : t));
    setActiveIntervention(null);

    setMessages(prev => [
      ...prev,
      {
        id: `msg-interv-${Date.now()}`,
        sender: 'ai',
        text: responseMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // HABITS
  const addHabit = (habit: Omit<Habit, 'id' | 'streak'>) => {
    const newHabit: Habit = {
      ...habit,
      id: `habit-${Date.now()}`,
      streak: 0,
      completedToday: false
    };
    setHabits(prev => [newHabit, ...prev]);
  };

  const completeHabit = (habitId: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const completedToday = !h.completedToday;
        const streak = completedToday ? h.streak + 1 : Math.max(0, h.streak - 1);
        if (completedToday) {
          setTimeout(() => incrementStat('habitsMaintained', 1), 50);
        }
        return {
          ...h,
          completedToday,
          streak,
          lastCompleted: completedToday ? new Date().toISOString().split('T')[0] : h.lastCompleted
        };
      }
      return h;
    }));
  };

  // GOALS
  const addGoal = (goal: Omit<Goal, 'id' | 'progress'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
      progress: 0
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const updatedMilestones = g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m);
        const completedCount = updatedMilestones.filter(m => m.completed).length;
        const progress = updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;
        return {
          ...g,
          milestones: updatedMilestones,
          progress
        };
      }
      return g;
    }));
  };

  // COMMITMENTS
  const addCommitment = (commitment: Omit<Commitment, 'id' | 'paidThisPeriod'>) => {
    const newCommitment: Commitment = {
      priority: 'Medium',
      autopayEnabled: false,
      lateFeeEstimate: 0,
      ...commitment,
      id: `commitment-${Date.now()}`,
      paidThisPeriod: false
    };
    setCommitments(prev => [newCommitment, ...prev]);
  };

  const payCommitment = (commitmentId: string) => {
    setCommitments(prev => prev.map(c => {
      if (c.id === commitmentId) {
        const paidThisPeriod = !c.paidThisPeriod;
        if (paidThisPeriod) {
          setTimeout(() => incrementStat('commitmentsPaid', 1), 50);
        }
        return {
          ...c,
          paidThisPeriod,
          lastPaidDate: paidThisPeriod ? new Date().toISOString().split('T')[0] : c.lastPaidDate
        };
      }
      return c;
    }));
  };

  const deleteCommitment = (commitmentId: string) => {
    setCommitments(prev => prev.filter(c => c.id !== commitmentId));
  };

  const updateCommitment = (commitmentId: string, updates: Partial<Commitment>) => {
    setCommitments(prev => prev.map(c => c.id === commitmentId ? { ...c, ...updates } : c));
  };

  // ROADMAPS (Growth Hub)
  const generateHeuristicRoadmapLocally = (topic: string) => {
    const isCareerGoal = /become|career\s*roadmap|prepare\s*for|goal:|i\s*want\s*to\s*become/i.test(topic);
    
    if (isCareerGoal) {
      return {
        isCareerRoadmap: true,
        timeline: "6 Months",
        learningSchedule: "10 hours / week",
        skills: ["Core Technology Mastery", "System Design & Architecture", "Data Structures & Algorithms", "Collaboration & Git", "Problem Solving", "Technical Interview Communication"],
        suggestedHabits: ["Solve 1 challenge daily", "Review 1 system architecture weekly", "Read technical documentation for 20 minutes"],
        certifications: [`Google Career Certificate`, `AWS Certified Solutions Architect`, `Certified Developer Certification`],
        badges: [`🏆 ${topic} Initiate`, `🏆 Coding Craftsman`, `🏆 Capstone Architect`, `🏆 Placement Ready`],
        steps: [
          {
            title: `Stage 1: Core Foundation & Fundamentals of ${topic}`,
            description: `Master basic syntax, foundational command structures, core parameters, and set up local development and build tools.`,
            estimatedHours: 15
          },
          {
            title: "Stage 2: Intermediate Implementation & Tool Integration",
            description: "Build robust modular elements, integrate database APIs or local structures, and practice active error handling.",
            estimatedHours: 25
          },
          {
            title: "Stage 3: Advanced Architecture & System Design",
            description: "Optimize execution paths, configure distributed microservices or caching, and evaluate system-wide latency scales.",
            estimatedHours: 35
          },
          {
            title: "Stage 4: Portfolio Capstone & Deployment Mastery",
            description: "Finalize a comprehensive production-grade application complete with automation tests and multi-user scaling.",
            estimatedHours: 40
          }
        ],
        projects: [
          {
            title: `Enterprise ${topic} Service Platform`,
            description: `A production-ready full-stack application leveraging scalable APIs and secure state tracking.`,
            difficulty: "Advanced" as const,
            skillsCovered: ["API Architecture", "Database Modeling", "State Synchronization"]
          },
          {
            title: "Personal Portfolio & Core Sandbox",
            description: "An elegant, interactive workspace highlighting your mini-projects and algorithmic challenge solutions.",
            difficulty: "Intermediate" as const,
            skillsCovered: ["Responsive Styling", "Automation Pipelines", "Performance Optimization"]
          }
        ],
        placementReadiness: {
          score: 65,
          feedback: `You have built a solid knowledge footprint, but your portfolio lacks direct public deployment evidence. Focus on finalizing your ${topic} capstone and practicing STAR-method interview responses.`,
          checks: [
            { title: "Technical Foundation Mastery", passed: true },
            { title: "Portfolio Capstone Deployed", passed: false },
            { title: "DSA and Algorithmic Skills", passed: false },
            { title: "Mock Behavioral Evaluation", passed: true }
          ]
        },
        weeklyPlan: [
          { week: 1, focus: "Local Workspace & Environment Setup", tasks: ["Install tools and standard compilers", "Write basic scripts / simple programs", "Initialize git repositories"] },
          { week: 4, focus: "Data Flows & State Managers", tasks: ["Implement clean dynamic views", "Connect mock store frameworks", "Add structured validation checks"] },
          { week: 8, focus: "System Integration & testing", tasks: ["Set up automated unit assertions", "Connect remote database endpoints", "Resolve edge cases"] },
          { week: 12, focus: "Deployment & Placement Drill", tasks: ["Build for production optimized bundles", "Draft STAR-structured interview reviews", "Submit portfolio to peer review"] }
        ]
      };
    }
    
    return {
      isCareerRoadmap: false,
      timeline: "3 Weeks",
      learningSchedule: "6 hours / week",
      skills: ["Fundamentals", "Debugging", "Best Practices"],
      suggestedHabits: ["Practice 30 minutes daily", "Read 1 technical post weekly"],
      certifications: ["Completion Certificate"],
      badges: ["Course Graduate"],
      steps: [
        {
          title: `Introduction & Fundamentals of ${topic}`,
          description: "Learn core terminology, key concepts, and set up your development/learning workspace.",
          estimatedHours: 4
        },
        {
          title: "Intermediate Hands-on Exercises",
          description: "Follow structural guides, build practical small-scale examples, and explore primary tools.",
          estimatedHours: 8
        },
        {
          title: "Build a Comprehensive Portfolio Project",
          description: "Design and implement a fully featured project utilizing all newly learned concept branches.",
          estimatedHours: 12
        },
        {
          title: "Testing, Optimization & Advanced Techniques",
          description: "Review edge cases, optimize performance, seek feedback, and publish your final work.",
          estimatedHours: 6
        }
      ],
      projects: [],
      placementReadiness: {
        score: 30,
        feedback: "This is a basic topic roadmap. Switch to a Career target for professional assessment.",
        checks: [{ title: "Topic Introduced", passed: true }]
      },
      weeklyPlan: []
    };
  };

  const generateRoadmap = async (topic: string) => {
    try {
      const response = await fetch('/api/growth-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, userProfile: profile }),
      });
      if (!response.ok) throw new Error('Roadmap generation failed');
      const data = await response.json();

      const newRoadmap: Roadmap = {
        id: `roadmap-${Date.now()}`,
        topic,
        progress: 0,
        steps: data.steps.map((s: any, idx: number) => ({
          id: `step-${idx}-${Date.now()}`,
          title: s.title,
          description: s.description,
          estimatedHours: s.estimatedHours,
          status: 'Pending'
        })),
        isCareerRoadmap: data.isCareerRoadmap,
        timeline: data.timeline,
        learningSchedule: data.learningSchedule,
        skills: data.skills,
        suggestedHabits: data.suggestedHabits,
        certifications: data.certifications,
        badges: data.badges,
        projects: data.projects,
        placementReadiness: data.placementReadiness,
        weeklyPlan: data.weeklyPlan
      };

      setRoadmaps(prev => [newRoadmap, ...prev]);
    } catch (error) {
      console.error("Using client-side fallback roadmap generation:", error);
      const data = generateHeuristicRoadmapLocally(topic);
      const newRoadmap: Roadmap = {
        id: `roadmap-${Date.now()}`,
        topic,
        progress: 0,
        steps: data.steps.map((s: any, idx: number) => ({
          id: `step-${idx}-${Date.now()}`,
          title: s.title,
          description: s.description,
          estimatedHours: s.estimatedHours,
          status: 'Pending'
        })),
        isCareerRoadmap: data.isCareerRoadmap,
        timeline: data.timeline,
        learningSchedule: data.learningSchedule,
        skills: data.skills,
        suggestedHabits: data.suggestedHabits,
        certifications: data.certifications,
        badges: data.badges,
        projects: data.projects,
        placementReadiness: data.placementReadiness,
        weeklyPlan: data.weeklyPlan
      };
      setRoadmaps(prev => [newRoadmap, ...prev]);
    }
  };

  const updateRoadmapStep = (roadmapId: string, stepId: string, status: 'Pending' | 'InProgress' | 'Completed') => {
    setRoadmaps(prev => prev.map(r => {
      if (r.id === roadmapId) {
        const updatedSteps = r.steps.map(s => s.id === stepId ? { ...s, status } : s);
        const completedCount = updatedSteps.filter(s => s.status === 'Completed').length;
        const progress = updatedSteps.length > 0 ? Math.round((completedCount / updatedSteps.length) * 100) : 0;
        if (progress === 100 && r.progress !== 100) {
          setTimeout(() => incrementStat('pathwaysCompleted', 1), 50);
        }
        return {
          ...r,
          steps: updatedSteps,
          progress
        };
      }
      return r;
    }));
  };

  // PANIC MODE
  const activatePanicMode = async (deadlineTitle: string, remainingHours: number, currentProgress: string, complexity: string) => {
    try {
      let data: any = {};
      try {
        const response = await fetch('/api/panic-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deadlineTitle,
            remainingHours,
            currentProgress,
            taskComplexity: complexity
          }),
        });
        if (response.ok) {
          data = await response.json();
        }
      } catch (err) {
        console.log('Skipping API call or falling back due to rate limits', err);
      }

      // Generate local fallback lists if data is missing
      const titleLower = (deadlineTitle || "").toLowerCase();
      let panicScore = data.panicScore ?? 75;
      let recoveryProbability = data.recoveryProbability ?? 78;
      let deadlinePressure: 'Low' | 'Medium' | 'High' | 'Critical' = data.deadlinePressure ?? 'High';
      let suggestedMode = data.suggestedMode ?? "Emergency Sprint";
      let coachingTip = data.coachingTip ?? "You don't need perfection. You need progress. Let's win one task at a time.";
      let microSteps = data.microSteps ?? ["Open VSCode", "Write one paragraph", "Spend 5 minutes organizing workspace"];

      if (titleLower.includes('exam') || titleLower.includes('test') || titleLower.includes('study')) {
        panicScore = 85;
        recoveryProbability = 72;
        deadlinePressure = 'Critical';
        suggestedMode = "Exam Cram";
        coachingTip = "A bad day doesn't destroy a good journey. We only need the next 15 minutes.";
        microSteps = ["Solve one practice question", "Write down core formulas", "Spend 5 minutes outlining notes"];
      } else if (titleLower.includes('hackathon') || titleLower.includes('assignment') || titleLower.includes('project')) {
        panicScore = 82;
        recoveryProbability = 76;
        deadlinePressure = 'High';
        suggestedMode = "Rapid Prototyping";
        coachingTip = "Let's identify what matters most. One small step. No guilt. No judgment.";
        microSteps = ["Create a blank project skeletal structure", "Push one initial commit", "List 3 MVP features"];
      } else if (remainingHours <= 3) {
        panicScore = 94;
        recoveryProbability = 65;
        deadlinePressure = 'Critical';
        suggestedMode = "Ultra Sprint";
        coachingTip = "We only need the next 15 minutes. Take a deep breath and start right now.";
        microSteps = ["Write just one single sentence", "Push one commit", "Spend 5 minutes focus"];
      }

      const sacrifices = data.sacrifices ?? [
        { task: "Watching YouTube & Browsing", type: "skip", benefit: "Gain 45 minutes of active concentration" },
        { task: "Secondary Career Roadmap Learning", type: "delay", benefit: "Postpone to free up 2 hours of capacity" },
        { task: `Core deliverables for ${deadlineTitle}`, type: "prioritize", benefit: "High impact on immediate success" }
      ];

      const timeline = data.timeline ?? [
        { time: "NOW", event: "Triage priorities & activate distraction shields" },
        { time: remainingHours > 4 ? "Next 2 hours" : "Hour 1", event: "Build the absolute bare-minimum MVP core skeleton" },
        { time: remainingHours > 4 ? "Middle blocks" : "Hour 2-3", event: "Flesh out requirements, ignoring all visual polish" },
        { time: "Before deadline", event: "Verification review & compile for final submission" }
      ];

      const focusSessions = data.focusSessions ?? [
        { title: "Inertia Breakout", duration: 45, type: "sprint" },
        { title: "Physical Stretch & Breath", duration: 10, type: "break" },
        { title: "Core Work Intensive", duration: 50, type: "sprint" },
        { title: "Rehydration Break", duration: 15, type: "break" },
        { title: "Final Polish Sprint", duration: 30, type: "sprint" }
      ];

      const steps = data.steps ? data.steps.map((s: any) => ({
        hour: s.hour,
        task: s.task,
        priority: s.priority,
        completed: false
      })) : [
        { hour: "Next 30 mins", task: `Ruthlessly strip all non-essential requirements for ${deadlineTitle}`, priority: "Critical", completed: false },
        { hour: "Hour 1-2", task: "Build/draft the absolute bare minimum version of core features", priority: "Critical", completed: false },
        { hour: "Final 30 mins", task: "Proofread, run a quick sanity test, and submit immediately", priority: "Optimize", completed: false }
      ];

      const newPanicPlan: PanicPlan = {
        deadlineTitle,
        originalDeadline: new Date().toISOString().split('T')[0],
        hoursRemaining: remainingHours,
        steps,
        active: true,
        panicScore,
        recoveryProbability,
        deadlinePressure,
        suggestedMode,
        situationAnalysis: `Remaining Tasks: ${steps.length}, Available Hours: ${remainingHours}, Panic Score: ${panicScore}%, Recovery Probability: ${recoveryProbability}%`,
        coachingTip,
        microSteps,
        sacrifices,
        timeline,
        focusSessions,
        rescheduledCount: 0
      };

      setPanicPlan(newPanicPlan);
      setActiveTab('panic'); // Auto switch to panic tab
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deactivatePanicMode = (showMetrics: boolean = false) => {
    if (showMetrics && panicPlan) {
      const completedStepsCount = panicPlan.steps.filter(s => s.completed).length;
      const totalStepsCount = panicPlan.steps.length;
      const successRatio = totalStepsCount > 0 ? (completedStepsCount / totalStepsCount) : 0.8;
      
      const savedMetrics = {
        tasksSaved: completedStepsCount || 3,
        hoursRecovered: Math.round(panicPlan.hoursRemaining * successRatio) || 5,
        deadlinesAvoided: completedStepsCount > 0 ? 1 : 2,
        stressReduction: panicPlan.deadlinePressure === 'Critical' ? "Critical → Low" : "High → Low",
        recoverySuccess: Math.round(successRatio * 100) || 89
      };

      incrementStat('panicSessionsRecovered', 1);

      setPanicPlan({
        ...panicPlan,
        active: false,
        showMetricsAfterDeactivation: true,
        savedMetrics
      });
    } else {
      setPanicPlan(null);
    }
  };

  const togglePanicStep = (index: number) => {
    if (!panicPlan) return;
    const updatedSteps = [...panicPlan.steps];
    updatedSteps[index].completed = !updatedSteps[index].completed;
    setPanicPlan({
      ...panicPlan,
      steps: updatedSteps
    });
  };

  // WEEKLY REVIEW
  const generateWeeklyReview = async () => {
    try {
      const completedCount = tasks.filter(t => t.status === 'Done').length;
      const habitsCompletedCount = habits.filter(h => h.completedToday).length;
      const response = await fetch('/api/weekly-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userStats: {
            tasksCompleted: completedCount,
            focusHours: 12.5, // simulated focus tracker
            habitsMaintained: habitsCompletedCount,
            milestonesReached: 2,
            interventionsTriggered: 1
          }
        }),
      });
      if (!response.ok) throw new Error('Weekly review failed');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // ASSISTANT CHAT
  const sendAssistantMessage = async (text: string) => {
    setIsAssistantLoading(true);
    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);

    // Client-side voice/text command intercept for Growth Hub triggers
    const cleanLower = text.toLowerCase();
    const growthKeywords = [
      'teach me', 'teach ', 'explain docker', 'what is kubernetes', 'explain kubernetes', 'prepare me for placements',
      'prepare for placements', 'generate python roadmap', 'become full stack developer', 'suggest projects',
      'what should i learn next', 'continue lesson', 'resume learning', 'resume roadmap', 'recommend skills',
      'show my progress', 'show progress', 'explain recursion', 'teach python'
    ];
    if (growthKeywords.some(kw => cleanLower.includes(kw))) {
      setActiveTab('growth');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('growth-command', { detail: { text } }));
      }, 150);
    }

    try {
      const timeString = `${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
      
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-5), // last 5 messages for context
          currentTimeString: timeString,
          userData: {
            profile,
            tasks,
            habits,
            commitments,
            goals,
            panicPlan,
            roadmaps,
            copilotMemory,
            activeTab,
            theme
          }
        }),
      });

      if (!response.ok) throw new Error('Assistant API failed');
      const data = await response.json();

      // Save memory if returned by Copilot
      if (data.updatedMemory) {
        setCopilotMemory(prev => ({
          ...prev,
          ...data.updatedMemory
        }));
      }

      const mutations = (data.actions || []).filter((act: AppAction) => 
        act.type !== 'START_FOCUS_MODE' && act.type !== 'NAVIGATE_TAB'
      );
      
      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: data.actions || [],
        suggestions: data.suggestions || [],
        actionStatus: (data.actions && data.actions.length > 0) ? (mutations.length > 0 ? 'pending' : 'confirmed') : undefined
      };

      // Automatically execute non-mutation actions immediately
      if (data.actions && data.actions.length > 0) {
        if (mutations.length === 0) {
          const feedbacks: string[] = [];
          for (const act of data.actions) {
            const res = await executeAssistantAction(act);
            feedbacks.push(res.feedback);
          }
          aiMsg.actionFeedbacks = feedbacks;
        }
      }

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errMsg: Message = {
        id: `msg-err-${Date.now()}`,
        sender: 'ai',
        text: "I encountered a minor processing bump while accessing my copilot algorithms. Let's try that prompt again or re-evaluate your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  const updateMessageActionStatus = (messageId: string, status: 'confirmed' | 'cancelled', feedbacks?: string[]) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return { 
          ...msg, 
          actionStatus: status,
          actionFeedbacks: feedbacks
        };
      }
      return msg;
    }));
  };

  const executeAssistantAction = async (action: AppAction): Promise<{ success: boolean; feedback: string }> => {
    switch (action.type) {
      case 'ADD_TASK': {
        const payload = action.payload;
        const title = payload.title || 'New Task';
        const deadline = payload.deadline || new Date().toISOString().split('T')[0];
        const complexity = payload.complexity || 'Medium';
        const priority = payload.priority || 'Medium';
        const category = payload.category || 'General';
        const estimatedHours = payload.estimatedHours || 2;

        addTask({
          title,
          deadline,
          complexity,
          priority,
          status: 'Todo',
          subtasks: [],
          category,
          estimatedHours
        });

        return {
          success: true,
          feedback: `✅ Task Successfully Created\n\n**Task:** ${title}\n**Deadline:** ${deadline}\n**Priority:** ${priority}\n**Estimated Effort:** ${estimatedHours}h\n\nDashboard Updated ✅\nCalendar Updated ✅`
        };
      }
      case 'ADD_COMMITMENT': {
        const payload = action.payload;
        const title = payload.title || 'New Recurring Commitment';
        const amount = payload.amount || '$0.00';
        const category = payload.category || 'Subscription';
        const frequency = payload.frequency || 'monthly';
        const dueDate = payload.dueDate || new Date().toISOString().split('T')[0];

        addCommitment({
          title,
          amount,
          category,
          frequency,
          dueDate
        });

        return {
          success: true,
          feedback: `✅ Commitment Successfully Created\n\n**Title:** ${title}\n**Amount:** ${amount}\n**Frequency:** ${frequency}\n**Due Date:** ${dueDate}\n\nDashboard Updated ✅\nSmart Commitments Updated ✅`
        };
      }
      case 'ADD_GOAL': {
        const payload = action.payload;
        const title = payload.title || 'New Growth Objective';
        const category = payload.category || 'Growth';
        const deadline = payload.deadline || new Date().toISOString().split('T')[0];
        const milestones = payload.milestones || [{ id: `m-g-${Date.now()}`, title: 'Get started', completed: false }];

        addGoal({
          title,
          category,
          deadline,
          milestones
        });

        return {
          success: true,
          feedback: `✅ Goal Successfully Created\n\n**Goal:** ${title}\n**Category:** ${category}\n**Deadline:** ${deadline}\n\nDashboard Updated ✅\nGrowth Hub Updated ✅`
        };
      }
      case 'ADD_HABIT': {
        const payload = action.payload;
        const title = payload.title || 'New Habit';
        const frequency = payload.frequency || 'daily';

        addHabit({
          title,
          frequency
        });

        return {
          success: true,
          feedback: `✅ Habit Successfully Created\n\n**Habit:** ${title}\n**Frequency:** ${frequency}\n\nDashboard Updated ✅\nHabits Tracker Updated ✅`
        };
      }
      case 'ACTIVATE_PANIC': {
        const payload = action.payload;
        const deadlineTitle = payload.deadlineTitle || 'Approaching Deadline';
        const remainingHours = payload.remainingHours || 8;
        const taskComplexity = payload.taskComplexity || 'High';

        await activatePanicMode(
          deadlineTitle,
          remainingHours,
          'Barely started',
          taskComplexity
        );

        return {
          success: true,
          feedback: `🚨 Panic Mode Activated\n\n**Focus Area:** ${deadlineTitle}\n**Remaining Hours:** ${remainingHours}h\n**Complexity:** ${taskComplexity}\n\nSurvival Plan and micro-steps prepared in Panic Mode Panel ✅`
        };
      }
      case 'GENERATE_ROADMAP': {
        const payload = action.payload;
        const topic = payload.topic || 'Figma Design';

        await generateRoadmap(topic);

        return {
          success: true,
          feedback: `🗺️ Learning Roadmap Generated\n\n**Topic:** ${topic}\n\nGrowth Hub custom dashboard populated with adaptive milestones ✅`
        };
      }
      case 'DELETE_HABIT': {
        const payload = action.payload;
        const targetTitle = payload.title || '';
        const found = habits.find(h => 
          (payload.id && h.id === payload.id) || 
          (targetTitle && h.title.toLowerCase().includes(targetTitle.toLowerCase()))
        );

        if (!found) {
          return {
            success: false,
            feedback: `❌ I couldn't delete this habit because no matching habit containing '${targetTitle}' was found.`
          };
        }

        setHabits(prev => prev.filter(h => h.id !== found.id));

        return {
          success: true,
          feedback: `✅ Habit Successfully Deleted\n\n**Habit:** ${found.title}\n\nDashboard Updated ✅`
        };
      }
      case 'DELETE_TASK': {
        const payload = action.payload;
        const targetTitle = payload.title || '';
        const found = tasks.find(t => 
          (payload.id && t.id === payload.id) || 
          (targetTitle && t.title.toLowerCase().includes(targetTitle.toLowerCase()))
        );

        if (!found) {
          return {
            success: false,
            feedback: `❌ I couldn't delete this task because no matching task containing '${targetTitle}' was found.`
          };
        }

        setTasks(prev => prev.filter(t => t.id !== found.id));

        return {
          success: true,
          feedback: `✅ Task Successfully Deleted\n\n**Task:** ${found.title}\n\nDashboard Updated ✅\nCalendar Updated ✅`
        };
      }
      case 'UPDATE_TASK_PROGRESS': {
        const payload = action.payload;
        const targetTitle = payload.title || '';
        const found = tasks.find(t => 
          (payload.id && t.id === payload.id) || 
          (targetTitle && t.title.toLowerCase().includes(targetTitle.toLowerCase()))
        );

        if (!found) {
          return {
            success: false,
            feedback: `❌ I couldn't update this task because no matching task containing '${targetTitle}' was found.`
          };
        }

        const newStatus = payload.status || (payload.progress >= 100 ? 'Done' : payload.progress > 0 ? 'InProgress' : 'Todo');

        setTasks(prev => prev.map(t => {
          if (t.id === found.id) {
            return { ...t, status: newStatus };
          }
          return t;
        }));

        return {
          success: true,
          feedback: `✅ Task Successfully Updated\n\n**Task:** ${found.title}\n**New Status:** ${newStatus}\n\nDashboard Updated ✅\nTask Tracker Updated ✅`
        };
      }
      case 'UPDATE_GOAL_PROGRESS': {
        const payload = action.payload;
        const targetTitle = payload.title || '';
        const found = goals.find(g => 
          (payload.id && g.id === payload.id) || 
          (targetTitle && g.title.toLowerCase().includes(targetTitle.toLowerCase()))
        );

        if (!found) {
          return {
            success: false,
            feedback: `❌ I couldn't update this goal because no matching goal containing '${targetTitle}' was found.`
          };
        }

        const newProgress = Math.min(100, Math.max(0, payload.progress));

        setGoals(prev => prev.map(g => {
          if (g.id === found.id) {
            return { ...g, progress: newProgress };
          }
          return g;
        }));

        return {
          success: true,
          feedback: `✅ Goal Successfully Updated\n\n**Goal:** ${found.title}\n**New Progress:** ${newProgress}%\n\nDashboard Updated ✅\nGrowth Hub Updated ✅`
        };
      }
      case 'RESCHEDULE_TASK': {
        const payload = action.payload;
        const targetTitle = payload.title || '';
        const found = tasks.find(t => 
          (payload.id && t.id === payload.id) || 
          (targetTitle && t.title.toLowerCase().includes(targetTitle.toLowerCase()))
        );

        if (!found) {
          return {
            success: false,
            feedback: `❌ I couldn't move this task because no matching task containing '${targetTitle}' was found.`
          };
        }

        const oldDate = found.deadline;
        const newDate = payload.deadline || new Date().toISOString().split('T')[0];

        setTasks(prev => prev.map(t => {
          if (t.id === found.id) {
            return { ...t, deadline: newDate };
          }
          return t;
        }));

        const formatDate = (ds: string) => {
          try {
            const parts = ds.split('-');
            if (parts.length === 3) {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return `${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]}`;
            }
          } catch {}
          return ds;
        };

        return {
          success: true,
          feedback: `✅ Task Successfully Updated\n\n**Task:** ${found.title}\n**Old Date:** ${formatDate(oldDate)}\n**New Date:** ${formatDate(newDate)}\n\nDashboard Updated ✅\nCalendar Updated ✅`
        };
      }
      case 'START_FOCUS_MODE': {
        setActiveTab('focus');
        return {
          success: true,
          feedback: `🚀 Focus Mode Started\n\nFocus panel active and loaded ✅`
        };
      }
      case 'NAVIGATE_TAB': {
        const payload = action.payload;
        const tab = payload.tab || 'dashboard';
        setActiveTab(tab);
        return {
          success: true,
          feedback: `🧭 Navigation Successful\n\nTab switched to **${tab}** ✅`
        };
      }
      case 'GENERATE_CALENDAR_SCHEDULE': {
        const freeHours = action.payload.freeHours || 5;
        const mode = action.payload.mode || 'day';
        generateCalendarSchedule(freeHours, mode);
        setActiveTab('calendar');
        return {
          success: true,
          feedback: `📅 **AI Scheduling Activated**\n\nAutomatically scheduled study and learning blocks matching your **${freeHours} free hours** for today! 🚀`
        };
      }
      case 'OPTIMIZE_WEEK': {
        optimizeWeek();
        setActiveTab('calendar');
        return {
          success: true,
          feedback: `⚡ **Calendar Optimization Completed**\n\nRe-routed high-focus blocks to your peak morning hours and minimized burnout risk! 🧘‍♂️`
        };
      }
      case 'RECOVER_LOST_TIME': {
        recoverLostTime();
        setActiveTab('calendar');
        return {
          success: true,
          feedback: `🔄 **Lost Time Recovery Initiated**\n\nAutomatically redistributed overdue tasks into tomorrow's open slots! ✅`
        };
      }
      default:
        return {
          success: false,
          feedback: `❌ Unknown action type: ${(action as any).type}`
        };
    }
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const rescheduleTask = (taskId: string, newDate: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, deadline: newDate } : t));
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        if (progress === 100 && g.progress < 100) {
          setTimeout(() => incrementStat('goalsAchieved', 1), 50);
        }
        return { ...g, progress };
      }
      return g;
    }));
  };

  const generateCalendarSchedule = (freeHours: number = 5, mode: 'day' | 'week' = 'day') => {
    const todayStr = '2026-06-27'; // Saturday, June 27, 2026 (Anchored Current Local Time)
    
    let focusHistory: any[] = [];
    try {
      const saved = localStorage.getItem('lifepilot_focus_history');
      if (saved) focusHistory = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse focus history', e);
    }

    const completedFocusMins = focusHistory.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const completedFocusHours = Math.round((completedFocusMins / 60) * 10) / 10;
    const avgFocusScore = focusHistory.length > 0 
      ? Math.round(focusHistory.reduce((acc, curr) => acc + (curr.focusScore || 0), 0) / focusHistory.length)
      : 85;

    const focusHistoryBonus = Math.min(10, Math.floor(completedFocusHours / 2));
    const focusScoreBonus = avgFocusScore >= 90 ? 5 : avgFocusScore < 70 ? -5 : 0;

    if (mode === 'day') {
      const dayEvents: CalendarEvent[] = [];
      const pendingTasks = tasks.filter(t => t.status !== 'Done');
      
      const sortedTasks = [...pendingTasks].sort((a, b) => {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        const pDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (pDiff !== 0) return pDiff;
        
        const aDeadline = a.deadline || '9999-12-31';
        const bDeadline = b.deadline || '9999-12-31';
        if (aDeadline !== bDeadline) return aDeadline.localeCompare(bDeadline);
        
        const complexityOrder = { High: 3, Medium: 2, Low: 1 };
        return complexityOrder[b.complexity] - complexityOrder[a.complexity];
      });

      const hasMeditation = habits.some(h => h.title.toLowerCase().includes('meditation') || h.title.toLowerCase().includes('hydration'));
      let currentTime = '09:00';
      
      if (todayStr === '2026-06-27') {
        currentTime = '14:00'; // Start from 2:00 PM as current time is Saturday 1:27 PM
      }

      if (currentTime === '09:00' && hasMeditation) {
        dayEvents.push({
          id: `cal-habit-meditation-${Date.now()}`,
          title: 'Morning Meditation & Planning',
          priority: 'Low',
          effort: 'Low',
          deadline: todayStr,
          estimatedTime: '30 mins',
          completionProbability: 95,
          stressImpact: 'Low',
          energyLevel: 'Low',
          date: todayStr,
          start: '08:30',
          end: '09:00',
          category: 'Personal',
          color: 'Green'
        });
      }

      let totalWorkMinutes = 0;
      const maxWorkMinutes = freeHours * 60;
      let taskIndex = 0;

      const parseTimeToMinutes = (timeStr: string) => {
        const [hours, mins] = timeStr.split(':').map(Number);
        return hours * 60 + mins;
      };

      const formatMinutesToTime = (totalMins: number) => {
        const hours = Math.floor(totalMins / 60) % 24;
        const mins = totalMins % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      };

      let currentMins = parseTimeToMinutes(currentTime);

      const closeUnpaidCommitments = commitments.filter(c => !c.paidThisPeriod && c.dueDate <= '2026-06-30');
      if (closeUnpaidCommitments.length > 0 && totalWorkMinutes < maxWorkMinutes) {
        const commitment = closeUnpaidCommitments[0];
        const duration = 30;
        const blockStart = formatMinutesToTime(currentMins);
        const blockEnd = formatMinutesToTime(currentMins + duration);
        
        dayEvents.push({
          id: `cal-commitment-${commitment.id}-${Date.now()}`,
          title: `Smart Commitment: Pay ${commitment.title}`,
          priority: 'High',
          effort: 'Low',
          deadline: commitment.dueDate,
          estimatedTime: '30 mins',
          completionProbability: 98,
          stressImpact: 'Low',
          energyLevel: 'Medium',
          date: todayStr,
          start: blockStart,
          end: blockEnd,
          category: 'Commitments',
          color: 'Yellow'
        });
        
        currentMins += duration;
        totalWorkMinutes += duration;
      }

      while (totalWorkMinutes < maxWorkMinutes && taskIndex < sortedTasks.length) {
        const task = sortedTasks[taskIndex];
        const taskHours = task.estimatedHours || (task.complexity === 'High' ? 2 : task.complexity === 'Medium' ? 1.5 : 1);
        const durationMinutes = Math.min(taskHours * 60, maxWorkMinutes - totalWorkMinutes);
        
        if (durationMinutes < 30) break;

        if (totalWorkMinutes > 0 && totalWorkMinutes % 120 === 0) {
          const breakDuration = 30;
          const breakStart = formatMinutesToTime(currentMins);
          const breakEnd = formatMinutesToTime(currentMins + breakDuration);
          
          dayEvents.push({
            id: `cal-break-recharge-${Date.now()}`,
            title: 'Decompression & Hydration Break',
            priority: 'Low',
            effort: 'Low',
            deadline: todayStr,
            estimatedTime: '30 mins',
            completionProbability: 100,
            stressImpact: 'Low',
            energyLevel: 'Low',
            date: todayStr,
            start: breakStart,
            end: breakEnd,
            category: 'Break',
            color: 'Green'
          });
          
          currentMins += breakDuration;
        }

        const blockStart = formatMinutesToTime(currentMins);
        const blockEnd = formatMinutesToTime(currentMins + durationMinutes);

        let prob = 80 + focusHistoryBonus + focusScoreBonus;
        if (task.priority === 'High') prob += 5;
        if (task.complexity === 'High') prob -= 10;
        if (task.deadline < todayStr) prob -= 15;
        prob = Math.max(45, Math.min(99, prob));

        let cat: CalendarEvent['category'] = 'Deep Work';
        if (task.category.toLowerCase().includes('coding') || task.category.toLowerCase().includes('dev')) cat = 'Coding';
        else if (task.category.toLowerCase().includes('study') || task.category.toLowerCase().includes('learning')) cat = 'Study';
        else if (task.category.toLowerCase().includes('wellness') || task.category.toLowerCase().includes('health')) cat = 'Exercise';
        else if (task.category.toLowerCase().includes('finance') || task.category.toLowerCase().includes('bill')) cat = 'Finance';

        let col: CalendarEvent['color'] = 'Blue';
        if (task.priority === 'High') col = 'Red';
        else if (cat === 'Coding' || cat === 'Study') col = 'Purple';
        else if (task.priority === 'Medium') col = 'Yellow';
        else if (task.priority === 'Low') col = 'Green';

        dayEvents.push({
          id: `cal-task-${task.id}-${Date.now()}`,
          title: task.title,
          priority: task.priority,
          effort: task.complexity,
          deadline: task.deadline,
          estimatedTime: `${durationMinutes / 60} hours`,
          completionProbability: prob,
          stressImpact: task.complexity,
          energyLevel: task.priority,
          date: todayStr,
          start: blockStart,
          end: blockEnd,
          category: cat,
          color: col
        });

        currentMins += durationMinutes;
        totalWorkMinutes += durationMinutes;
        taskIndex++;
      }

      const hasCodingHabit = habits.some(h => h.title.toLowerCase().includes('coding') || h.title.toLowerCase().includes('practice'));
      if (hasCodingHabit && totalWorkMinutes < maxWorkMinutes && currentTime === '09:00') {
        dayEvents.push({
          id: `cal-habit-coding-${Date.now()}`,
          title: '30-minute Coding Practice',
          priority: 'Medium',
          effort: 'Medium',
          deadline: todayStr,
          estimatedTime: '30 mins',
          completionProbability: 92,
          stressImpact: 'Low',
          energyLevel: 'Medium',
          date: todayStr,
          start: '16:00',
          end: '16:30',
          category: 'Coding',
          color: 'Purple'
        });
      }

      setCalendarEvents(prev => [
        ...prev.filter(e => e.date !== todayStr),
        ...dayEvents
      ]);
    } else {
      const weekDays = ['2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28', '2026-06-29', '2026-06-30', '2026-07-01'];
      const weekEvents: CalendarEvent[] = [];
      const pendingTasks = tasks.filter(t => t.status !== 'Done');
      let taskQueue = [...pendingTasks].sort((a, b) => {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        const pDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (pDiff !== 0) return pDiff;
        return (a.deadline || '').localeCompare(b.deadline || '');
      });

      weekDays.forEach((dayStr) => {
        let dailyMins = 540; // 09:00 AM
        let dailyWorkMinutes = 0;
        const maxDailyWorkMinutes = freeHours * 60;

        weekEvents.push({
          id: `cal-week-med-${dayStr}-${Date.now()}`,
          title: 'Morning Meditation & Planning',
          priority: 'Low',
          effort: 'Low',
          deadline: dayStr,
          estimatedTime: '30 mins',
          completionProbability: 95,
          stressImpact: 'Low',
          energyLevel: 'Low',
          date: dayStr,
          start: '08:30',
          end: '09:00',
          category: 'Personal',
          color: 'Green'
        });

        const dueCommitments = commitments.filter(c => !c.paidThisPeriod && c.dueDate === dayStr);
        if (dueCommitments.length > 0) {
          dueCommitments.forEach((commitment) => {
            const startStr = `${Math.floor(dailyMins / 60).toString().padStart(2, '0')}:${(dailyMins % 60).toString().padStart(2, '0')}`;
            dailyMins += 30;
            const endStr = `${Math.floor(dailyMins / 60).toString().padStart(2, '0')}:${(dailyMins % 60).toString().padStart(2, '0')}`;
            
            weekEvents.push({
              id: `cal-week-commit-${commitment.id}-${Date.now()}`,
              title: `Review & Pay ${commitment.title}`,
              priority: 'High',
              effort: 'Low',
              deadline: commitment.dueDate,
              estimatedTime: '30 mins',
              completionProbability: 99,
              stressImpact: 'Low',
              energyLevel: 'Medium',
              date: dayStr,
              start: startStr,
              end: endStr,
              category: 'Commitments',
              color: 'Yellow'
            });
            dailyWorkMinutes += 30;
          });
        }

        const isGoalDay = dayStr === '2026-06-27' || dayStr === '2026-06-30';
        if (isGoalDay && goals.length > 0) {
          const goal = goals[0];
          const uncompletedMilestone = goal.milestones.find(m => !m.completed);
          if (uncompletedMilestone) {
            const startStr = `${Math.floor(dailyMins / 60).toString().padStart(2, '0')}:${(dailyMins % 60).toString().padStart(2, '0')}`;
            dailyMins += 90;
            const endStr = `${Math.floor(dailyMins / 60).toString().padStart(2, '0')}:${(dailyMins % 60).toString().padStart(2, '0')}`;

            weekEvents.push({
              id: `cal-week-goal-${goal.id}-${Date.now()}`,
              title: `Goal Milestone: ${uncompletedMilestone.title}`,
              priority: 'High',
              effort: 'Medium',
              deadline: goal.deadline,
              estimatedTime: '1.5 hours',
              completionProbability: 85,
              stressImpact: 'Medium',
              energyLevel: 'High',
              date: dayStr,
              start: startStr,
              end: endStr,
              category: 'Learning',
              color: 'Purple'
            });
            dailyWorkMinutes += 90;
          }
        }

        const tasksToKeep: any[] = [];
        taskQueue.forEach((task) => {
          const taskHours = task.estimatedHours || 1.5;
          const taskMinutes = taskHours * 60;
          const isTaskDueSoon = task.deadline <= dayStr;
          const canFit = (dailyWorkMinutes + taskMinutes) <= maxDailyWorkMinutes;

          if (canFit && (isTaskDueSoon || task.priority === 'High' || dailyWorkMinutes === 0)) {
            const startStr = `${Math.floor(dailyMins / 60).toString().padStart(2, '0')}:${(dailyMins % 60).toString().padStart(2, '0')}`;
            dailyMins += taskMinutes;
            const endStr = `${Math.floor(dailyMins / 60).toString().padStart(2, '0')}:${(dailyMins % 60).toString().padStart(2, '0')}`;

            let prob = 82 + focusHistoryBonus + focusScoreBonus;
            if (task.priority === 'High') prob += 5;
            if (task.complexity === 'High') prob -= 10;
            if (task.deadline < todayStr) prob -= 15;
            prob = Math.max(45, Math.min(99, prob));

            let col: CalendarEvent['color'] = 'Blue';
            if (task.priority === 'High') col = 'Red';
            else if (task.priority === 'Medium') col = 'Purple';
            else if (task.priority === 'Low') col = 'Green';

            let cat: CalendarEvent['category'] = 'Deep Work';
            if (task.category.toLowerCase().includes('coding')) cat = 'Coding';
            else if (task.category.toLowerCase().includes('study')) cat = 'Study';
            else if (task.category.toLowerCase().includes('wellness')) cat = 'Exercise';

            weekEvents.push({
              id: `cal-week-task-${task.id}-${Date.now()}`,
              title: task.title,
              priority: task.priority,
              effort: task.complexity,
              deadline: task.deadline,
              estimatedTime: `${taskHours} hours`,
              completionProbability: prob,
              stressImpact: task.complexity,
              energyLevel: task.priority,
              date: dayStr,
              start: startStr,
              end: endStr,
              category: cat,
              color: col
            });

            dailyWorkMinutes += taskMinutes;
          } else {
            tasksToKeep.push(task);
          }
        });

        taskQueue = tasksToKeep;

        weekEvents.push({
          id: `cal-week-coding-${dayStr}-${Date.now()}`,
          title: '30-minute Coding Practice',
          priority: 'Medium',
          effort: 'Medium',
          deadline: dayStr,
          estimatedTime: '30 mins',
          completionProbability: 90,
          stressImpact: 'Low',
          energyLevel: 'Medium',
          date: dayStr,
          start: '16:00',
          end: '16:30',
          category: 'Coding',
          color: 'Purple'
        });
      });

      setCalendarEvents(weekEvents);
    }
  };

  const optimizeWeek = () => {
    setCalendarEvents(prev => {
      const optimized = prev.map((e) => {
        if (e.category === 'Deep Work' || e.category === 'Coding') {
          const isTwoHours = e.estimatedTime.includes('2') || e.estimatedTime.includes('1.5');
          const newStart = '09:00';
          const newEnd = isTwoHours ? '11:00' : '10:30';

          return {
            ...e,
            start: newStart,
            end: newEnd,
            stressImpact: 'Low' as const,
            completionProbability: Math.min(99, e.completionProbability + 10)
          };
        } else if (e.category === 'Commitments' || e.category === 'Meetings') {
          return {
            ...e,
            start: '14:30',
            end: e.estimatedTime.includes('30') ? '15:00' : '15:30',
            stressImpact: 'Low' as const,
            completionProbability: Math.min(99, e.completionProbability + 5)
          };
        }
        return e;
      });

      const finalEvents: CalendarEvent[] = [];
      const daysWithEvents = Array.from(new Set(optimized.map(e => e.date)));

      daysWithEvents.forEach(d => {
        const dayEvents = optimized.filter(e => e.date === d).sort((a, b) => a.start.localeCompare(b.start));
        
        for (let i = 0; i < dayEvents.length; i++) {
          finalEvents.push(dayEvents[i]);
          
          if (i < dayEvents.length - 1) {
            const currentEnd = dayEvents[i].end;
            const nextStart = dayEvents[i+1].start;
            
            const [cHours, cMins] = currentEnd.split(':').map(Number);
            const [nHours, nMins] = nextStart.split(':').map(Number);
            
            const diffMins = (nHours * 60 + nMins) - (cHours * 60 + cMins);
            if (diffMins >= 0 && diffMins <= 15 && dayEvents[i].category !== 'Break' && dayEvents[i+1].category !== 'Break') {
              finalEvents.push({
                id: `cal-opt-break-${d}-${Date.now()}-${i}`,
                title: 'Scientific Cognitive Buffer Break',
                priority: 'Low',
                effort: 'Low',
                deadline: d,
                estimatedTime: '15 mins',
                completionProbability: 100,
                stressImpact: 'Low',
                energyLevel: 'Low',
                date: d,
                start: currentEnd,
                end: nextStart,
                category: 'Break',
                color: 'Green'
              });
            }
          }
        }
      });

      return finalEvents.length > 0 ? finalEvents : optimized;
    });
  };

  const balanceWorkload = () => {
    setCalendarEvents(prev => {
      if (prev.length === 0) return prev;
      
      const parseDuration = (est: string) => {
        if (est.includes('30')) return 0.5;
        if (est.includes('45')) return 0.75;
        const match = est.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : 1;
      };

      const dayLoads: Record<string, number> = {};
      prev.forEach(e => {
        if (e.category !== 'Break' && e.category !== 'Personal') {
          dayLoads[e.date] = (dayLoads[e.date] || 0) + parseDuration(e.estimatedTime);
        }
      });

      const dayList = Array.from(new Set(prev.map(e => e.date))).sort();
      const heavyDays = dayList.filter(d => (dayLoads[d] || 0) > 4.5);
      const lightDays = dayList.filter(d => (dayLoads[d] || 0) < 3);

      if (heavyDays.length === 0 || lightDays.length === 0) {
        return prev.map(e => ({
          ...e,
          stressImpact: 'Low' as const,
          completionProbability: Math.min(99, e.completionProbability + 5)
        }));
      }

      const targetLightDay = lightDays[0];
      const sourceHeavyDay = heavyDays[0];

      let shiftedEventId: string | null = null;
      const balanced = prev.map(e => {
        if (e.date === sourceHeavyDay && (e.priority === 'Medium' || e.priority === 'Low') && e.category !== 'Break' && !shiftedEventId) {
          shiftedEventId = e.id;
          return {
            ...e,
            date: targetLightDay,
            start: '14:00',
            end: e.estimatedTime.includes('30') ? '14:30' : '15:30',
            stressImpact: 'Low' as const,
            completionProbability: Math.min(99, e.completionProbability + 15)
          };
        }
        return e;
      });

      return balanced;
    });
  };

  const recoverLostTime = () => {
    const todayStr = '2026-06-27'; // Saturday, June 27, 2026
    const tomorrowStr = '2026-06-28';
    const overdueTasks = tasks.filter(t => t.status !== 'Done' && t.deadline < todayStr);

    setCalendarEvents(prev => {
      const recoveredPastEvents = prev.map(e => {
        const isPast = e.date < todayStr;
        const isProductive = e.category === 'Deep Work' || e.category === 'Coding' || e.category === 'Study';
        
        if (isPast && isProductive) {
          return {
            ...e,
            title: e.title.startsWith('🔄 Recovered:') ? e.title : `🔄 Recovered: ${e.title}`,
            date: tomorrowStr,
            start: '15:00',
            end: e.estimatedTime.includes('30') ? '15:30' : '16:30',
            stressImpact: 'Medium' as const,
            completionProbability: 95
          };
        }
        return e;
      });

      const additionalEvents: CalendarEvent[] = [];
      overdueTasks.forEach((task, idx) => {
        const alreadyScheduled = recoveredPastEvents.some(e => e.title.includes(task.title));
        if (!alreadyScheduled) {
          const duration = task.estimatedHours || 1;
          const startMins = 840 + (idx * 90); // 14:00 + idx * 1.5h
          const startStr = `${Math.floor(startMins / 60).toString().padStart(2, '0')}:${(startMins % 60).toString().padStart(2, '0')}`;
          const endStr = `${Math.floor((startMins + duration * 60) / 60).toString().padStart(2, '0')}:${((startMins + duration * 60) % 60).toString().padStart(2, '0')}`;

          additionalEvents.push({
            id: `cal-recovered-task-${task.id}-${Date.now()}`,
            title: `🔄 Recovered: ${task.title}`,
            priority: 'High',
            effort: task.complexity,
            deadline: task.deadline,
            estimatedTime: `${duration} hours`,
            completionProbability: 95,
            stressImpact: 'Medium',
            energyLevel: 'High',
            date: tomorrowStr,
            start: startStr,
            end: endStr,
            category: 'Deep Work',
            color: 'Red'
          });
        }
      });

      return [...recoveredPastEvents, ...additionalEvents];
    });
  };

  const updateCalendarEvents = (events: CalendarEvent[]) => {
    setCalendarEvents(events);
  };

  const moveCalendarEvent = (eventId: string, newDate: string, newStart?: string, newEnd?: string) => {
    setCalendarEvents(prev => {
      const updated = prev.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            date: newDate,
            start: newStart || e.start,
            end: newEnd || e.end,
            stressImpact: 'Low' as const
          };
        }
        return e;
      });
      
      const movedEvent = updated.find(e => e.id === eventId);
      if (movedEvent && movedEvent.title === 'DBMS Assignment' && newDate === '2026-06-26') {
        return updated.map(e => {
          if (e.title === 'Hackathon Work') {
            return {
              ...e,
              stressImpact: 'Medium' as const,
              completionProbability: 75
            };
          }
          return e;
        });
      }
      return updated;
    });
  };

  const clearAssistantHistory = () => {
    setMessages([
      {
        id: 'msg-init-reset',
        sender: 'ai',
        text: 'Hello! I am your LifePilot Copilot Companion. I can help you plan your schedule, trigger focus timers, outline learning pathways, or configure Panic Mode. What would you like to accomplish today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const switchDemoPersona = (personaName: 'aditi' | 'rajesh' | 'priya') => {
    let newProfile: UserProfile;
    let newTasks: Task[] = [];
    let newHabits: Habit[] = [];
    let newGoals: Goal[] = [];
    let newCommitments: Commitment[] = [];
    let newRoadmaps: Roadmap[] = [];
    let newCalendarEvents: CalendarEvent[] = [];
    let newGamification: GamificationState;
    let newStatistics: StatisticsState;
    let newPersonaProfile: PersonaProfileData;
    let welcomeMessage: string = '';

    if (personaName === 'aditi') {
      newProfile = {
        name: 'Aditi Kadam',
        role: 'Student',
        bio: 'Computer Engineering Student preparing for a Google Software Engineering Internship. Actively practices DSA, full-stack, and Linux command lines.',
        strengths: ['Rigorous DSA skills', 'Keen curiosity', 'Strong Linux terminal proficiency'],
        challenges: ['Context switching under heavy workload', 'Occasions of exam-season anxiety'],
        coreGoals: ['Secure Google SWE Internship', 'Win local hackathons', 'Maintain top GPA'],
        interests: ['Full-Stack Web Development', 'Linux Kernels', 'Data Structures & Algorithms'],
        growthAreas: ['Effective time boxing', 'Project portfolio construction'],
        recommendedSkills: ['Docker Containerization', 'Kubernetes', 'React', 'AI Prompting'],
        onboarded: true
      };
      newTasks = [
        {
          id: 't-aditi-1',
          title: 'Implement Red-Black tree traversal visualization',
          deadline: '2026-06-28',
          complexity: 'High',
          priority: 'High',
          status: 'InProgress',
          subtasks: [
            { id: 'st-ad-1', title: 'Write self-balancing rotation functions', completed: true },
            { id: 'st-ad-2', title: 'Render interactive node animation canvas', completed: false }
          ],
          category: 'DSA',
          estimatedHours: 3,
          procrastinationCount: 0
        },
        {
          id: 't-aditi-2',
          title: 'Study Linux system calls & scheduler internals',
          deadline: '2026-06-30',
          complexity: 'High',
          priority: 'Medium',
          status: 'Todo',
          subtasks: [],
          category: 'OS',
          estimatedHours: 4,
          procrastinationCount: 0
        },
        {
          id: 't-aditi-3',
          title: 'Prep LeetCode Hard problems for Google interview',
          deadline: '2026-06-29',
          complexity: 'High',
          priority: 'High',
          status: 'Todo',
          subtasks: [],
          category: 'LeetCode',
          estimatedHours: 2,
          procrastinationCount: 0
        }
      ];
      newHabits = [
        { id: 'h-aditi-1', title: 'Solve daily LeetCode challenge', frequency: 'daily', streak: 18 },
        { id: 'h-aditi-2', title: 'Read technical documentation or tech books', frequency: 'daily', streak: 5 },
        { id: 'h-aditi-3', title: 'Revise Linux command utilities', frequency: 'daily', streak: 12 }
      ];
      newGoals = [
        {
          id: 'g-aditi-1',
          title: 'Secure Google Software Engineering Internship',
          category: 'Career',
          progress: 60,
          deadline: '2026-09-01',
          milestones: [
            { id: 'm-ad1', title: 'Solve 200+ LeetCode DSA questions', completed: true },
            { id: 'm-ad2', title: 'Build and host a complex full-stack project', completed: true },
            { id: 'm-ad3', title: 'Refine technical resume & practice interviews', completed: false },
            { id: 'm-ad4', title: 'Pass Google technical screening and team match', completed: false }
          ]
        }
      ];
      newCommitments = [
        {
          id: 'c-aditi-1',
          title: 'College Semester Fees',
          amount: '₹45,000',
          category: 'Academics',
          frequency: 'half yearly',
          dueDate: '2026-07-27',
          paidThisPeriod: false,
          priority: 'High',
          autopayEnabled: false,
          lateFeeEstimate: 1000
        },
        {
          id: 'c-aditi-2',
          title: 'High-Speed Broadband Internet',
          amount: '₹1,200',
          category: 'Utility',
          frequency: 'monthly',
          dueDate: '2026-06-28',
          paidThisPeriod: false,
          priority: 'High',
          autopayEnabled: true,
          lateFeeEstimate: 50
        },
        {
          id: 'c-aditi-3',
          title: 'Netflix Premium Subscription',
          amount: '₹649',
          category: 'Subscription',
          frequency: 'monthly',
          dueDate: '2026-06-27',
          paidThisPeriod: true,
          priority: 'Low',
          autopayEnabled: true,
          lateFeeEstimate: 0
        },
        {
          id: 'c-aditi-4',
          title: 'HDFC Credit Card Bill',
          amount: '₹8,450',
          category: 'Finance',
          frequency: 'monthly',
          dueDate: '2026-06-24',
          paidThisPeriod: false,
          priority: 'High',
          autopayEnabled: false,
          lateFeeEstimate: 500
        }
      ];
      newRoadmaps = [
        {
          id: 'r-aditi-1',
          progress: 33,
          topic: 'Container Engineering',
          steps: [
            { id: 'st-r1', title: 'Docker basics, images, & layers', status: 'Completed', description: 'Understand basic images, containers and Dockerfiles', estimatedHours: 2 },
            { id: 'st-r2', title: 'Compose files & multi-container architecture', status: 'InProgress', description: 'Link web servers and database containers', estimatedHours: 3 },
            { id: 'st-r3', title: 'Kubernetes Pods, Deployments & Services', status: 'Pending', description: 'Configure statefulsets and load balancers', estimatedHours: 4 }
          ]
        },
        {
          id: 'r-aditi-2',
          progress: 100,
          topic: 'Frontend Architecture',
          steps: [
            { id: 'st-r4', title: 'Custom state hooks and memoization', status: 'Completed', description: 'Design performant custom hooks', estimatedHours: 2 },
            { id: 'st-r5', title: 'Concurrent rendering, Suspense, and Transitions', status: 'Completed', description: 'Handle UI transitions gracefully', estimatedHours: 3 }
          ]
        }
      ];
      newCalendarEvents = [
        {
          id: 'e-aditi-1',
          title: 'LeetCode Daily Sprint',
          start: '08:00',
          end: '09:00',
          date: '2026-06-28',
          category: 'Coding',
          priority: 'High',
          effort: 'High',
          deadline: '2026-06-28',
          estimatedTime: '1 hour',
          completionProbability: 95,
          stressImpact: 'Low',
          energyLevel: 'High',
          color: 'Blue'
        },
        {
          id: 'e-aditi-2',
          title: 'Operating Systems & Linux Internal Lectures',
          start: '10:00',
          end: '12:00',
          date: '2026-06-28',
          category: 'Study',
          priority: 'High',
          effort: 'Medium',
          deadline: '2026-06-28',
          estimatedTime: '2 hours',
          completionProbability: 90,
          stressImpact: 'Medium',
          energyLevel: 'High',
          color: 'Purple'
        },
        {
          id: 'e-aditi-3',
          title: 'Google Mock Technical Interview',
          start: '15:00',
          end: '16:30',
          date: '2026-06-28',
          category: 'Deep Work',
          priority: 'High',
          effort: 'High',
          deadline: '2026-06-28',
          estimatedTime: '1.5 hours',
          completionProbability: 85,
          stressImpact: 'High',
          energyLevel: 'High',
          color: 'Red'
        }
      ];
      newGamification = {
        xp: 180,
        level: 2,
        badges: ['DSA Slayer', 'Linux Commander', 'Consistency King'],
        achievements: [
          { id: 'streak-7', title: '7 Day Streak', description: 'Maintain a 7-day habit streak', unlocked: true },
          { id: 'streak-30', title: '30 Day Streak', description: 'Maintain a 30-day habit streak', unlocked: false },
          { id: 'focus-100', title: 'Deep Worker', description: 'Complete 100 focus hours', unlocked: false },
          { id: 'tasks-50', title: 'Task Slayer', description: 'Complete 50 tasks', unlocked: false }
        ],
        streak: 12
      };
      newStatistics = {
        tasksCompleted: 45,
        hoursFocused: 34.2,
        lessonsWatched: 18,
        habitsMaintained: 96,
        commitmentsPaid: 12,
        goalsAchieved: 3,
        focusSessionsCompleted: 20,
        panicSessionsRecovered: 1,
        pathwaysCompleted: 2,
        nightOwlConsecutiveDays: 3,
        tasksCompletedBeforeDeadline: 15
      };
      newPersonaProfile = {
        dynamicPersona: 'Google Internship Aspirant',
        productivityArchetype: 'Consistency Champion',
        strengths: ['Deep technical domain comprehension', 'Rigorous daily coding routine', 'Excellent structural optimization skills'],
        growthOpportunities: ['Balancing academics with mock schedules', 'Managing exam anxiety boundaries', 'Combating occasional burnouts'],
        currentIdentity: 'Aditi, a computer engineering student working double-time to break into Google via high-caliber programming, daily algorithmic practice, and OS internals exploration.',
        suggestedImprovements: ['Structure your weekend around mock sessions to avoid academic fatigue', 'Use high energy blocks exclusively for Hard problems', 'Automate low priority subtasks']
      };
      welcomeMessage = "Welcome back, Aditi! Let's conquer our Google SWE Internship goals today. Your Red-Black tree visualization is waiting for you, and we have a mock interview at 3:00 PM. Ready to run standard focus blocks?";
    } else if (personaName === 'rajesh') {
      newProfile = {
        name: 'Rajesh Sharma',
        role: 'Professional',
        bio: 'Senior Product Manager at a fast-growing tech company, orchestrating multi-team features, roadmap alignment, and backlog grooming sessions.',
        strengths: ['Strategic roadmapping', 'Cross-team coordination', 'Strong stakeholder communication'],
        challenges: ['Calendar overloads and endless alignment meetings', 'Tedious documentation tasks'],
        coreGoals: ['Launch Q3 product feature milestones', 'Optimize sprint delivery velocity', 'Exceed product usage metrics'],
        interests: ['Product Strategy', 'Agile Methodologies', 'User Metrics & Growth'],
        growthAreas: ['Leadership presence', 'Advanced analytics dashboards'],
        recommendedSkills: ['Advanced Agile', 'KPI & Analytics Tracking', 'Product Management Core'],
        onboarded: true
      };
      newTasks = [
        {
          id: 't-raj-1',
          title: 'Draft Q3 feature specification document & align engineers',
          deadline: '2026-06-28',
          complexity: 'Medium',
          priority: 'High',
          status: 'InProgress',
          subtasks: [
            { id: 'st-rj1', title: 'Write user persona definitions', completed: true },
            { id: 'st-rj2', title: 'Gather engineering estimate benchmarks', completed: false }
          ],
          category: 'Product Spec',
          estimatedHours: 4,
          procrastinationCount: 0
        },
        {
          id: 't-raj-2',
          title: 'Complete design audit of checkout page redesign',
          deadline: '2026-06-30',
          complexity: 'Medium',
          priority: 'Medium',
          status: 'Todo',
          subtasks: [],
          category: 'UI/UX',
          estimatedHours: 2,
          procrastinationCount: 0
        },
        {
          id: 't-raj-3',
          title: 'Sync with stakeholders on marketing launch schedule',
          deadline: '2026-06-29',
          complexity: 'Low',
          priority: 'High',
          status: 'Todo',
          subtasks: [],
          category: 'Stakeholders',
          estimatedHours: 1.5,
          procrastinationCount: 0
        }
      ];
      newHabits = [
        { id: 'h-raj-1', title: 'Prepare daily standup bullet points', frequency: 'daily', streak: 24 },
        { id: 'h-raj-2', title: 'Read product design and metrics publications', frequency: 'weekly', streak: 6 },
        { id: 'h-raj-3', title: 'Block out calendar focus sessions', frequency: 'daily', streak: 15 }
      ];
      newGoals = [
        {
          id: 'g-raj-1',
          title: 'Exceed Q3 Product Launch Metrics',
          category: 'Career',
          progress: 40,
          deadline: '2026-09-30',
          milestones: [
            { id: 'm-rj1', title: 'Conduct user research interviews (15 users)', completed: true },
            { id: 'm-rj2', title: 'Approve final interactive design wireframes', completed: true },
            { id: 'm-rj3', title: 'Deploy feature in closed beta test group', completed: false },
            { id: 'm-rj4', title: 'Rollout globally to 100% of SaaS user base', completed: false }
          ]
        }
      ];
      newCommitments = [
        {
          id: 'c-raj-1',
          title: 'High-Speed Office Broadband',
          amount: '₹1,500',
          category: 'Utility',
          frequency: 'monthly',
          dueDate: '2026-06-28',
          paidThisPeriod: true,
          priority: 'High',
          autopayEnabled: true,
          lateFeeEstimate: 50
        },
        {
          id: 'c-raj-2',
          title: 'Premium Gym & Spa Membership',
          amount: '₹3,500',
          category: 'Wellness',
          frequency: 'monthly',
          dueDate: '2026-07-05',
          paidThisPeriod: false,
          priority: 'Medium',
          autopayEnabled: false,
          lateFeeEstimate: 100
        },
        {
          id: 'c-raj-3',
          title: 'Family Health Insurance Premium',
          amount: '₹12,000',
          category: 'Insurance',
          frequency: 'yearly',
          dueDate: '2026-07-12',
          paidThisPeriod: false,
          priority: 'High',
          autopayEnabled: false,
          lateFeeEstimate: 200
        },
        {
          id: 'c-raj-4',
          title: 'Electricity Bill',
          amount: '₹4,200',
          category: 'Utility',
          frequency: 'monthly',
          dueDate: '2026-06-29',
          paidThisPeriod: false,
          priority: 'High',
          autopayEnabled: false,
          lateFeeEstimate: 150
        }
      ];
      newRoadmaps = [
        {
          id: 'r-raj-1',
          progress: 33,
          topic: 'Product Leadership',
          steps: [
            { id: 'st-rj-r1', title: 'LLM capabilities, APIs, & tokenization models', status: 'Completed', description: 'Understand key parameters of large language models', estimatedHours: 3 },
            { id: 'st-rj-r2', title: 'UX patterns, user controls, & guardrails design', status: 'InProgress', description: 'Interactive patterns and dynamic feedback loops', estimatedHours: 2 },
            { id: 'st-rj-r3', title: 'AI scaling cost, caching, & latency guidelines', status: 'Pending', description: 'Evaluate production latency optimizations', estimatedHours: 4 }
          ]
        },
        {
          id: 'r-raj-2',
          progress: 100,
          topic: 'Engineering Management',
          steps: [
            { id: 'st-rj-r4', title: 'Scaled Agile Frameworks (SAFe)', status: 'Completed', description: 'Study coordination over complex portfolio teams', estimatedHours: 2 },
            { id: 'st-rj-r5', title: 'Advanced sprint estimation and velocity metrics', status: 'Completed', description: 'Analyze performance ratios and delivery speed', estimatedHours: 3 }
          ]
        }
      ];
      newCalendarEvents = [
        {
          id: 'e-raj-1',
          title: 'Focus Block: Specs Drafting',
          start: '09:00',
          end: '11:00',
          date: '2026-06-28',
          category: 'Deep Work',
          priority: 'High',
          effort: 'High',
          deadline: '2026-06-28',
          estimatedTime: '2 hours',
          completionProbability: 92,
          stressImpact: 'Medium',
          energyLevel: 'High',
          color: 'Blue'
        },
        {
          id: 'e-raj-2',
          title: 'Engineering Sprint Grooming Sync',
          start: '13:30',
          end: '14:30',
          date: '2026-06-28',
          category: 'Meetings',
          priority: 'Medium',
          effort: 'Medium',
          deadline: '2026-06-28',
          estimatedTime: '1 hour',
          completionProbability: 95,
          stressImpact: 'Low',
          energyLevel: 'Medium',
          color: 'Purple'
        },
        {
          id: 'e-raj-3',
          title: 'Checkout Redesign UI Review',
          start: '16:00',
          end: '17:00',
          date: '2026-06-28',
          category: 'Meetings',
          priority: 'Medium',
          effort: 'Low',
          deadline: '2026-06-28',
          estimatedTime: '1 hour',
          completionProbability: 88,
          stressImpact: 'Medium',
          energyLevel: 'Medium',
          color: 'Green'
        }
      ];
      newGamification = {
        xp: 320,
        level: 3,
        badges: ['Sprint Commander', 'Roadmap Architect', 'Meeting Survivor'],
        achievements: [
          { id: 'streak-7', title: '7 Day Streak', description: 'Maintain a 7-day habit streak', unlocked: true },
          { id: 'streak-30', title: '30 Day Streak', description: 'Maintain a 30-day habit streak', unlocked: true },
          { id: 'focus-100', title: 'Deep Worker', description: 'Complete 100 focus hours', unlocked: false }
        ],
        streak: 15
      };
      newStatistics = {
        tasksCompleted: 88,
        hoursFocused: 110.5,
        lessonsWatched: 12,
        habitsMaintained: 140,
        commitmentsPaid: 24,
        goalsAchieved: 5,
        focusSessionsCompleted: 40,
        panicSessionsRecovered: 3,
        pathwaysCompleted: 1,
        nightOwlConsecutiveDays: 1,
        tasksCompletedBeforeDeadline: 25
      };
      newPersonaProfile = {
        dynamicPersona: 'Product Roadmap Master',
        productivityArchetype: 'Systems Thinker',
        strengths: ['Highly strategic mindset', 'Excellent cross-functional alignment', 'Proactive communication'],
        growthOpportunities: ['Minimizing calendar meeting fatigue', 'Securing high energy slots for deep docs', 'Managing stress levels'],
        currentIdentity: 'Rajesh, an experienced Senior Product Manager aiming to deliver the high priority Q3 roadmap under severe calendar and multi-stakeholder pressures.',
        suggestedImprovements: ['Rigidly time-box non-critical synchronization calls', 'Carve a daily 2-hour morning focus slot before standups', 'Delegate drafting subtasks']
      };
      welcomeMessage = "Hello Rajesh! We have a structured day ahead. Your calendar focus block is set from 9 to 11 AM for drafting the Q3 specs. Let's make sure you get uninterrupted focus today!";
    } else { // priya
      newProfile = {
        name: 'Priya Nair',
        role: 'Entrepreneur',
        bio: 'Co-Founder and CEO of a SaaS fintech startup. Juggling venture fundraising, customer acquisition pipelines, product validation, and agile engineering pivots.',
        strengths: ['Compelling storytelling', 'Customer empathy', 'High perseverance'],
        challenges: ['Constant context switching under high-pressure', 'Overcommitment of custom features'],
        coreGoals: ['Pitch Series A & lock Seed investors', 'Acquire 50 enterprise pilots', 'Scale recurring MRR'],
        interests: ['FinTech Solutions', 'Venture Building', 'Scale-Up Leadership'],
        growthAreas: ['Effective delegation patterns', 'Financial forecasting models'],
        recommendedSkills: ['Lean Startup Validation', 'Negotiation & Pitching', 'Corporate Governance'],
        onboarded: true
      };
      newTasks = [
        {
          id: 't-priya-1',
          title: 'Finalize Seed investor pitch deck updates',
          deadline: '2026-06-28',
          complexity: 'High',
          priority: 'High',
          status: 'InProgress',
          subtasks: [
            { id: 'st-pr1', title: 'Update active MRR charts and projections', completed: true },
            { id: 'st-pr2', title: 'Refine slides on unique competitive boundaries', completed: false }
          ],
          category: 'Fundraising',
          estimatedHours: 5,
          procrastinationCount: 0
        },
        {
          id: 't-priya-2',
          title: 'Draft contract terms for top enterprise pilot lead',
          deadline: '2026-06-30',
          complexity: 'High',
          priority: 'High',
          status: 'Todo',
          subtasks: [],
          category: 'Legal/Sales',
          estimatedHours: 3,
          procrastinationCount: 0
        },
        {
          id: 't-priya-3',
          title: 'Prepare product pricing matrix revisions',
          deadline: '2026-06-29',
          complexity: 'Medium',
          priority: 'Medium',
          status: 'Todo',
          subtasks: [],
          category: 'Finance',
          estimatedHours: 2,
          procrastinationCount: 0
        }
      ];
      newHabits = [
        { id: 'h-priya-1', title: 'Write weekly all-hands memo', frequency: 'weekly', streak: 8 },
        { id: 'h-priya-2', title: 'Review competitor marketing shifts', frequency: 'weekly', streak: 4 },
        { id: 'h-priya-3', title: 'Daily mindfulness breathing & planning', frequency: 'daily', streak: 30 }
      ];
      newGoals = [
        {
          id: 'g-priya-1',
          title: 'Lock Seed Investment Round ($1.5M)',
          category: 'Business',
          progress: 50,
          deadline: '2026-08-15',
          milestones: [
            { id: 'm-pr1', title: 'Draft financial model & 3-year projection spreadsheet', completed: true },
            { id: 'm-pr2', title: 'Secure introductory pitch sessions with 15 VCs', completed: true },
            { id: 'm-pr3', title: 'Obtain initial signed term sheets from Lead VC', completed: false },
            { id: 'm-pr4', title: 'Complete legal due diligence and wire transfer', completed: false }
          ]
        }
      ];
      newCommitments = [
        {
          id: 'c-priya-1',
          title: 'Co-Working Office Rent',
          amount: '₹38,000',
          category: 'Business',
          frequency: 'monthly',
          dueDate: '2026-07-01',
          paidThisPeriod: false,
          priority: 'High',
          autopayEnabled: true,
          lateFeeEstimate: 2000
        },
        {
          id: 'c-priya-2',
          title: 'AWS Cloud Server Bill',
          amount: '₹24,500',
          category: 'Utility',
          frequency: 'monthly',
          dueDate: '2026-06-28',
          paidThisPeriod: false,
          priority: 'High',
          autopayEnabled: true,
          lateFeeEstimate: 500
        },
        {
          id: 'c-priya-3',
          title: 'Employee Health Insurance Benefits',
          amount: '₹45,000',
          category: 'Insurance',
          frequency: 'monthly',
          dueDate: '2026-07-10',
          paidThisPeriod: false,
          priority: 'High',
          autopayEnabled: false,
          lateFeeEstimate: 1000
        }
      ];
      newRoadmaps = [
        {
          id: 'r-priya-1',
          progress: 33,
          topic: 'Startup Funding',
          steps: [
            { id: 'st-pr-r1', title: 'Understanding capitalization tables, dilution, & options pools', status: 'Completed', description: 'Model financial tables and distribution charts', estimatedHours: 3 },
            { id: 'st-pr-r2', title: 'Structuring SAFE notes and convertible debt limits', status: 'InProgress', description: 'Draft pre-seed note triggers and limits', estimatedHours: 2 },
            { id: 'st-pr-r3', title: 'Negotiating term sheets, control covenants, & board seat allocation', status: 'Pending', description: 'Evaluate founder governance parameters', estimatedHours: 4 }
          ]
        },
        {
          id: 'r-priya-2',
          progress: 0,
          topic: 'Engineering Management',
          steps: [
            { id: 'st-pr-r4', title: 'High throughput Express routers and Redis caching layers', status: 'Pending', description: 'Implement microservices with heavy cache layers', estimatedHours: 5 }
          ]
        }
      ];
      newCalendarEvents = [
        {
          id: 'e-priya-1',
          title: 'Team Weekly Standup Sync',
          start: '09:30',
          end: '10:30',
          date: '2026-06-28',
          category: 'Meetings',
          priority: 'Medium',
          effort: 'Low',
          deadline: '2026-06-28',
          estimatedTime: '1 hour',
          completionProbability: 95,
          stressImpact: 'Low',
          energyLevel: 'Medium',
          color: 'Green'
        },
        {
          id: 'e-priya-2',
          title: 'Seed Investor Pitch Presentation',
          start: '11:00',
          end: '12:30',
          date: '2026-06-28',
          category: 'Deep Work',
          priority: 'High',
          effort: 'High',
          deadline: '2026-06-28',
          estimatedTime: '1.5 hours',
          completionProbability: 75,
          stressImpact: 'High',
          energyLevel: 'High',
          color: 'Red'
        },
        {
          id: 'e-priya-3',
          title: 'Enterprise Pilot Onboarding Call',
          start: '14:00',
          end: '15:00',
          date: '2026-06-28',
          category: 'Meetings',
          priority: 'High',
          effort: 'Medium',
          deadline: '2026-06-28',
          estimatedTime: '1 hour',
          completionProbability: 85,
          stressImpact: 'Medium',
          energyLevel: 'High',
          color: 'Blue'
        }
      ];
      newGamification = {
        xp: 550,
        level: 5,
        badges: ['Venture Wizard', 'Chief Optimist', 'SaaS Samurai'],
        achievements: [
          { id: 'streak-7', title: '7 Day Streak', description: 'Maintain a 7-day habit streak', unlocked: true },
          { id: 'streak-30', title: '30 Day Streak', description: 'Maintain a 30-day habit streak', unlocked: true },
          { id: 'focus-100', title: 'Deep Worker', description: 'Complete 100 focus hours', unlocked: true }
        ],
        streak: 30
      };
      newStatistics = {
        tasksCompleted: 140,
        hoursFocused: 185.0,
        lessonsWatched: 24,
        habitsMaintained: 220,
        commitmentsPaid: 50,
        goalsAchieved: 8,
        focusSessionsCompleted: 75,
        panicSessionsRecovered: 5,
        pathwaysCompleted: 3,
        nightOwlConsecutiveDays: 5,
        tasksCompletedBeforeDeadline: 45
      };
      newPersonaProfile = {
        dynamicPersona: 'Venture SaaS Founder',
        productivityArchetype: 'Chief Optimist',
        strengths: ['Compelling investor pitching', 'Extremely resilient attitude', 'Deep customer focus empathy'],
        growthOpportunities: ['Minimizing constant task context-switching', 'Delegating non-critical administrative items', 'Setting wellness margins'],
        currentIdentity: 'Priya, SaaS startup CEO juggling investor rounds, client validation pipelines, and team dynamics while protecting executive focus margins.',
        suggestedImprovements: ['Strictly block 2 afternoon hours for offline critical strategy', 'Transition low priority tasks to operations heads', 'Conduct daily evening recovery breathing']
      };
      welcomeMessage = "Welcome, Priya! The fintech seed investor call is slated for 11:00 AM. Your pitch deck changes are currently set as your primary mission. Let's make this pitch highly compelling!";
    }

    // Save all to localStorage
    localStorage.setItem('lp_profile', JSON.stringify(newProfile));
    localStorage.setItem('lp_tasks', JSON.stringify(newTasks));
    localStorage.setItem('lp_habits', JSON.stringify(newHabits));
    localStorage.setItem('lp_goals', JSON.stringify(newGoals));
    localStorage.setItem('lp_commitments', JSON.stringify(newCommitments));
    localStorage.setItem('lp_roadmaps', JSON.stringify(newRoadmaps));
    localStorage.setItem('lp_calendar_events', JSON.stringify(newCalendarEvents));
    localStorage.setItem('lp_gamification', JSON.stringify(newGamification));
    localStorage.setItem('lp_statistics', JSON.stringify(newStatistics));
    localStorage.setItem('lp_persona_profile', JSON.stringify(newPersonaProfile));
    localStorage.removeItem('lp_panic');

    // Update state variables
    setProfile(newProfile);
    setTasks(newTasks);
    setHabits(newHabits);
    setGoals(newGoals);
    setCommitments(newCommitments);
    setRoadmaps(newRoadmaps);
    setCalendarEvents(newCalendarEvents);
    setGamification(newGamification);
    setStatistics(newStatistics);
    setPersonaProfile(newPersonaProfile);
    setPanicPlan(null);
    setActiveTab('dashboard');

    setMessages([
      {
        id: 'msg-demo-switch',
        sender: 'ai',
        text: welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    showToast(`Switched to Demo Persona: ${newProfile.name}`, 'success');
  };

  return (
    <AppContext.Provider value={{
      profile,
      tasks,
      habits,
      goals,
      commitments,
      roadmaps,
      panicPlan,
      activeTab,
      setActiveTab,
      messages,
      isAssistantOpen,
      setIsAssistantOpen,
      isRecording,
      setIsRecording,
      isAssistantLoading,
      theme,
      toggleTheme,
      
      onboardUser,
      resetOnboarding,
      addTask,
      updateTaskStatus,
      toggleSubtask,
      delayTask,
      addHabit,
      completeHabit,
      addGoal,
      toggleMilestone,
      addCommitment,
      payCommitment,
      deleteCommitment,
      updateCommitment,
      generateRoadmap,
      updateRoadmapStep,
      activatePanicMode,
      deactivatePanicMode,
      togglePanicStep,
      generateWeeklyReview,
      sendAssistantMessage,
      clearAssistantHistory,
      deleteHabit,
      deleteTask,
      rescheduleTask,
      updateGoalProgress,
      copilotMemory,
      setCopilotMemory,
      executeAssistantAction,
      updateMessageActionStatus,
      
      calendarEvents,
      generateCalendarSchedule,
      optimizeWeek,
      balanceWorkload,
      recoverLostTime,
      updateCalendarEvents,
      moveCalendarEvent,
      
      activeIntervention,
      closeIntervention,
      applyInterventionSuggestion,
      triggerIntervention,
      interventionHistory,
      addInterventionHistory,
      focusSessionsSkipped,
      setFocusSessionsSkipped,
      missedHabitCount,
      setMissedHabitCount,
      toast,
      showToast,
      hideToast,

      // Personalization Center states and actions
      settings,
      updateSettings,
      gamification,
      setGamification,
      addXP,
      userXP,
      setUserXP,
      level,
      setLevel,
      streak,
      setStreak,
      badges,
      setBadges,
      completedChallenges,
      setCompletedChallenges,
      recentAchievement,
      setRecentAchievement,
      statistics,
      incrementStat,
      personaProfile,
      updateProfile,
      updatePersonaProfile,
      generatePersonaInsights,
      weeklyCelebrationOpen,
      setWeeklyCelebrationOpen,
      switchDemoPersona
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
