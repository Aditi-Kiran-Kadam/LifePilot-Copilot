/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Student' | 'Professional' | 'Entrepreneur';

export interface UserProfile {
  name: string;
  role: UserRole;
  bio: string;
  strengths: string[];
  challenges: string[];
  coreGoals: string[];
  interests: string[];
  growthAreas: string[];
  recommendedSkills: string[];
  onboarded: boolean;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  complexity: 'Low' | 'Medium' | 'High';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'InProgress' | 'Done';
  subtasks: SubTask[];
  category: string;
  estimatedHours: number;
  scheduledDate?: string; // YYYY-MM-DD
  procrastinationCount: number; // For tracking delayed habits/tasks
}

export interface Habit {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  lastCompleted?: string; // YYYY-MM-DD
  completedToday?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number; // 0 - 100
  milestones: Milestone[];
  deadline: string; // YYYY-MM-DD
}

export interface Commitment {
  id: string;
  title: string; // acts as name
  amount: string;
  category: string; // Bills, Subscriptions, College Fees, etc.
  frequency: string; // Weekly, Monthly, Quarterly, etc.
  dueDate: string; // YYYY-MM-DD
  paidThisPeriod: boolean;
  lastPaidDate?: string;
  priority?: 'High' | 'Medium' | 'Low';
  autopayEnabled?: boolean;
  status?: 'Paid' | 'Unpaid' | 'Overdue';
  lateFeeEstimate?: number;
  snoozed?: boolean;
  // Upgraded behavioral & AI risk metrics
  pastBehaviorConsistency?: number; // 0-100%
  averageCompletionRate?: number; // 0-100%
  financialStressScore?: number; // 0-100%
  historyLog?: Array<{ date: string; status: 'Paid' | 'Late' | 'Missed'; amount: number }>;
  notes?: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  status: 'Pending' | 'InProgress' | 'Completed';
}

export interface RoadmapProject {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skillsCovered: string[];
}

export interface RoadmapPlacementReadiness {
  score: number;
  feedback: string;
  checks: Array<{ title: string; passed: boolean }>;
}

export interface RoadmapWeeklyPlan {
  week: number;
  focus: string;
  tasks: string[];
}

export interface Roadmap {
  id: string;
  topic: string;
  progress: number; // 0 - 100
  steps: RoadmapStep[];
  isCareerRoadmap?: boolean;
  timeline?: string;
  learningSchedule?: string;
  skills?: string[];
  suggestedHabits?: string[];
  certifications?: string[];
  badges?: string[];
  projects?: RoadmapProject[];
  placementReadiness?: RoadmapPlacementReadiness;
  weeklyPlan?: RoadmapWeeklyPlan[];
}

export interface PanicStep {
  hour: string; // e.g., "Hour 1", "9:00 AM - 10:00 AM"
  task: string;
  priority: 'Critical' | 'Skip' | 'Optimize';
  completed: boolean;
}

export interface PanicPlan {
  deadlineTitle: string;
  originalDeadline: string;
  hoursRemaining: number;
  steps: PanicStep[];
  active: boolean;
  panicScore?: number;
  recoveryProbability?: number;
  deadlinePressure?: 'Low' | 'Medium' | 'High' | 'Critical';
  suggestedMode?: string;
  situationAnalysis?: string;
  coachingTip?: string;
  microSteps?: string[];
  sacrifices?: Array<{ task: string; type: 'skip' | 'delay' | 'prioritize'; benefit: string; impact?: string }>;
  timeline?: Array<{ time: string; event: string }>;
  focusSessions?: Array<{ title: string; duration: number; type: 'sprint' | 'break' }>;
  rescheduledCount?: number;
  showMetricsAfterDeactivation?: boolean;
  savedMetrics?: {
    tasksSaved: number;
    hoursRecovered: number;
    deadlinesAvoided: number;
    stressReduction: string;
    recoverySuccess: number;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  effort: string; // "Low" | "Medium" | "High"
  deadline: string; // YYYY-MM-DD
  estimatedTime: string; // e.g. "2 hours"
  completionProbability: number; // e.g. 85 for 82% probability
  stressImpact: 'Low' | 'Medium' | 'High';
  energyLevel: 'Low' | 'Medium' | 'High';
  date: string; // YYYY-MM-DD
  start: string; // "14:00"
  end: string; // "16:00"
  category: 'Deep Work' | 'Study' | 'Coding' | 'Meetings' | 'Personal' | 'Exercise' | 'Learning' | 'Finance' | 'Commitments' | 'Break';
  color: 'Green' | 'Yellow' | 'Red' | 'Purple' | 'Blue';
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actions?: AppAction[];
  suggestions?: string[];
  actionStatus?: 'pending' | 'confirmed' | 'cancelled';
  actionFeedbacks?: string[];
}

export interface AppAction {
  type: 'ADD_TASK' | 'ADD_COMMITMENT' | 'ADD_GOAL' | 'ADD_HABIT' | 'ACTIVATE_PANIC' | 'GENERATE_ROADMAP' | 'DELETE_HABIT' | 'DELETE_TASK' | 'UPDATE_TASK_PROGRESS' | 'UPDATE_GOAL_PROGRESS' | 'RESCHEDULE_TASK' | 'START_FOCUS_MODE' | 'NAVIGATE_TAB' | 'GENERATE_CALENDAR_SCHEDULE' | 'OPTIMIZE_WEEK' | 'RECOVER_LOST_TIME';
  payload: any;
}

export interface InterventionHistoryItem {
  id: string;
  type: 'procrastination' | 'burnout' | 'momentum' | 'deadline';
  title: string;
  questionOrMessage: string;
  timestamp: string;
  status: 'Accepted' | 'Ignored';
  actionTaken?: string;
  impactMetrics?: string;
}

export interface PersonalizationSettings {
  themeMode: 'light' | 'dark' | 'system';
  themeStyle: 'Glass' | 'Minimal' | 'Gradient' | 'Academic' | 'Cyber' | 'Aurora' | 'Focus';
  accentColor: 'Blue' | 'Purple' | 'Green' | 'Orange' | 'Pink' | 'Teal' | 'Custom';
  customAccentHex?: string;
  animationsEnabled: boolean;
  reducedMotion: boolean;
  glassSettings?: {
    backdropBlur: string;
    transparentCards: string;
    glassShadows: 'soft' | 'none' | 'heavy';
    frostedPanels: boolean;
    animatedGradients: boolean;
  };
  aiPersonality: 'Mentor' | 'Coach' | 'Friend' | 'Professional Advisor' | 'Minimalist' | 'Motivator' | 'Teacher' | 'Companion';
  notifications: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    habitReminders: boolean;
    focusReminders: boolean;
    commitmentReminders: boolean;
    deadlineAlerts: boolean;
    aiCoachingNudges: boolean;
  };
}

export interface GamificationState {
  xp: number;
  level: number;
  badges: string[];
  achievements: Array<{ id: string; title: string; description: string; unlocked: boolean; unlockedAt?: string }>;
  streak: number;
}

export interface StatisticsState {
  tasksCompleted: number;
  hoursFocused: number;
  lessonsWatched: number;
  habitsMaintained: number;
  commitmentsPaid: number;
  goalsAchieved: number;
  focusSessionsCompleted: number;
  panicSessionsRecovered: number;
  pathwaysCompleted: number;
  nightOwlConsecutiveDays: number;
  tasksCompletedBeforeDeadline: number;
}

export interface PersonaProfileData {
  dynamicPersona: string;
  productivityArchetype: string;
  strengths: string[];
  growthOpportunities: string[];
  currentIdentity: string;
  suggestedImprovements: string[];
}



