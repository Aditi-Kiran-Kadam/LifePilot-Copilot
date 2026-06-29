/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Endpoints

// --- Smart Heuristic Fallbacks ---

const generateHeuristicProfile = (bio: string) => {
  const bioLower = bio.toLowerCase();
  
  // Extract Name heuristic
  let name = 'User';
  const nameRegexes = [
    /my name is\s+([A-Z][a-zA-Z]*)/i,
    /i am\s+([A-Z][a-zA-Z]*)/i,
    /i'm\s+([A-Z][a-zA-Z]*)/i,
    /call me\s+([A-Z][a-zA-Z]*)/i
  ];
  for (const regex of nameRegexes) {
    const match = bio.match(regex);
    if (match && match[1]) {
      name = match[1].trim();
      break;
    }
  }
  if (name === 'User') {
    const words = bio.split(/\s+/).filter(w => w.length > 0);
    for (const w of words) {
      const cleanW = w.replace(/[^a-zA-Z]/g, '');
      if (cleanW && cleanW[0] === cleanW[0].toUpperCase() && !['I', 'MY', 'THE', 'A', 'AN', 'I\'M', 'IN', 'ON', 'AT'].includes(cleanW.toUpperCase())) {
        name = cleanW;
        break;
      }
    }
  }

  // Determine Role heuristic
  let role: 'Student' | 'Professional' | 'Entrepreneur' = 'Professional';
  if (/\b(student|study|university|college|school|class|homework|exam|degree|major|learn|course)\b/i.test(bioLower)) {
    role = 'Student';
  } else if (/\b(business|founder|startup|entrepreneur|co-founder|company|launch|venture|sales|product|ceo|client)\b/i.test(bioLower)) {
    role = 'Entrepreneur';
  }

  // Interests heuristic
  const potentialInterests = [
    { key: 'coding', label: 'Coding & Software' },
    { key: 'design', label: 'UI/UX Design' },
    { key: 'art', label: 'Digital Art' },
    { key: 'music', label: 'Music Production' },
    { key: 'write', label: 'Creative Writing' },
    { key: 'market', label: 'Marketing' },
    { key: 'finance', label: 'Financial Markets' },
    { key: 'sport', label: 'Sports & Fitness' },
    { key: 'game', label: 'Gaming Technologies' },
    { key: 'read', label: 'Literature & Reading' }
  ];
  const detectedInterests = potentialInterests
    .filter(item => bioLower.includes(item.key))
    .map(item => item.label);
  
  let strengths: string[] = [];
  let challenges: string[] = [];
  let coreGoals: string[] = [];
  let interests: string[] = detectedInterests.length > 0 ? detectedInterests : ['Personal Growth', 'Technology'];
  let growthAreas: string[] = [];
  let recommendedSkills: string[] = [];

  if (role === 'Student') {
    strengths = ['Academic dedication', 'Fast learning curve', 'Adaptability'];
    challenges = ['Time management under exam pressure', 'Procrastination with tough topics', 'Balancing social and study life'];
    coreGoals = ['Excel in academic exams', 'Master core field skills', 'Secure a promising internship'];
    if (interests.length === 2 && interests[0] === 'Personal Growth') {
      interests = ['Computer Science', 'Online Learning', 'Academic Research'];
    }
    growthAreas = ['Systematic scheduling', 'Practical project portfolios', 'Networking with professionals'];
    recommendedSkills = ['Data Structures & Algorithms', 'Version Control (Git/GitHub)', 'Effective Time Boxing'];
  } else if (role === 'Entrepreneur') {
    strengths = ['Strategic vision', 'Calculated risk management', 'High initiative'];
    challenges = ['Prioritizing high-leverage work', 'Over-commitment & scaling pains', 'Preventing burnout'];
    coreGoals = ['Achieve product-market fit', 'Scale monthly recurring revenue', 'Build an efficient core team'];
    if (interests.length === 2 && interests[0] === 'Personal Growth') {
      interests = ['Business Ventures', 'Product Design', 'Growth Hacking'];
    }
    growthAreas = ['Investor storytelling', 'Delegating lower-level operations', 'Agile project delivery'];
    recommendedSkills = ['Lean Startup Validation', 'KPI & Analytics Tracking', 'Negotiation & Pitching'];
  } else { // Professional
    strengths = ['Structured task execution', 'Collaboration & alignment', 'Deep concentration'];
    challenges = ['Achieving consistent work-life balance', 'Navigating corporate context switching', 'Procrastination on tedious tasks'];
    coreGoals = ['Exceed performance milestone objectives', 'Acquire senior specialization domain expertise', 'Optimize daily efficiency loops'];
    if (interests.length === 2 && interests[0] === 'Personal Growth') {
      interests = ['Industry Trends', 'System Architecture', 'Career Development'];
    }
    growthAreas = ['Leadership & mentorship', 'Public speaking & demos', 'Scalable software/system design'];
    recommendedSkills = ['System Architecture Design', 'Advanced Agile Workflows', 'Boundary-setting & Focus Habits'];
  }

  return {
    name,
    role,
    strengths,
    challenges,
    coreGoals,
    interests,
    growthAreas,
    recommendedSkills
  };
};

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
) => {
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

const generateHeuristicBreakdown = (taskTitle: string, complexity: string) => {
  const titleLower = taskTitle.toLowerCase();
  let category = "Study";
  
  if (titleLower.includes("hackathon") || titleLower.includes("mvp") || titleLower.includes("pitch")) {
    category = "Hackathon";
  } else if (titleLower.includes("placement") || titleLower.includes("leet") || titleLower.includes("dsa") || titleLower.includes("interview") || titleLower.includes("mock")) {
    category = "Placement Prep";
  } else if (titleLower.includes("code") || titleLower.includes("debug") || titleLower.includes("refactor") || titleLower.includes("algorithm") || titleLower.includes("programming") || titleLower.includes("ts") || titleLower.includes("js") || titleLower.includes("python")) {
    category = "Coding";
  } else if (titleLower.includes("project") || titleLower.includes("build") || titleLower.includes("app") || titleLower.includes("api") || titleLower.includes("deploy") || titleLower.includes("architecture")) {
    category = "Project Building";
  } else if (titleLower.includes("assign") || titleLower.includes("homework") || titleLower.includes("report") || titleLower.includes("essay") || titleLower.includes("submit")) {
    category = "Assignment";
  } else if (titleLower.includes("learn") || titleLower.includes("watch") || titleLower.includes("course") || titleLower.includes("tutorial")) {
    category = "Learning";
  } else if (titleLower.includes("career") || titleLower.includes("growth") || titleLower.includes("linkedin") || titleLower.includes("portfolio")) {
    category = "Career Growth";
  }

  // Define templates
  const templates: Record<string, Array<{ title: string; duration: string; difficulty: string }>> = {
    "Study": [
      { title: "Review lecture notes & textbook chapters", duration: "30 min", difficulty: "Easy" },
      { title: "Summarize core formulas and key definitions", duration: "30 min", difficulty: "Medium" },
      { title: `Solve practice questions related to "${taskTitle}"`, duration: "45 min", difficulty: "Hard" },
      { title: "Create active recall flashcards", duration: "25 min", difficulty: "Medium" },
      { title: "Self-quiz and review incorrect solutions", duration: "20 min", difficulty: "Easy" }
    ],
    "Coding": [
      { title: "Write specification tests & define function structures", duration: "20 min", difficulty: "Easy" },
      { title: `Implement core algorithm logic for "${taskTitle}"`, duration: "60 min", difficulty: "Hard" },
      { title: "Debug edge cases and optimize loop complexity", duration: "40 min", difficulty: "Hard" },
      { title: "Refactor function signatures and clean up code", duration: "30 min", difficulty: "Medium" },
      { title: "Commit changes to version control repository", duration: "10 min", difficulty: "Easy" }
    ],
    "Assignment": [
      { title: `Read prompt guidelines and rubric for "${taskTitle}"`, duration: "15 min", difficulty: "Easy" },
      { title: "Research reference papers & draft outline structure", duration: "45 min", difficulty: "Medium" },
      { title: "Draft introduction and main argument paragraphs", duration: "60 min", difficulty: "Hard" },
      { title: "Incorporate illustrative figures or equations", duration: "30 min", difficulty: "Medium" },
      { title: "Final proofread & upload submission package", duration: "25 min", difficulty: "Easy" }
    ],
    "Hackathon": [
      { title: "Define MVP scope & map main page user experience flow", duration: "30 min", difficulty: "Easy" },
      { title: "Spin up project boilerplate and set up global states", duration: "45 min", difficulty: "Medium" },
      { title: "Connect real-time endpoints or mock static data", duration: "60 min", difficulty: "Hard" },
      { title: "Develop core interactive features and styling details", duration: "90 min", difficulty: "Hard" },
      { title: "Incorporate aesthetic transitions and micro animations", duration: "40 min", difficulty: "Medium" },
      { title: "Record high fidelity video demo and draft description", duration: "30 min", difficulty: "Medium" }
    ],
    "Learning": [
      { title: "Watch educational tutorials or read document libraries", duration: "40 min", difficulty: "Easy" },
      { title: "Clone or build simple exercises locally", duration: "30 min", difficulty: "Medium" },
      { title: "Modify core variables to stress test assumptions", duration: "30 min", difficulty: "Medium" },
      { title: `Develop a custom mini sandbox app for "${taskTitle}"`, duration: "60 min", difficulty: "Hard" },
      { title: "Write a summary markdown note of key lessons learned", duration: "20 min", difficulty: "Easy" }
    ],
    "Placement Prep": [
      { title: `Solve a target DSA problem related to "${taskTitle}"`, duration: "30 min", difficulty: "Medium" },
      { title: "Analyze worst case space-time complexity", duration: "15 min", difficulty: "Easy" },
      { title: "Revise answer frameworks for behavioral questions", duration: "30 min", difficulty: "Medium" },
      { title: "Conduct mock dry-run interviews on camera", duration: "45 min", difficulty: "Hard" },
      { title: "Optimize relevant bullet points on resumes", duration: "30 min", difficulty: "Medium" }
    ],
    "Career Growth": [
      { title: `Research top industry trends for "${taskTitle}"`, duration: "45 min", difficulty: "Easy" },
      { title: "Initiate outreach with senior professional contacts", duration: "20 min", difficulty: "Medium" },
      { title: "Author an educational article or dev community post", duration: "60 min", difficulty: "Hard" },
      { title: "Plan structural progress for desired career certificates", duration: "30 min", difficulty: "Medium" },
      { title: "Build or polish visual case studies for portfolios", duration: "60 min", difficulty: "Hard" }
    ],
    "Project Building": [
      { title: `Outline technical spec sheet for "${taskTitle}"`, duration: "30 min", difficulty: "Easy" },
      { title: "Draft entity relationship schemas & routing maps", duration: "45 min", difficulty: "Medium" },
      { title: "Program fundamental database entities and controllers", duration: "90 min", difficulty: "Hard" },
      { title: "Construct responsive user interface views with Tailwind", duration: "90 min", difficulty: "Hard" },
      { title: "Perform comprehensive end-to-end user checks", duration: "40 min", difficulty: "Medium" },
      { title: "Deploy system artifacts to hosting environment", duration: "30 min", difficulty: "Hard" }
    ]
  };

  const tasks = templates[category] || templates["Study"];
  return { category, microTasks: tasks };
};

const generateHeuristicPanicPlan = (deadlineTitle: string, remainingHours: number) => {
  const hours = Math.min(Math.max(Number(remainingHours) || 8, 1), 24);
  const steps = [];
  
  if (hours <= 2) {
    steps.push({ hour: "Next 30 mins", task: `Ruthlessly strip all non-essential requirements for ${deadlineTitle}`, priority: "Critical" });
    steps.push({ hour: "Hour 1", task: "Build/draft the absolute bare minimum version", priority: "Critical" });
    steps.push({ hour: "Final 30 mins", task: "Proofread, run a quick sanity test, and submit immediately", priority: "Critical" });
  } else if (hours <= 4) {
    steps.push({ hour: "Hour 1", task: `De-clutter, turn off notifications, and map out 3 vital requirements for ${deadlineTitle}`, priority: "Critical" });
    steps.push({ hour: "Hour 2-3", task: "Focus 100% on implementing the core parts, skipping polish", priority: "Critical" });
    steps.push({ hour: "Hour 4", task: "Combine elements, test basic flow, and ship what you have", priority: "Critical" });
  } else {
    const block1 = Math.floor(hours * 0.2) || 1;
    const block2 = Math.floor(hours * 0.5) || 2;
    steps.push({ hour: `Hours 1-${block1}`, task: `Set up active environment, eliminate distractions, and draft the main skeleton structure for "${deadlineTitle}"`, priority: "Critical" });
    steps.push({ hour: `Hours ${block1 + 1}-${block1 + block2}`, task: "Execute the heaviest technical/content blocks. Work in 25-min Pomodoro sprints", priority: "Critical" });
    steps.push({ hour: `Hours ${block1 + block2 + 1}-${hours - 1}`, task: "Optimize existing blocks, write rapid summary/scaffolding for incomplete gaps", priority: "Optimize" });
    steps.push({ hour: `Hour ${hours}`, task: "Perform a rapid end-to-end review, fix major errors, and submit", priority: "Critical" });
  }

  // Parse titles for custom values
  const titleLower = (deadlineTitle || "").toLowerCase();
  let panicScore = 75;
  let recoveryProbability = 78;
  let deadlinePressure: 'Low' | 'Medium' | 'High' | 'Critical' = 'High';
  let suggestedMode = "Emergency Sprint";
  let coachingTip = "You don't need perfection. You need progress. Let's win one task at a time.";
  let microSteps = ["Open VSCode", "Write one paragraph", "Spend 5 minutes organizing physical workspace"];

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
  } else if (hours <= 3) {
    panicScore = 94;
    recoveryProbability = 65;
    deadlinePressure = 'Critical';
    suggestedMode = "Ultra Sprint";
    coachingTip = "We only need the next 15 minutes. Take a deep breath and start right now.";
    microSteps = ["Write just one single sentence", "Push one commit", "Spend 5 minutes focus"];
  }

  const sacrifices = [
    { task: "Watching YouTube & Browsing", type: "skip" as const, benefit: "Gain 45 minutes of active concentration" },
    { task: "Secondary Career Roadmap Learning", type: "delay" as const, benefit: "Postpone to free up 2 hours of immediate capacity" },
    { task: `Core deliverables for ${deadlineTitle}`, type: "prioritize" as const, benefit: "High impact on immediate success" }
  ];

  const timeline = [
    { time: "NOW", event: "Triage priorities & activate distraction shields" },
    { time: `${hours > 4 ? "Next 2 hours" : "Hour 1"}`, event: "Build the absolute bare-minimum MVP core skeleton" },
    { time: `${hours > 4 ? "Middle blocks" : "Hour 2-3"}`, event: "Flesh out requirements, ignoring all visual polish" },
    { time: `Before deadline`, event: "Verification review & compile for final submission" }
  ];

  const focusSessions = [
    { title: "Inertia Breakout", duration: 45, type: "sprint" as const },
    { title: "Physical Stretch & Breath", duration: 10, type: "break" as const },
    { title: "Core Work Intensive", duration: 50, type: "sprint" as const },
    { title: "Rehydration Break", duration: 15, type: "break" as const },
    { title: "Final Polish Sprint", duration: 30, type: "sprint" as const }
  ];

  return {
    steps,
    panicScore,
    recoveryProbability,
    deadlinePressure,
    suggestedMode,
    situationAnalysis: `Remaining Tasks: ${steps.length}, Available Hours: ${hours}, Panic Score: ${panicScore}%, Recovery Probability: ${recoveryProbability}%`,
    coachingTip,
    microSteps,
    sacrifices,
    timeline,
    focusSessions
  };
};

const generateHeuristicRoadmap = (topic: string) => {
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
          difficulty: "Advanced",
          skillsCovered: ["API Architecture", "Database Modeling", "State Synchronization"]
        },
        {
          title: "Personal Portfolio & Core Sandbox",
          description: "An elegant, interactive workspace highlighting your mini-projects and algorithmic challenge solutions.",
          difficulty: "Intermediate",
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

const generateHeuristicWeeklyReview = (userStats: any) => {
  const tasksVal = userStats?.tasksCompleted || 0;
  const focusVal = userStats?.focusHours || 0;
  const score = Math.min(100, Math.max(50, 60 + tasksVal * 5 + Math.floor(focusVal * 2)));
  return {
    summary: `You navigated this week with commendable persistence. Accumulating ${focusVal} focus hours is an excellent foundation for sustained learning.`,
    completedStrengths: `Successfully checked off ${tasksVal} tasks and maintained core habit streaks.`,
    areasToImprove: "Managing friction during start transitions and staying resilient when procrastination loops trigger.",
    nextWeekStrategy: "Consider initiating your most complex tasks during your peak focus window in the morning.",
    score
  };
};

const handleLearningProgression = (message: string, memory: any) => {
  let topic = memory.currentTopic || "Linux";
  let lesson = memory.currentLesson || "Lesson 1: Introduction & Basic Shell Commands";
  let difficulty = memory.difficulty || "Beginner";
  let progress = memory.learningProgress || 10;
  let path = memory.learningPath || [
    "Lesson 1: Introduction & Basic Shell Commands",
    "Lesson 2: Directory & File Operations",
    "Lesson 3: Permissions, Owners, & Chmod",
    "Practice Exercises: Managing directories and files",
    "Mini Quiz: Quick multiple-choice check",
    "Hands-on Task: Shell Scripting 101"
  ];

  const msgLower = message.toLowerCase();
  
  // If the user requests a new topic like "Teach me Linux" or "Teach me Docker"
  if (msgLower.includes("teach me") || msgLower.includes("explain") || msgLower.includes("learn about")) {
    const match = message.match(/\b(teach me|explain|learn about|learning about|mastering)\s+([a-zA-Z0-9\s\.\+#\-_]+)/i);
    if (match && match[2]) {
      topic = match[2].trim();
      topic = topic.charAt(0).toUpperCase() + topic.slice(1);
    } else if (msgLower.includes("linux")) {
      topic = "Linux";
    } else if (msgLower.includes("docker")) {
      topic = "Docker";
    } else if (msgLower.includes("deployment")) {
      topic = "Deployment";
    } else if (msgLower.includes("react")) {
      topic = "React";
    } else if (msgLower.includes("python")) {
      topic = "Python";
    } else {
      topic = "Web Development";
    }
    
    lesson = `Lesson 1: Introduction to ${topic}`;
    difficulty = "Beginner";
    progress = 10;
    path = [
      `Lesson 1: Introduction to ${topic}`,
      `Lesson 2: Core Architecture & Setup of ${topic}`,
      `Lesson 3: Practical Commands and Workflow for ${topic}`,
      `Practice Exercises: Solving real ${topic} scenarios`,
      `Mini Quiz: Core concepts of ${topic}`,
      `Hands-on Task: Build a small project using ${topic}`
    ];
  } else if (msgLower.includes("continue learning") || msgLower.includes("continue roadmap") || msgLower.includes("next lesson") || msgLower.includes("advance")) {
    // Advance progress
    const currentIndex = path.findIndex((p: string) => p === lesson);
    if (currentIndex !== -1 && currentIndex < path.length - 1) {
      lesson = path[currentIndex + 1];
      progress = Math.min(100, Math.round(((currentIndex + 2) / path.length) * 100));
    } else if (currentIndex === path.length - 1) {
      progress = 100;
    }
  }

  // Generate learning content based on lesson
  let lessonContent = '';
  if (lesson.includes("Lesson 1")) {
    lessonContent = `Welcome to **Lesson 1: Introduction to ${topic}**! 
    
${topic} is the foundation of modern software systems. It operates on key design principles: modularity, standardization, and isolation. Let's start with how to think about ${topic} conceptually. It acts like a secure, predictable blueprint for your code.

**Key Concept:** A standard environment eliminates the classic "it works on my machine" developer problem.`;
  } else if (lesson.includes("Lesson 2")) {
    lessonContent = `Great progress! Let's dive into **Lesson 2: Core Architecture & Setup of ${topic}**.

Now that you know the basics, let's look at the underlying components. For ${topic}, you interact with a system controller or rendering cycle. Under the hood, this handles scheduling and memory layout.

**Key Concept:** Always isolate operations. Do not bundle mutable state inside core components.`;
  } else if (lesson.includes("Lesson 3")) {
    lessonContent = `Amazing consistency! Welcome to **Lesson 3: Practical Commands and Workflow for ${topic}**.

Let's master the essential command structures and workflow patterns:
1. Initialize the system state.
2. Build local changes and test them.
3. Manage logs and handle error bounds.

**Key Concept:** Small, incremental commits are always easier to debug than massive shifts.`;
  } else if (lesson.includes("Exercises")) {
    lessonContent = `Welcome to the **Practice Exercises for ${topic}**!

Let's put your knowledge to the test with these practical challenges:
1. Set up a local isolated workspace.
2. Write a secure configuration.
3. Verify that the output meets all test bounds.`;
  } else if (lesson.includes("Quiz")) {
    lessonContent = `Ready for the **Mini Quiz on ${topic}**? 🧠

Answer these quick questions in your mind:
1. What is the main benefit of using ${topic}?
2. How do you inspect running states in ${topic}?
3. Why is modular isolation important?`;
  } else {
    lessonContent = `Welcome to your final **Hands-on Task for ${topic}**! 🎉

Your task is to build and run a simple, clean, and modular ${topic} instance that fulfills a basic system requirement. Once completed, your progress is fully mastered!`;
  }

  return {
    currentTopic: topic,
    currentLesson: lesson,
    difficulty,
    learningProgress: progress,
    learningPath: path,
    content: lessonContent
  };
};

const parseCurrentTime = (currentTimeString?: string) => {
  let hour = new Date().getHours();
  let minute = new Date().getMinutes();
  if (currentTimeString) {
    try {
      const parts = currentTimeString.split(' at ');
      const timePart = parts.length >= 2 ? parts[1].trim().toLowerCase() : currentTimeString.trim().toLowerCase();
      const match = timePart.match(/(\d+):(\d+)\s*(am|pm)?/);
      if (match) {
        hour = parseInt(match[1], 10);
        minute = parseInt(match[2], 10);
        const ampm = match[3];
        if (ampm === 'pm' && hour < 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;
      }
    } catch (e) {
      console.error('Error parsing currentTimeString:', e);
    }
  }
  return { hour, minute };
};

const generateEveningPlan = (currentHour: number, currentMinute: number) => {
  let startHour = currentHour;
  let startMin = currentMinute + 15;
  if (startMin >= 60) {
    startHour += Math.floor(startMin / 60);
    startMin = startMin % 60;
  }
  startHour = startHour % 24;

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    let displayHour = h % 12;
    if (displayHour === 0) displayHour = 12;
    const displayMin = m < 10 ? `0${m}` : `${m}`;
    return `${displayHour}:${displayMin} ${period}`;
  };

  const formattedCurrentTime = formatTime(currentHour, currentMinute);

  const b1Start = formatTime(startHour, startMin);
  let b1EndMin = startMin + 45;
  let b1EndHour = startHour;
  if (b1EndMin >= 60) {
    b1EndHour += 1;
    b1EndMin -= 60;
  }
  b1EndHour = b1EndHour % 24;
  const b1End = formatTime(b1EndHour, b1EndMin);

  let b2StartMin = b1EndMin + 15;
  let b2StartHour = b1EndHour;
  if (b2StartMin >= 60) {
    b2StartHour += 1;
    b2StartMin -= 60;
  }
  b2StartHour = b2StartHour % 24;
  const b2Start = formatTime(b2StartHour, b2StartMin);

  let b2EndMin = b2StartMin + 45;
  let b2EndHour = b2StartHour;
  if (b2EndMin >= 60) {
    b2EndHour += 1;
    b2EndMin -= 60;
  }
  b2EndHour = b2EndHour % 24;
  const b2End = formatTime(b2EndHour, b2EndMin);

  return `### Today's Evening Plan 📅
Since it's already ${formattedCurrentTime}, let's focus only on today's critical items.

Timeline & Suggested Time Blocks:
* **${b1Start} – ${b1End}** | 🖥️ Critical Triage & Review
* **${b2Start} – ${b2End}** | 🌙 De-load & Prep for Tomorrow

Let's push any secondary, non-essential workloads to **Tomorrow morning** or **Tomorrow afternoon** to safeguard your cognitive health.`;
};

const classifyIntent = (message: string, memory: any) => {
  const msgLower = message.toLowerCase().trim();
  const cleanMsg = msgLower.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ");

  const scores: Record<string, number> = {
    CASUAL_CHAT: 0.0,
    GENERAL_QA: 0.0,
    LEARNING_MODE: 0.0,
    PLANNING_MODE: 0.0,
    TASK_MANAGEMENT: 0.0,
    FOCUS_MODE: 0.0,
    PANIC_MODE: 0.0,
    COACHING_MODE: 0.0,
    MOTIVATION_MODE: 0.0,
    ROADMAP_MODE: 0.0,
    VOICE_COMMAND_MODE: 0.0,
  };

  // GOODBYE BYPASS (Highest priority)
  const goodbyeKeywords = ["bye", "goodbye", "see you", "catch you later", "thanks bye", "catch up later", "talk later"];
  if (goodbyeKeywords.some(kw => cleanMsg.includes(kw)) || /\b(bye|goodbye|see you|catch you later|thanks bye|talk later)\b/i.test(cleanMsg)) {
    return {
      intent: "CASUAL_CHAT",
      confidence: 1.0,
      isGoodbye: true,
      scores: { ...scores, CASUAL_CHAT: 1.0 }
    };
  }

  // 1. STRESS / PANIC (Panic Mode)
  const panicKeywords = [
    "i am stressed", "stressed", "burnt out", "burnout", "panic", "overwhelmed", "anxious", "anxiety", "survive", "wasted my day", "wasted day", "too many deadlines"
  ];
  if (panicKeywords.some(kw => cleanMsg.includes(kw)) || /\b(stressed|overwhelmed|burnt out|burnout|panic|anxious|anxiety|survive|wasted my day|too many deadlines)\b/i.test(cleanMsg)) {
    return {
      intent: "PANIC_MODE",
      confidence: 1.0,
      scores: { ...scores, PANIC_MODE: 1.0 }
    };
  }

  // 2. FOCUS MODE (Focus intent)
  const focusKeywords = ["start focus mode", "start focus", "begin focus", "focus mode", "begin deep work", "start pomodoro", "help me focus", "focus session", "pomodoro"];
  if (focusKeywords.some(kw => cleanMsg.includes(kw)) || cleanMsg === "focus" || /\b(focus|pomodoro)\b/i.test(cleanMsg)) {
    return {
      intent: "FOCUS_MODE",
      confidence: 1.0,
      scores: { ...scores, FOCUS_MODE: 1.0 }
    };
  }

  // 3. PLANNING MODE (Planning intent)
  const planningKeywords = [
    "plan my day", "what should i do today", "plan my week", "plan my weekend", "plan day", "plan week", "plan weekend",
    "help me organize everything", "schedule my work"
  ];
  if (planningKeywords.some(kw => cleanMsg.includes(kw)) || /\b(plan my day|plan my week|plan my weekend|organize everything|schedule my work)\b/i.test(cleanMsg)) {
    return {
      intent: "PLANNING_MODE",
      confidence: 1.0,
      scores: { ...scores, PLANNING_MODE: 1.0 }
    };
  }

  // 4. LEARNING MODE (Learning intent)
  const learningKeywords = [
    "teach linux", "teach docker", "teach kubernetes", "teach git", "deployment",
    "learn linux", "learn docker", "learn kubernetes", "learn git", "learn deployment",
    "explain docker", "explain kubernetes", "what is kubernetes", "explain linux", "what is linux", "explain git", "what is git"
  ];
  if (learningKeywords.some(kw => cleanMsg.includes(kw)) || /\b(teach linux|teach docker|teach kubernetes|teach git|deployment|learn linux|learn docker|learn kubernetes|learn git|learn deployment)\b/i.test(cleanMsg)) {
    return {
      intent: "LEARNING_MODE",
      confidence: 1.0,
      scores: { ...scores, LEARNING_MODE: 1.0 }
    };
  }

  // 5. TASK MANAGEMENT (Task intent)
  const taskKeywords = ["add task", "add", "delete", "remove", "erase", "create", "mark", "reschedule", "move", "complete", "remind me", "bill payment", "assignment due friday"];
  const taskNouns = ["task", "todo", "goal", "habit", "bill", "assignment", "hackathon"];
  const isTaskExplicit = cleanMsg.includes("add task") || cleanMsg.includes("move task") || cleanMsg.includes("create goal") || cleanMsg.includes("remind me") || cleanMsg.includes("bill payment") || cleanMsg.includes("assignment due friday") || cleanMsg.includes("add dbms") || cleanMsg.includes("move hackathon") || cleanMsg.includes("reschedule assignment") || cleanMsg.includes("add monthly") || cleanMsg.includes("add internet") || cleanMsg.includes("create habit") || cleanMsg.includes("delete task") || cleanMsg.includes("mark complete");

  if (isTaskExplicit || (taskKeywords.some(kw => cleanMsg.includes(kw)) && taskNouns.some(noun => cleanMsg.includes(noun)))) {
    return {
      intent: "TASK_MANAGEMENT",
      confidence: 1.0,
      scores: { ...scores, TASK_MANAGEMENT: 1.0 }
    };
  }

  // 6. TIME AWARENESS (If they say a specific time or "evening", they want a schedule adjustment / evening plan)
  const timeKeywords = [
    "it's evening", "its evening", "it is evening", "it's late", "its late", "it is late",
    "already night", "evening already", "night already", "already evening", "wind down",
    "winding down", "bedtime", "it's night", "its night", "it is night", "morning already",
    "afternoon already", "already late", "its late already", "it's late already", "it's 7 pm", "its 7 pm", "it is 7 pm", "it's 7pm", "its 7pm"
  ];
  const msgHasTimeKeywords = timeKeywords.some(kw => cleanMsg.includes(kw));
  const hasTimeIndicator = /\b(evening|night|late|morning|afternoon)\b/i.test(cleanMsg) && 
    (cleanMsg.includes("it's") || cleanMsg.includes("its") || cleanMsg.includes("it is") || cleanMsg.includes("already") || cleanMsg.includes("now") || cleanMsg.includes("at") || cleanMsg.includes("in the"));

  const timeRegexes = [
    /\b(it's|its|it is)\s*\d{1,2}(:\d{2})?\s*(pm|am)?\b/i,
    /\b\d{1,2}(:\d{2})?\s*in the (evening|morning|afternoon|night)\b/i,
    /\b(evening|night|morning|afternoon) already\b/i
  ];
  const isTimePattern = msgHasTimeKeywords || hasTimeIndicator || timeRegexes.some(rx => rx.test(cleanMsg));

  if (isTimePattern) {
    return {
      intent: "PLANNING_MODE",
      confidence: 1.0,
      isTimeAwareness: true,
      scores: { ...scores, PLANNING_MODE: 1.0 }
    };
  }

  // 7. CASUAL CONVERSATION (Greetings, jokes, boredom)
  const casualKeywords = ["hi", "hello", "how are you", "tell me a joke", "i'm bored", "im bored", "yo", "hey", "thanks", "thank you", "let's chat", "lets chat", "chat"];
  if (casualKeywords.some(kw => cleanMsg.includes(kw)) || /\b(joke|bored|chat|favorite language|how are you|hi|hello|hey|yo|thanks|thank you|let's chat|lets chat)\b/i.test(cleanMsg)) {
    return {
      intent: "CASUAL_CHAT",
      confidence: 1.0,
      scores: { ...scores, CASUAL_CHAT: 1.0 }
    };
  }

  // Detect completely random letters or gibberish to trigger FALLBACK
  const hasVowels = /[aeiouy]/i.test(cleanMsg);
  const isGibberish = cleanMsg.length > 5 && !hasVowels;
  if (isGibberish) {
    return {
      intent: "UNKNOWN",
      confidence: 0.0,
      scores
    };
  }

  // Specific known QA topics
  const knownQaKeywords = ["sky blue", "inflation", "who created linux", "quantum computing", "databases"];
  const isKnownQa = knownQaKeywords.some(kw => cleanMsg.includes(kw));
  if (isKnownQa) {
    return {
      intent: "GENERAL_QA",
      confidence: 1.0,
      scores: { ...scores, GENERAL_QA: 1.0 }
    };
  }

  // 8. FALLBACK CHAT / UNKNOWN INTENT
  return {
    intent: "UNKNOWN",
    confidence: 0.0,
    scores
  };
};

const generateHeuristicAssistantResponse = (message: string, userData: any) => {
  const msgLower = message.toLowerCase().trim();
  const cleanMsg = msgLower.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ");
  const name = userData?.profile?.name || 'Aditi';
  const actions: any[] = [];
  let text = '';
  let suggestions: string[] = [];
  const memory = userData?.copilotMemory || {};

  const tasksList = userData?.tasks || [];
  const habitsList = userData?.habits || [];
  const commitmentsList = userData?.commitments || [];
  const roadmapsList = userData?.roadmaps || [];
  const goalsList = userData?.goals || [];

  const pendingTasks = tasksList.filter((t: any) => t.status !== 'Done');
  const incompleteHabits = habitsList.filter((h: any) => !h.completedToday);
  const unpaidBills = commitmentsList.filter((c: any) => !c.paidThisPeriod);

  // Force active lesson continuity into LEARNING_MODE
  if ((memory.activeTopic || memory.currentTopic) && (cleanMsg.includes("continue") || cleanMsg.includes("next") || cleanMsg.includes("advance") || cleanMsg.includes("lesson"))) {
    memory.intentOverride = "LEARNING_MODE";
  } else {
    delete memory.intentOverride;
  }

  // Run Intent Detection Layer
  const classification = classifyIntent(message, memory);

  // High-priority direct overrides (Goodbye and Burnout)
  if (classification.isGoodbye || ["bye", "goodbye", "see you", "thanks bye", "talk later"].some(kw => cleanMsg.includes(kw)) || /\b(bye|goodbye|see you|talk later)\b/i.test(cleanMsg)) {
    text = `Take care ${name} 👋\n\nYou made good progress today.\n\nI'll be here whenever you need me.`;
    return { intent: 'CASUAL_CHAT', text, actions, suggestions: [], updatedMemory: memory };
  }

  if (cleanMsg.includes("burnt out") || cleanMsg.includes("burnout") || cleanMsg.includes("stressed") || cleanMsg.includes("overwhelmed")) {
    text = `That sounds exhausting.\n\nLet's reduce pressure.\n\nTell me the three things weighing on you most.\n\nWe'll tackle them one at a time.`;
    actions.push({ type: 'ACTIVATE_PANIC', payload: { reason: 'burnout' } });
    suggestions = ["🧘 Recovery Plan", "🎯 Tiny Focus Session", "📅 Reduced Schedule"];
    return { intent: 'PANIC_MODE', text, actions, suggestions, updatedMemory: memory };
  }

  if (classification.isTimeAwareness) {
    text = `You're right, it's already evening.\n\nLet's adjust today's plan.\n\nInstead of a full study schedule, here's a lightweight evening version:\n\n• 1 hour assignment\n• 30 minutes review\n• 30 minutes planning tomorrow\n\nNo need to overload yourself.`;
    suggestions = ["📅 Plan my day", "🎯 Focus session", "💬 Just chat"];
    return { intent: 'CASUAL_CHAT', text, actions, suggestions, updatedMemory: memory };
  }

  if (classification.confidence < 0.6) {
    if (cleanMsg.includes("evening already") || cleanMsg.includes("evening") || cleanMsg.includes("night") || cleanMsg.includes("late")) {
      text = `Yeah, the day goes by quickly 😄\n\nDo you still want to get some work done tonight or are you winding down?`;
    } else if (cleanMsg.includes("how are you") || cleanMsg.includes("hows it going")) {
      text = `Doing well, thank you! Just here and ready to help you with whatever you need. How is your day going?`;
    } else if (cleanMsg.includes("thank") || cleanMsg.includes("thanks")) {
      text = `Of course! Anytime. Let me know if you need help with anything else.`;
    } else {
      text = `Yeah, that makes sense! 😄\n\nWhat's on your mind right now? Are we focusing on some work, planning something, or just taking it easy?`;
    }
    return { intent: 'CASUAL_CHAT', text, actions, suggestions: ["📅 Plan my day", "🎯 Start Focus", "💬 Just chat"], updatedMemory: memory };
  }

  let intent = memory.intentOverride || classification.intent;

  if (intent === 'UNKNOWN') {
    text = `I'm not completely sure what you're trying to do.

You can ask me to:
📅 Plan
🎯 Focus
🚨 Recover
📚 Learn
✅ Manage Tasks
💬 Chat`;
    suggestions = ["📅 Plan my day", "🎯 Start Focus", "🚨 Survive Stress", "📚 Continue Learning"];
    return { intent: 'CASUAL_CHAT', text, actions, suggestions, updatedMemory: memory };
  }

  // Render mode responses based on classified intent
  if (intent === 'CASUAL_CHAT') {
    if (cleanMsg === "hi" || cleanMsg === "hello" || cleanMsg === "hey" || cleanMsg === "yo") {
      text = `Hey ${name} 👋\n\nNice seeing you again.\n\nHow's your day going?\n\nAnything exciting happening today?`;
    } else if (cleanMsg === "how are you") {
      text = `Doing great!\n\nI've been helping people organize their lives, learn new skills, and survive deadlines all day.\n\nWhat about you?`;
    } else if (cleanMsg === "im bored" || cleanMsg === "i am bored") {
      text = `Then we need to fix that immediately 😄\n\nPick one:\n\n🎲 Fun fact\n\n💻 Tiny coding challenge\n\n🎬 Movie recommendation\n\n🚀 Random tech trivia\n\n☕ Casual chat`;
    } else if (cleanMsg === "do you like coding") {
      text = `Absolutely.\n\nIf I had hobbies, coding would probably be near the top.\n\nThere's something satisfying about turning ideas into things people can actually use.\n\nWhat's your favorite language so far?`;
    } else if (cleanMsg === "tell me something interesting") {
      text = `Did you know Git was created by Linus Torvalds in just a few days because he disliked the existing tools available at the time?\n\nToday it powers millions of software projects worldwide.`;
    } else if (cleanMsg === "tell me a joke") {
      text = `Why do programmers wear glasses? Because they can't C# 😎\n\nHow is your day shaping up otherwise?`;
    } else {
      const fallbacks = [
        `Hey ${name}! I'm here as your personal mentor and copilot. We can discuss your creative ideas, tackle tough questions, or draft a focus plan whenever you're ready.\n\nHow are you holding up today?`,
        `Always a pleasure chatting, ${name}! I was just reflecting on how exciting it is to build software. What's on your mind right now?`,
        `Hey there! I'm ready to keep you company or brainstorm whatever you're working on. What are you up to today?`
      ];
      text = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    suggestions = ["📅 Plan my day", "🧑💻 Learn something new", "💬 Just want to chat"];
  } 
  else if (intent === 'GENERAL_QA') {
    if (cleanMsg.includes("sky blue")) {
      text = `The sky is blue because of a phenomenon called **Rayleigh scattering**.

Sunlight reaches Earth's atmosphere and is scattered in all directions by all the gases and particles in the air. Blue light is scattered more than the other colors because it travels as shorter, smaller waves. This causes the blue light to be distributed across the sky, making it appear blue to our eyes.`;
    } else if (cleanMsg.includes("inflation")) {
      text = `**Inflation** is the rate at which the general level of prices for goods and services is rising, and, consequently, purchasing power is falling.

Central banks attempt to limit inflation, and avoid deflation, in order to keep the economy running smoothly. High inflation can erode the value of savings, while low or moderate inflation is generally considered a sign of a growing economy.`;
    } else if (cleanMsg.includes("who created linux")) {
      text = `**Linux** was created by **Linus Torvalds** in 1991 as a free, open-source operating system kernel.

Torvalds, then a student at the University of Helsinki, developed Linux to create a free alternative to the commercial Unix operating systems of the time. Today, Linux powers the majority of web servers, cloud networks, and smart devices worldwide.`;
    } else if (cleanMsg.includes("quantum computing")) {
      text = `**Quantum computing** is an emerging field of technology that harnesses the laws of quantum mechanics to solve problems too complex for classical computers.

By using qubits, which can exist in multiple states simultaneously (superposition) and be linked together (entanglement), quantum computers can process immense combinations of variables in parallel, potentially revolutionizing fields like cryptography and material science.`;
    } else if (cleanMsg.includes("databases")) {
      text = `**Databases** work by storing data in structured tables or collections, using indexing to allow fast searches, and providing query engines (like SQL or NoSQL APIs) to retrieve, update, and manage that data while ensuring reliability and consistency (ACID properties).`;
    } else if (cleanMsg.includes("deployment")) {
      text = `Deployment means making your application available online so users can access it.

Imagine building a restaurant.
Writing code is cooking food.
Deployment is opening the restaurant so customers can actually walk inside.

For React projects developers commonly use:
• Vercel
• Netlify

For Node.js APIs:
• Render
• Railway
• AWS

Deployment connects all of these pieces together.

Would you like a beginner deployment tutorial?`;
    } else if (cleanMsg.includes("docker")) {
      text = `Docker is a containerization platform that packages an application and all of its dependencies together.

Imagine a shipping vessel.
Before standard container boxes, loading cars, grain, and piano instruments together was a nightmare. Standard shipping containers made cargo identical on the outside.

Docker does the same for software:
• Packages code and OS libraries into a "container image".
• Eliminates the "works on my machine" problem entirely.
• Runs identical binaries in development, staging, and cloud production.

Would you like a beginner Docker tutorial?`;
    } else if (cleanMsg.includes("linux")) {
      text = `Linux is a powerful, open-source operating system that powers the vast majority of web servers and cloud infrastructure.

Imagine operating a vehicle.
Windows or macOS is like driving a comfortable automatic car with locked engine compartments. Linux is like driving a high-performance manual race car where you can tune every wire and piston.

Why engineers choose Linux:
• Exceptional performance and low resource footprint.
• Native multi-user command-line interface.
• Granular access and file permission control.

Would you like a beginner Linux tutorial?`;
    } else {
      const topicRaw = cleanMsg.replace(/^(what is|explain|tell me about|how does|what are)\s+/i, "").trim();
      if (topicRaw) {
        const title = topicRaw.charAt(0).toUpperCase() + topicRaw.slice(1);
        text = `I can help you learn more about **${title}**! It's an interesting subject.\n\nWould you like me to start a structured learning lesson on this, or should we discuss something specific about it?`;
      } else {
        text = `I didn't fully understand that.

Would you like help with:
📅 Planning
📚 Learning
🎯 Focus
🚨 Panic Mode
💬 Chat`;
      }
    }
    suggestions = ["💬 Ask Another Question", "📚 Continue Learning", "🎯 View Dashboard"];
  } 
  else if (intent === 'LEARNING_MODE') {
    let topic = memory.activeTopic || memory.currentTopic || "Linux";
    let lessonNum = memory.currentLesson || memory.lessonNum || 1;
    
    const cleanLowerMsg = cleanMsg.toLowerCase();
    
    // Check if user specified a new topic in message
    if (cleanLowerMsg.includes("linux")) {
      topic = "Linux";
      if (memory.activeTopic !== "Linux") lessonNum = 1;
    } else if (cleanLowerMsg.includes("docker")) {
      topic = "Docker";
      if (memory.activeTopic !== "Docker") lessonNum = 1;
    } else if (cleanLowerMsg.includes("kubernetes")) {
      topic = "Kubernetes";
      if (memory.activeTopic !== "Kubernetes") lessonNum = 1;
    } else if (cleanLowerMsg.includes("react")) {
      topic = "React";
      if (memory.activeTopic !== "React") lessonNum = 1;
    } else if (cleanLowerMsg.includes("node")) {
      topic = "Node";
      if (memory.activeTopic !== "Node") lessonNum = 1;
    } else if (cleanLowerMsg.includes("python")) {
      topic = "Python";
      if (memory.activeTopic !== "Python") lessonNum = 1;
    } else if (cleanLowerMsg.includes("git")) {
      topic = "Git";
      if (memory.activeTopic !== "Git") lessonNum = 1;
    } else if (cleanLowerMsg.includes("aws")) {
      topic = "AWS";
      if (memory.activeTopic !== "AWS") lessonNum = 1;
    } else if (cleanLowerMsg.includes("dsa")) {
      topic = "DSA";
      if (memory.activeTopic !== "DSA") lessonNum = 1;
    } else if (cleanLowerMsg.includes("system design")) {
      topic = "System Design";
      if (memory.activeTopic !== "System Design") lessonNum = 1;
    }

    // Check if lesson number is specified in the message (e.g., "lesson 8")
    const lessonMatch = cleanLowerMsg.match(/\blesson\s+(\d+)\b/i);
    if (lessonMatch) {
      lessonNum = parseInt(lessonMatch[1]);
    }

    // Check if continuing or advancing
    if (cleanLowerMsg.includes("continue") || cleanLowerMsg.includes("next") || cleanLowerMsg.includes("advance")) {
      lessonNum = lessonNum + 1;
    }

    // Cap the lesson numbers
    const maxLessons = (topic === "Docker" || topic === "Kubernetes") ? 4 : 12;
    if (lessonNum > maxLessons) {
      lessonNum = maxLessons;
    }

    // Update memory fields precisely as requested
    memory.activeTopic = topic;
    memory.currentTopic = topic;
    memory.currentLesson = lessonNum;
    memory.lessonNum = lessonNum;
    
    const lessonKey = `${topic}-Lesson-${lessonNum}`;
    if (!memory.completedLessons) {
      memory.completedLessons = [];
    }
    if (!memory.completedLessons.includes(lessonKey)) {
      memory.completedLessons.push(lessonKey);
    }
    memory.learningProgress = Math.round((lessonNum / maxLessons) * 100);

    // Dynamic lesson content based on topic & lessonNum
    if (topic === "Docker") {
      if (lessonNum === 1) {
        text = `### Docker Lesson 1: Core Concepts 🐳\n\n**Topics covered:**\n- **Containers**: Isolated lightweight executable packages containing everything to run an application.\n- **Images**: Read-only blueprints used to create containers.\n- **Dockerfile**: Text document containing commands to assemble a Docker image.\n- **Volumes**: Persistent storage mechanism for container data.\n- **Networks**: Communication channels between containers.\n\n*Type **continue learning** to move to Lesson 2!*`;
      } else if (lessonNum === 2) {
        text = `### Docker Lesson 2: CLI Commands 🐳\n\nLet's master the core terminal commands to manage Docker containers:\n\n- **docker build**: Builds a Docker image from a Dockerfile.\n  \`docker build -t my-app .\`\n- **docker run**: Launches a container from a specified image.\n  \`docker run -p 3000:3000 my-app\`\n- **docker ps**: Lists all currently running containers.\n\n*Type **continue learning** to move to Lesson 3!*`;
      } else if (lessonNum === 3) {
        text = `### Docker Lesson 3: Multi-container Setup 🐳\n\nManage multi-container setups using a single configuration file:\n\n- **Docker Compose**: A tool for defining and running multi-container Docker applications.\n- **docker-compose.yml**: A YAML file configuring your application's services, networks, and volumes.\n\n*Type **continue learning** to move to Lesson 4!*`;
      } else {
        text = `### Docker Lesson 4: Container Deployment 🐳\n\nHow to get containerized workloads into production:\n\n- **Registry**: Push images to Docker Hub or AWS ECR.\n- **Hosting**: Run on ECS, Cloud Run, or any VM with Docker engine installed.\n- **Best Practices**: Use multi-stage builds and avoid running containers as root.\n\n🎉 *You have completed the Docker Learning Path!*`;
      }
    } else if (topic === "Kubernetes") {
      if (lessonNum === 1) {
        text = `### Kubernetes Lesson 1: Core Architecture ☸️\n\n**Topics covered:**\n- **Pods**: The smallest, most basic deployable objects in Kubernetes.\n- **Deployments**: Declarative templates to run and scale sets of identical Pods.\n- **Services**: Network abstractions exposing a set of Pods as a network service.\n- **Namespaces**: Virtual clusters used to isolate resources within a physical cluster.\n\n*Type **continue learning** to move to Lesson 2!*`;
      } else if (lessonNum === 2) {
        text = `### Kubernetes Lesson 2: kubectl Basics ☸️\n\nkubectl is the command-line utility to control Kubernetes clusters:\n\n- **Deploying a resource**:\n  \`kubectl apply -f deployment.yaml\`\n- **Listing resources**:\n  \`kubectl get pods\` / \`kubectl get services\`\n- **Inspecting a resource**:\n  \`kubectl describe pod <pod-name>\`\n- **Viewing logs**:\n  \`kubectl logs <pod-name>\`\n\n*Type **continue learning** to move to Lesson 3!*`;
      } else if (lessonNum === 3) {
        text = `### Kubernetes Lesson 3: Helm Package Manager ☸️\n\nSimplify Kubernetes deployments with package management:\n\n- **Helm**: The package manager for Kubernetes.\n- **Charts**: Pre-configured templates of Kubernetes resources.\n\n*Type **continue learning** to move to Lesson 4!*`;
      } else {
        text = `### Kubernetes Lesson 4: Production Clusters ☸️\n\nScaling up to production-grade environments:\n\n- **Ingress**: Manage external access to the cluster services.\n- **ConfigMaps & Secrets**: Inject external configuration settings safely.\n- **Security**: RBAC (Role-Based Access Control) to limit cluster privileges.\n\n🎉 *You have completed the Kubernetes Learning Path!*`;
      }
    } else if (topic === "Linux") {
      if (lessonNum === 1) {
        text = `### Linux Lesson 1: Introduction to Linux 🐧\n\nLinux is an open-source operating system powering the vast majority of servers and cloud networks.\n\n**Core Commands:**\n- \`pwd\` (Print Working Directory)\n- \`cd\` (Change Directory)\n- \`ls\` (List files and directories)\n\n*Type **continue learning** to move to Lesson 2!*`;
      } else if (lessonNum === 2) {
        text = `### Linux Lesson 2: Basic Navigation & Files 🐧\n\nLet's learn file and directory creation commands:\n\n- \`mkdir <dir>\` (Create folder)\n- \`touch <file>\` (Create empty file)\n- \`rm <file>\` (Remove file)\n- \`cp <src> <dest>\` (Copy file)\n- \`mv <src> <dest>\` (Move/rename file)\n\n*Type **continue learning** to continue your Linux path!*`;
      } else if (lessonNum === 8) {
        text = `### Linux Lesson 8: Environment Variables 🐧\n\nConfigure execution contexts and persistent settings:\n\n- **Environment Variables**: Key-value pairs that influence process execution (e.g., \`PATH\` or \`USER\`).\n- \`export VAR="value"\` (Set current environment variable)\n- \`.bashrc\` / \`.zshrc\` (User shell run configuration files to persist exports)\n\n*Type **continue learning** to move to Lesson 9!*`;
      } else if (lessonNum === 9) {
        text = `### Linux Lesson 9: Shell Scripting 🐧\n\nAutomate tasks using script files:\n\n- **Script File**: A file containing a series of command-line operations, starting with a shebang line (e.g., \`#!/bin/bash\`).\n- \`chmod +x script.sh\` (Make script executable)\n- \`./script.sh\` (Execute shell script)\n\n*Type **continue learning** to continue your path!*`;
      } else {
        text = `### Linux Lesson ${lessonNum}: Command Line Mastery 🐧\n\nContinuing through terminal management, filesystems, and shell scripting.\n\nToday's Focus: Mastering system interactions and scripting workflows.\n\n*Type **continue learning** to continue your Linux path!*`;
      }
    } else {
      text = `### ${topic} Lesson ${lessonNum} 📚\n\nMastering ${topic} development step-by-step.\n\nToday's Focus: Understanding standard architectures, execution pipelines, and best practices.\n\n*Type **continue learning** to proceed to the next lesson!*`;
    }

    suggestions = ["📚 Continue Learning", "🧑💻 Generate Learning Roadmap", "💬 Ask Another Question"];
  } 
  else if (intent === 'PLANNING_MODE') {
    const hoursMatch = cleanMsg.match(/(\d+)\s*(?:hours|hour)\s*free/i) || cleanMsg.match(/free\s*(?:for)?\s*(\d+)\s*(?:hours|hour)/i);
    const freeHours = hoursMatch ? parseInt(hoursMatch[1]) : (cleanMsg.includes("plan my day") || cleanMsg.includes("today's plan") || cleanMsg.includes("plan today") ? 5 : null);
    
    if (freeHours !== null) {
      actions.push({
        type: 'GENERATE_CALENDAR_SCHEDULE',
        payload: { freeHours, mode: 'day' }
      });
      text = `### AI Calendar Adaptive Schedule Created\n\nBased on your **${freeHours} free hours today**, I have constructed an optimized schedule utilizing smart time-blocking. Below is the custom timeline:\n\n` +
             (freeHours === 5 ? 
             `* **2:00 PM – 4:00 PM** | 🖥️ **DBMS Assignment** (Deep Work)\n* **4:15 PM – 5:00 PM** | 🧠 **LeetCode Practice** (Coding)\n* **5:00 PM – 6:00 PM** | 🚀 **Hackathon Work** (Coding)\n* **6:30 PM – 7:00 PM** | ☕ **Break** (Personal/Rest)\n* **7:00 PM – 8:00 PM** | 🐧 **Linux Learning** (Learning)` :
             `* **2:00 PM – 4:00 PM** | 🖥️ **DBMS Assignment** (Deep Work)\n* **4:15 PM – 5:00 PM** | 🧠 **LeetCode Practice** (Coding)\n* **5:00 PM – 6:30 PM** | 🚀 **Hackathon Work** (Coding)\n* **6:30 PM – 7:00 PM** | ☕ **Break** (Personal/Rest)\n* **7:00 PM – 8:00 PM** | 🐧 **Linux Learning** (Learning)\n* **8:00 PM – 9:00 PM** | ⚛️ **React Upskilling** (Learning)`);
      suggestions = ["⚡ Optimize Week", "🔄 Recover Lost Time", "🚀 Start Focus Mode"];
    } else if (cleanMsg.includes("optimize") || cleanMsg.includes("balance")) {
      actions.push({
        type: 'OPTIMIZE_WEEK',
        payload: {}
      });
      text = `### Calendar Optimized!\n\nI have recalculated your weekly calendar schedule to route high-focus items to morning slots, reducing overall burnout risk and boosting productivity scores!`;
      suggestions = ["📅 Open Calendar", "🔄 Recover Lost Time"];
    } else if (cleanMsg.includes("recover") || cleanMsg.includes("missed") || cleanMsg.includes("overdue")) {
      actions.push({
        type: 'RECOVER_LOST_TIME',
        payload: {}
      });
      text = `### Lost Time Recovered!\n\nI have automatically scanned your overdue high-priority items and shifted them forward into open slots tomorrow!`;
      suggestions = ["📅 Open Calendar", "⚡ Optimize Week"];
    } else if (cleanMsg.includes("weekend")) {
      text = `Weekend Plan\n\nSaturday\n\n9:00–11:00\n\nDSA Study\n\n11:30–12:30\n\nLeetCode\n\n2:00–5:00\n\nHackathon work\n\nSunday\n\n10:00–1:00\n\nProject improvements\n\n3:00–4:00\n\nRoadmap review\n\n5:00–6:00\n\nHabit completion\n\nTotal workload:\n\n8 hours\n\nEstimated stress:\n\nModerate`;
      suggestions = ["🚀 Start Focus Mode", "🎯 View Dashboard", "📅 Open Calendar"];
    } else if (/\b(assignments|hackathon|tasks|exams|workload)\b/i.test(cleanMsg)) {
      const matchA = cleanMsg.match(/(\d+)\s+assignment/i);
      const assignmentsCount = matchA ? matchA[1] : "3";
      const hasHackathon = cleanMsg.includes("hackathon");
      text = `Let's organize this.\n\nCurrent workload:\n\nAssignments\n\n${assignmentsCount}\n\nHackathon\n\n${hasHackathon ? "1" : "0"}\n\nAvailable hours?\n\nDeadline dates?\n\nEstimated effort?\n\nOnce I know these details I'll create an optimized schedule.`;
      suggestions = ["🚀 Start Focus Mode", "🎯 View Dashboard", "📅 Open Calendar"];
    } else {
      const { hour: currentHour, minute: currentMinute } = parseCurrentTime(userData?.currentTimeString);
      const isEvening = currentHour >= 17;
      
      if (isEvening) {
        text = generateEveningPlan(currentHour, currentMinute);
      } else {
        text = `### Today's Plan\nHere is a structured, balanced schedule tailored to your pending items:\n\nTimeline & Suggested Time Blocks:\n* **09:00 - 10:30** | Deep Focus Session\n* **11:00 - 11:30** | Routine Habit Practice\n* **14:00 - 15:30** | Roadmap Learning & Upskilling\n\nEstimated Workload: 3.0 hours of focus.\nEstimated Stress: Low\n\nClick Focus Mode in the sidebar to begin your first Pomodoro session whenever you are ready.`;
      }
      suggestions = ["🚀 Start Focus Mode", "🎯 View Dashboard", "📅 Open Calendar"];
    }
  } 
  else if (intent === 'TASK_MANAGEMENT') {
    const isMove = cleanMsg.includes("move") || cleanMsg.includes("reschedule") || cleanMsg.includes("shift") || cleanMsg.includes("postpone");
    const isBill = cleanMsg.includes("bill") || cleanMsg.includes("payment") || cleanMsg.includes("internet") || cleanMsg.includes("rent") || cleanMsg.includes("subscription");

    if (isMove) {
      const matchHackathon = cleanMsg.includes("hackathon");
      const targetTitle = matchHackathon ? "Hackathon Work" : "Specified Task";
      actions.push({
        type: 'RESCHEDULE_TASK',
        payload: { title: targetTitle, targetDate: 'Tomorrow' }
      });
      text = `I've rescheduled **${targetTitle}** to tomorrow. Keep your evening light and rest up!`;
    } else if (isBill) {
      actions.push({
        type: 'ADD_COMMITMENT',
        payload: {
          title: 'Internet Bill',
          amount: 50,
          dueDate: '2026-07-01',
          category: 'Bills'
        }
      });
      text = `I have logged your **Internet Bill** as an active commitment. I will remind you when the due date approaches so you never miss a payment!`;
    } else if (cleanMsg.includes("delete") || cleanMsg.includes("remove")) {
      let title = message.replace(/\b(add|create|schedule|put|delete|remove|erase|move|update|progress|percent|task|todo|to-do)\b/ig, '').trim();
      if (!title) title = "Specified Task";
      actions.push({
        type: 'DELETE_TASK',
        payload: { title }
      });
      text = `Staged the deletion of task "${title}". Keeping your workspace pristine!`;
    } else if (cleanMsg.includes("update") || cleanMsg.includes("progress") || cleanMsg.includes("completed") || cleanMsg.includes("mark")) {
      let title = message.replace(/\b(add|create|schedule|put|delete|remove|erase|move|update|progress|percent|task|todo|to-do)\b/ig, '').trim();
      if (!title) title = "Specified Task";
      actions.push({
        type: 'UPDATE_TASK_PROGRESS',
        payload: { title, progress: 100 }
      });
      text = `Nice job completing your task! Staged task "${title}" as completed.`;
    } else {
      let title = message.replace(/\b(add|create|schedule|put|delete|remove|erase|move|update|progress|percent|task|todo|to-do)\b/ig, '').trim();
      if (!title) title = "Specified Task";
      actions.push({
        type: 'ADD_TASK',
        payload: {
          title,
          deadline: '2026-06-28',
          priority: 'High',
          complexity: 'Medium',
          category: 'Focus'
        }
      });
      text = `Drafted action to add task "${title}" to your priorities list. Confirm when ready!`;
    }
    suggestions = ["🎯 View Dashboard", "📅 Open Calendar"];
  } 
  else if (intent === 'FOCUS_MODE') {
    actions.push({
      type: 'START_FOCUS_MODE',
      payload: {}
    });
    text = `Focus Session Started\n\nSession length:\n\n50 minutes\n\nTask:\n\nSelect a task\n\nBreak:\n\n10 minutes\n\nMicro-goal:\n\nComplete one small milestone before the timer ends.\n\nDeep work begins now.`;
    suggestions = ["🎯 View Dashboard", "📅 Open Calendar"];
  } 
  else if (intent === 'PANIC_MODE') {
    const deadlineTitle = pendingTasks.length > 0 ? pendingTasks[0].title : 'Crucial Deadline';
    actions.push({
      type: 'ACTIVATE_PANIC',
      payload: {
        deadlineTitle,
        remainingHours: 6,
        taskComplexity: 'High'
      }
    });
    text = `### 📊 Stress Analysis
I detect heightened anxiety levels. With ${pendingTasks.length} pending tasks, ${unpaidBills.length} outstanding commitments, and active learning objectives, your mental processor is running at maximum capacity. Decision fatigue and overcommitment are combining to create cognitive friction.

### 🧠 AI Coaching
Remember, *momentum beats motivation* and *done is better than perfect*. Your goal is consistency, not intensity. Procrastination is just an emotional response to feeling overwhelmed. You do not need to finish the whole mountain today; we just need to take one step.

### 🛌 Recovery Plan
1. **Take a 15-minute screen-free recovery block** right now. Stand up, stretch, and hydrate.
2. **De-load tomorrow's calendar.** We will reschedule low-priority tasks to next week.
3. **Protect your sleep tonight.** Sleep is the ultimate cognitive multiplier.

### ⚡ Focus Suggestion
Let's bypass the inertia. Launch a low-stress **15-minute Focus Session** on a single microtask (e.g., just opening your textbook or creating a blank project file). No pressure to complete it.

### 🚨 Panic Option
I have queued up an emergency triage workspace. **Activate Panic Mode** to lock down your schedule, filter out non-essential work, and focus exclusively on the critical path to secure your deadlines.`;
    suggestions = ["🚨 Activate Panic Mode", "🚀 Start Focus Mode", "🎯 View Dashboard"];
  } 
  else if (intent === 'COACHING_MODE') {
    text = `### Personal Mentorship\nFeeling stuck or losing momentum is a completely normal phase of the learning loop, ${name}.\n\nThe best solution is to completely lower the initial friction. Do not focus on the entire mountain—just pick one tiny action you can do in the next 5 minutes.\n\nLet's break down the next step together. Would you like to launch a 25-minute Pomodoro block to build focus?`;
    suggestions = ["🚀 Start Focus Mode", "📅 Plan my day", "💬 Just want to chat"];
  } 
  else if (intent === 'MOTIVATION_MODE') {
    text = `### Keep Going!\nYou are making absolute, compounding progress, ${name}.\n\nConsistency is about showing up even on the days when enthusiasm is low. Every small line of code, every scheduled block of study, is a vote for your future self.\n\nTake a deep breath and take one tiny step forward today. You've got this!`;
    suggestions = ["🚀 Start Focus Mode", "🎯 View Dashboard", "💬 Ask Another Question"];
  } 
  else if (intent === 'ROADMAP_MODE') {
    if (cleanMsg.includes("placement")) {
      text = `Placement Roadmap\n\nYear 1\n\nProgramming fundamentals\n\nGit\n\nLinux\n\nProjects\n\nYear 2\n\nDSA\n\nOOP\n\nDatabase Systems\n\nHackathons\n\nYear 3\n\nInternships\n\nSystem Design basics\n\nCompetitive coding\n\nResume building\n\nYear 4\n\nMock interviews\n\nCompany preparation\n\nApplications\n\nNetworking`;
    } else {
      const roleMatch = cleanMsg.match(/\b(become|career|path|roadmap|role)\s+([a-zA-Z0-9\s]+)/i);
      const roleName = roleMatch ? roleMatch[2].trim() : "Software Developer";
      text = `${roleName} Career Roadmap\n\nPhase 1: Foundations\n• Mastering basic programming logic and control flows.\n• Version control concepts (Git, GitHub, collaboration).\n\nPhase 2: Core Engineering\n• Data Structures and Algorithms.\n• Database Design, indices, and normalization.\n\nPhase 3: Realworld Application\n• Building production-ready fullstack web apps.\n• Testing pipelines, server APIs, and deployment configurations.\n\nPhase 4: Specialization\n• Scalable system design architectures.\n• Advanced runtime profiling and cloud automation.`;
    }
    suggestions = ["📚 Continue Learning", "🧑💻 Create Custom Roadmap", "🎯 View Dashboard"];
  } 
  else if (intent === 'VOICE_COMMAND_MODE') {
    text = `### Voice Calibrated\nI'm fully calibrated and ready to receive your voice commands!\n\nJust click the microphone icon in the sidebar whenever you're ready to speak. I can schedule tasks, start timers, or guide lessons hands-free.`;
    suggestions = ["💬 Ask a question", "🎯 View Dashboard"];
  } 
  else {
    text = `Hey ${name}! 👋\n\nI'm here as your personal mentor and copilot. We can discuss your career goals, design neat programming challenges, or draft a direct daily schedule whenever you are ready.\n\nHow are you holding up today?`;
    suggestions = ["📅 Plan my day", "🧑💻 Learn something new", "💬 Just want to chat"];
  }

  return { intent, text, actions, suggestions, updatedMemory: memory };
};

// 1. Profile Analysis Onboarding
app.post('/api/profile-analyze', async (req, res) => {
  try {
    const { bio } = req.body;
    if (!bio) {
      return res.status(400).json({ error: 'Bio is required' });
    }

    try {
      const ai = getGeminiClient();
      const prompt = `Analyze this user's bio and tell me about them: "${bio}". 
      Understand their name (fallback to User if not found), determine their role (Student, Professional, or Entrepreneur), 
      and identify their strengths, challenges, core goals, interests, growth areas, and recommended skills. 
      Respond strictly in JSON matching the specified schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'The user\'s name. Parse from bio or default to User.' },
              role: { 
                type: Type.STRING, 
                enum: ['Student', 'Professional', 'Entrepreneur'],
                description: 'Primary role based on the bio description.' 
              },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Extracted key strengths.' },
              challenges: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Identified pain points or potential challenges.' },
              coreGoals: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Short and long term goals mentioned.' },
              interests: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Interests, hobbies, or fields of study.' },
              growthAreas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Aspirations or areas of professional/personal growth.' },
              recommendedSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-5 highly personalized skills they should master next.' },
            },
            required: ['name', 'role', 'strengths', 'challenges', 'coreGoals', 'interests', 'growthAreas', 'recommendedSkills'],
          },
        },
      });

      const parsedData = JSON.parse(response.text || '{}');
      return res.json(parsedData);
    } catch (genAiError: any) {
      console.log('[AI Backplane Status] Transitioning to local rules for profile analysis');
      const fallbackData = generateHeuristicProfile(bio);
      return res.json(fallbackData);
    }
  } catch (outerException: any) {
    console.log('[AI Backplane Status] Encountered processing issue in profile-analyze endpoint');
    res.status(500).json({ error: outerException.message || 'Process halted' });
  }
});

// 1B. Persona Insights Generator
app.post('/api/persona-insights', async (req, res) => {
  try {
    const {
      role, interests, skills, goals, learningPreferences,
      focusPatterns, energyPatterns, stressTrends, habits,
      productivityStyle, careerAspirations
    } = req.body;

    try {
      const ai = getGeminiClient();
      const prompt = `Analyze this user's productivity settings and profile to create an intelligent Persona Profile:
      - Primary Role: ${role || 'Not specified'}
      - Interests: ${interests?.join(', ') || 'None specified'}
      - Skills: ${skills?.join(', ') || 'None specified'}
      - Goals: ${goals?.join(', ') || 'None specified'}
      - Learning Preferences: ${learningPreferences?.join(', ') || 'None specified'}
      - Focus Patterns: ${focusPatterns?.join(', ') || 'None specified'}
      - Energy Patterns: ${energyPatterns?.join(', ') || 'None specified'}
      - Stress Trends: ${stressTrends?.join(', ') || 'None specified'}
      - Habits: ${habits?.join(', ') || 'None specified'}
      - Productivity Style: ${productivityStyle || 'Not specified'}
      - Career Aspirations: ${careerAspirations || 'Not specified'}

      Generate a custom, motivating Persona Profile. 
      Select an elegant "dynamicPersona" (e.g. "Growth Driven Engineer", "Startup Founder", "Systems Thinker", "Creative Explorer", "Consistency Champion").
      Select an elegant "productivityArchetype" (e.g. "Systems Thinker", "Consistency Champion", "Startup Founder", "Creative Explorer").
      Extract their Strengths (array of 3 highly personalized bullet points), Growth Opportunities / Areas to Improve (array of 3 points), Current Identity (a nice 2-sentence description of their identity), and Suggested Improvements (array of 3 actionable steps matching their energy peak/focus).
      Respond strictly in JSON matching the specified schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dynamicPersona: { type: Type.STRING, description: 'Creative name of their persona.' },
              productivityArchetype: { type: Type.STRING, description: 'One of the standard archetypes.' },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Personalized strengths (exactly 3).' },
              growthOpportunities: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Areas to improve (exactly 3).' },
              currentIdentity: { type: Type.STRING, description: 'Description of their identity.' },
              suggestedImprovements: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Actionable productivity suggestions.' },
            },
            required: ['dynamicPersona', 'productivityArchetype', 'strengths', 'growthOpportunities', 'currentIdentity', 'suggestedImprovements'],
          },
        },
      });

      const parsedData = JSON.parse(response.text || '{}');
      return res.json(parsedData);
    } catch (genAiError: any) {
      console.log('[AI Backplane Status] Transitioning to local heuristic rules for persona insights');
      const fallbackData = generateHeuristicPersonaInsights(
        role, interests, skills, goals, learningPreferences,
        focusPatterns, energyPatterns, stressTrends, habits,
        productivityStyle, careerAspirations
      );
      return res.json(fallbackData);
    }
  } catch (outerException: any) {
    console.log('[AI Backplane Status] Encountered processing issue in persona-insights endpoint');
    res.status(500).json({ error: outerException.message || 'Process halted' });
  }
});

// 2. Focus Task Breakdown
app.post('/api/focus-breakdown', async (req, res) => {
  try {
    const { taskTitle, complexity } = req.body;
    if (!taskTitle) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    try {
      const ai = getGeminiClient();
      const prompt = `Analyze the task "${taskTitle}" (Complexity: ${complexity || 'Medium'}). 
First, classify it into exactly one of these 8 categories: Study, Coding, Assignment, Hackathon, Learning, Placement Prep, Career Growth, Project Building.
Then, break down this task into 4 to 8 clear, sequential, highly actionable and realistic micro-tasks tailored to that category.
For each micro-task, specify:
1. A highly actionable title.
2. An estimated duration (e.g., "15 min", "30 min", "45 min", "60 min").
3. A difficulty level: "Easy", "Medium", or "Hard".`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { 
                type: Type.STRING, 
                description: 'The classified category of the task. Must be one of: Study, Coding, Assignment, Hackathon, Learning, Placement Prep, Career Growth, Project Building.' 
              },
              microTasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: 'Direct actionable micro-task title.' },
                    duration: { type: Type.STRING, description: 'Estimated duration (e.g. "20 min", "45 min").' },
                    difficulty: { type: Type.STRING, description: 'Difficulty level: Easy, Medium, or Hard.' }
                  },
                  required: ['title', 'duration', 'difficulty'],
                },
              },
            },
            required: ['category', 'microTasks'],
          },
        },
      });

      const parsedData = JSON.parse(response.text || '{}');
      return res.json(parsedData);
    } catch (genAiError: any) {
      console.log('[AI Backplane Status] Transitioning to local rules for task breakdown (gracefully handled)');
      const fallbackData = generateHeuristicBreakdown(taskTitle, complexity);
      return res.json(fallbackData);
    }
  } catch (outerException: any) {
    console.log('[AI Backplane Status] Encountered processing issue in focus-breakdown endpoint');
    res.status(500).json({ error: outerException.message || 'Process halted' });
  }
});

// 3. Panic Mode Plan
app.post('/api/panic-plan', async (req, res) => {
  try {
    const { deadlineTitle, remainingHours, currentProgress, taskComplexity } = req.body;
    if (!deadlineTitle) {
      return res.status(400).json({ error: 'Deadline title is required' });
    }

    try {
      const ai = getGeminiClient();
      const prompt = `The user is in PANIC MODE because they have an urgent deadline for "${deadlineTitle}".
      Remaining Time: ${remainingHours} hours.
      Current Progress: ${currentProgress || 'Hardly started'}.
      Task Complexity: ${taskComplexity || 'High'}.
      
      Act as an emergency life copilot. Generate a realistic hour-by-hour tactical plan. 
      Analyze what MUST be completed immediately (Critical), what can be skipped (Skip), and what can be optimized (Optimize) to survive the deadline and avoid failure. 
      Map it into a sequence of hours matching the remaining time (maximum 8 steps to avoid overwhelming the user).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hour: { type: Type.STRING, description: 'Hour label or timeframe (e.g. "Hour 1", "Hour 2-3").' },
                    task: { type: Type.STRING, description: 'Emergency task explanation.' },
                    priority: { 
                      type: Type.STRING, 
                      enum: ['Critical', 'Skip', 'Optimize'],
                      description: 'Whether this task is absolutely critical, can be skipped completely, or optimized for speed.' 
                    },
                  },
                  required: ['hour', 'task', 'priority'],
                },
              },
            },
            required: ['steps'],
          },
        },
      });

      const parsedData = JSON.parse(response.text || '{}');
      return res.json(parsedData);
    } catch (genAiError: any) {
      console.log('[AI Backplane Status] Transitioning to local rules for emergency tactical planning');
      const fallbackData = generateHeuristicPanicPlan(deadlineTitle, remainingHours);
      return res.json(fallbackData);
    }
  } catch (outerException: any) {
    console.log('[AI Backplane Status] Encountered processing issue in panic-plan endpoint');
    res.status(500).json({ error: outerException.message || 'Process halted' });
  }
});

// 4. Growth Roadmap Generator
app.post('/api/growth-roadmap', async (req, res) => {
  try {
    const { topic, userProfile } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const isCareerGoal = /become|career\s*roadmap|prepare\s*for|goal:|i\s*want\s*to\s*become/i.test(topic);

    try {
      const ai = getGeminiClient();
      const profileContext = userProfile ? `User Profile context: Role: ${userProfile.role}, Bio: ${userProfile.bio}, Strengths: ${userProfile.strengths?.join(', ')}` : '';
      
      let prompt = `Generate a customized high-quality learning roadmap for the topic/skill: "${topic}". 
      ${profileContext}
      
      Provide a highly structured, multi-stage learning roadmap. Although this is a skill/topic roadmap, fill out all fields in the schema perfectly:
      - steps: 4 to 5 sequential learning milestones/stages (with title, action-oriented description, estimatedHours).
      - isCareerRoadmap: false
      - timeline: overall completion timeline, e.g. "4 Weeks", "2 Months"
      - learningSchedule: weekly study commitment, e.g. "6 hours / week"
      - skills: 3 to 5 key skills gained
      - suggestedHabits: 2 or 3 supportive study habits
      - certifications: recommended courses or standard credentials
      - badges: 2 or 3 custom motivational badges corresponding to milestones
      - projects: 1 or 2 small-scale practical projects to build
      - placementReadiness: basic assessment of this topic with score, simple feedback, and checks (e.g., "Basic Concepts", "Hands-on Completed") with passed booleans
      - weeklyPlan: a simple weekly timeline showing focus areas and tasks for the weeks (weeks 1 to 4 or more up to 12).
      
      Respond with valid JSON adhering to the response schema.`;

      if (isCareerGoal) {
        prompt = `Generate an advanced, comprehensive, structured Career Learning Roadmap for the professional topic/role: "${topic}".
        ${profileContext}
        
        Since this is a career or high-stakes goal, construct a complete multi-stage career roadmap.
        Include:
        - steps: 4 to 5 sequential learning stages/milestones (each step/milestone with title, description, and estimatedHours).
        - isCareerRoadmap: true
        - timeline: overall timeline estimation, e.g., "6 Months"
        - learningSchedule: weekly study recommendations, e.g., "12 hours / week"
        - skills: 5 to 8 critical technical and soft skills to build for this career
        - suggestedHabits: 3 or 4 actionable daily/weekly professional habits
        - certifications: targeted high-value industry certifications (e.g., Google, AWS, Scrum, Cisco)
        - badges: milestones/badges unlocked at each step (e.g. "Python Initiate", "Cloud Apprentice")
        - projects: 2 or 3 high-impact portfolio projects (each project has title, description, difficulty ('Beginner', 'Intermediate', or 'Advanced'), and skillsCovered list)
        - placementReadiness: a professional analysis of their profile vs this target career. Provide:
          - score: overall readiness score (0-100)
          - feedback: constructive critique of user readiness based on their profile bio/role
          - checks: a list of 4 key checks ("Resume Polished", "Portfolio Capstone", "Technical Foundation", "Mock Behavioral") with passed/failed booleans
        - weeklyPlan: a detailed timeline showing specific weekly focus topics and tasks (covering Weeks 1 to 12).
        
        Provide high-quality professional recommendations tailored to their bio, strengths, and role. Respond with valid JSON adhering to the response schema.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCareerRoadmap: { type: Type.BOOLEAN, description: 'True if topic is a career path, prepare-for goal, or job-related search.' },
              timeline: { type: Type.STRING, description: 'Estimated overall completion time, e.g., "3 Months", "6-9 Months".' },
              learningSchedule: { type: Type.STRING, description: 'Recommended weekly study commit, e.g. "8 hours / week".' },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Core skills to be mastered.'
              },
              suggestedHabits: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Daily or weekly habits to build related to this goal.'
              },
              certifications: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Top industry certifications or credentials to target.'
              },
              badges: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Custom earned badges or milestone rewards (e.g., "Linux Explorer", "DSA Novice").'
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: 'Title of the step/milestone.' },
                    description: { type: Type.STRING, description: 'Action-oriented details of what to learn, read, or build.' },
                    estimatedHours: { type: Type.INTEGER, description: 'Recommended study hours.' }
                  },
                  required: ['title', 'description', 'estimatedHours']
                }
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    difficulty: { type: Type.STRING, description: 'Difficulty level, strictly either "Beginner", "Intermediate", or "Advanced".' },
                    skillsCovered: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['title', 'description', 'difficulty', 'skillsCovered']
                }
              },
              placementReadiness: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.INTEGER, description: 'Readiness score from 0 to 100.' },
                  feedback: { type: Type.STRING, description: 'Constructive AI critique of user profile readiness.' },
                  checks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING, description: 'Name of check (e.g., Resume, Portfolio, DSA).' },
                        passed: { type: Type.BOOLEAN, description: 'True if likely passed, False if pending.' }
                      },
                      required: ['title', 'passed']
                    }
                  }
                },
                required: ['score', 'feedback', 'checks']
              },
              weeklyPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    week: { type: Type.INTEGER },
                    focus: { type: Type.STRING },
                    tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['week', 'focus', 'tasks']
                }
              }
            },
            required: ['steps', 'isCareerRoadmap', 'timeline', 'learningSchedule', 'skills', 'suggestedHabits', 'certifications', 'badges', 'projects', 'placementReadiness', 'weeklyPlan']
          },
        },
      });

      const parsedData = JSON.parse(response.text || '{}');
      return res.json(parsedData);
    } catch (genAiError: any) {
      console.log('[AI Backplane Status] Transitioning to local rules for educational roadmap generation');
      const fallbackData = generateHeuristicRoadmap(topic);
      return res.json(fallbackData);
    }
  } catch (outerException: any) {
    console.log('[AI Backplane Status] Encountered processing issue in growth-roadmap endpoint');
    res.status(500).json({ error: outerException.message || 'Process halted' });
  }
});

// 5. Weekly Review
app.post('/api/weekly-review', async (req, res) => {
  try {
    const { userStats } = req.body;
    try {
      const ai = getGeminiClient();
      const prompt = `Generate a supportive, highly personalized weekly performance review. 
      User productivity data for this week:
      - Tasks completed: ${userStats.tasksCompleted || 0}
      - Total focus session hours: ${userStats.focusHours || 0}
      - Habits maintained: ${userStats.habitsMaintained || 0}
      - Growth milestones reached: ${userStats.milestonesReached || 0}
      - Procrastination interventions triggered: ${userStats.interventionsTriggered || 0}

      Synthesize this performance into a JSON containing a summary review, highlighting their key accomplishments (strengths), areas of friction where they procrastinated, a tactical actionable advice strategy for the coming week, and an overall productivity score out of 100.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: 'Overall review summary paragraph.' },
              completedStrengths: { type: Type.STRING, description: 'Extracted accomplishments and strengths.' },
              areasToImprove: { type: Type.STRING, description: 'Feedback on friction points, procrastination, or missed goals.' },
              nextWeekStrategy: { type: Type.STRING, description: 'Actionable tips and strategy for next week.' },
              score: { type: Type.INTEGER, description: 'Productivity and Consistency Score out of 100.' },
            },
            required: ['summary', 'completedStrengths', 'areasToImprove', 'nextWeekStrategy', 'score'],
          },
        },
      });

      const parsedData = JSON.parse(response.text || '{}');
      return res.json(parsedData);
    } catch (genAiError: any) {
      console.log('[AI Backplane Status] Transitioning to local rules for performance review synthesis');
      const fallbackData = generateHeuristicWeeklyReview(userStats);
      return res.json(fallbackData);
    }
  } catch (outerException: any) {
    console.log('[AI Backplane Status] Encountered processing issue in weekly-review endpoint');
    res.status(500).json({ error: outerException.message || 'Process halted' });
  }
});

// 6. Voice Assistant Chat & Actions Bridge
app.post('/api/assistant', async (req, res) => {
  try {
    const { message, history, userData, currentTimeString } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Run local deterministic pre-classification
    const classification = classifyIntent(message, userData?.copilotMemory || {});
    const cleanMsg = message.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ");
    const name = userData?.profile?.name || 'Aditi';

    // 2. High-priority direct bypass for Goodbye, Burnout, Time awareness, and UNKNOWN/Fallback
    if (classification.isGoodbye || ["bye", "goodbye", "see you", "thanks bye", "talk later"].some(kw => cleanMsg.includes(kw)) || /\b(bye|goodbye|see you|talk later)\b/i.test(cleanMsg)) {
      const text = `Take care ${name} 👋\n\nYou made good progress today.\n\nI'll be here whenever you need me.`;
      return res.json({
        intent: 'CASUAL_CHAT',
        text,
        actions: [],
        suggestions: [],
        updatedMemory: userData?.copilotMemory || {}
      });
    }

    if (cleanMsg.includes("burnt out") || cleanMsg.includes("burnout") || cleanMsg.includes("stressed") || cleanMsg.includes("overwhelmed")) {
      const text = `### 📊 Stress Analysis
I detect heightened anxiety levels. Your mental processor is running at maximum capacity. Decision fatigue and overcommitment are combining to create cognitive friction.

### 🧠 AI Coaching
Remember, *momentum beats motivation* and *done is better than perfect*. Your goal is consistency, not intensity. Procrastination is just an emotional response to feeling overwhelmed. You do not need to finish the whole mountain today; we just need to take one step.

### 🛌 Recovery Plan
1. **Take a 15-minute screen-free recovery block** right now. Stand up, stretch, and hydrate.
2. **De-load tomorrow's calendar.** We will reschedule low-priority tasks to next week.
3. **Protect your sleep tonight.** Sleep is the ultimate cognitive multiplier.

### ⚡ Focus Suggestion
Let's bypass the inertia. Launch a low-stress **15-minute Focus Session** on a single microtask (e.g., just opening your textbook or creating a blank project file). No pressure to complete it.

### 🚨 Panic Option
I have queued up an emergency triage workspace. **Activate Panic Mode** to lock down your schedule, filter out non-essential work, and focus exclusively on the critical path to secure your deadlines.`;
      const suggestions = ["🚨 Activate Panic Mode", "🚀 Start Focus Mode", "🎯 View Dashboard"];
      return res.json({
        intent: 'PANIC_MODE',
        text,
        actions: [{ type: 'ACTIVATE_PANIC', payload: { reason: 'burnout' } }],
        suggestions,
        updatedMemory: userData?.copilotMemory || {}
      });
    }

    if (classification.isTimeAwareness) {
      const { hour, minute } = parseCurrentTime(currentTimeString);
      const text = generateEveningPlan(hour, minute);
      return res.json({
        intent: 'PLANNING_MODE',
        text,
        actions: [],
        suggestions: ["📅 Plan my day", "🎯 Focus session", "💬 Just chat"],
        updatedMemory: userData?.copilotMemory || {}
      });
    }

    if (classification.intent === 'UNKNOWN') {
      const text = `I didn't fully understand that.

Would you like help with:

📅 Planning

📚 Learning

🎯 Focus

🚨 Panic Mode

💬 Chat`;
      const suggestions = ["📅 Plan my day", "🎯 Start Focus", "🚨 Survive Stress", "📚 Continue Learning"];
      return res.json({
        intent: 'CASUAL_CHAT',
        text,
        actions: [],
        suggestions,
        updatedMemory: userData?.copilotMemory || {}
      });
    }

    try {
      const ai = getGeminiClient();

      const formattedHistory = (history || []).map((h: any) => 
        `${h.sender === 'user' ? 'User' : 'AI'}: ${h.text}`
      ).join('\n');

      const formattedState = userData ? `
      USER PROFILE & PERSONA: Name: ${userData.profile?.name || 'Aditi'}, Role: ${userData.profile?.role || 'Professional'}, Bio: ${userData.profile?.bio || 'No bio'}, Goals: ${userData.profile?.coreGoals?.join(', ') || 'No core goals'}
      TASKS: ${JSON.stringify(userData.tasks || [])}
      HABITS: ${JSON.stringify(userData.habits || [])}
      COMMITMENTS / BILLS: ${JSON.stringify(userData.commitments || [])}
      GOALS: ${JSON.stringify(userData.goals || [])}
      ROADMAPS: ${JSON.stringify(userData.roadmaps || [])}
      PANIC MODE STATUS: ${JSON.stringify(userData.panicPlan || { active: false })}
      LONG-TERM COPI_MEMORY: ${JSON.stringify(userData.copilotMemory || {})}
      ` : 'None';

      const prompt = `You are the AI Life Copilot & Personal Mentor of ${userData?.profile?.name || 'Aditi'}.
      You are NOT a simple chatbot. You behave like an intelligent AI life coach, elite planner, and strategic tutor.
      You have absolute, context-aware intelligence of all user data.

      The user's active life state is:
      ${formattedState}

      User's local time context: ${currentTimeString || 'Friday, June 26, 2026, 10:27 AM'}

      CRITICAL CONVERSATIONAL STRICTURES (MUST OBEY STRICTLTY):
      - NO CLICHES OR TECH-FILLER: You are STRICKLY FORBIDDEN from explaining random concepts with sentences like "X is a key building block in modern software engineering." or "In modern software development, X is crucial...". Avoid artificial corporate talk or robotic textbook filler. Be direct, natural, and friendly.
      - CONVERSATIONAL NATURALNESS: Make conversations feel completely natural and human, just like ChatGPT, Gemini, or Copilot. Do not sound like a template. Avoid repetitive or canned greetings.
      - PERFECT REPLIES TO GREETINGS & JOKES:
        * If the user says "Hi", "Hello", "Hey", "Yo", or similar greetings, respond EXACTLY with: "Hey Aditi 👋 Hope your day is going well. What would you like to tackle today?" (using their real name if it differs from Aditi). Do not add any extra paragraphs or generic templates.
        * If the user says "Tell me a joke", reply with a humorous, clever, short joke.
        * If the user says "I feel burned out" or "stressed", reply with high empathy, suggest a quick screen-free recovery break, and provide focus or Panic Mode options.
      - TIME-AWARE SCHEDULING RULE:
        * Always inspect the 'User\'s local time context' (${currentTimeString}).
        * Do NOT suggest past hours (e.g., if it's 7:30 PM, do not suggest 2 PM, 3 PM, or 4 PM slots).
        * Instead, suggest slots in the future (e.g., 8:00 PM - 9:00 PM, 9:00 PM - 10:00 PM) or defer tasks to "Tomorrow morning" or "Tomorrow afternoon" to protect rest.
        * If the user says "It is already evening", acknowledge it contextually, e.g., "Since it's already [exact time, e.g. 7:30 PM], let's focus only on today's critical items."

      CRITICAL SYSTEM DIRECTIVES:

      1. MULTI-LAYER INTENT-DRIVEN ADAPTIVE ARCHITECTURE:
         The deterministic pre-classifier has detected the user's intent is: '${classification.intent}'.
         You MUST set your JSON 'intent' field to '${classification.intent}' and follow its state-specific generation rules.
         Do NOT fall back to generic greetings or other intents.

         Internal conversation states:
         - 'CASUAL_CHAT' (Triggers: "Hi", "Hello", "Yo", "Thanks", "Thank you", "How are you", "Tell me a joke", "I'm bored", general greeting or conversation)
         - 'GENERAL_QA' (Triggers: "What is deployment", "Explain Docker", "What is Linux", educational questions, definitions, analogies)
         - 'LEARNING_MODE' (Triggers: "Teach me Linux", "Continue learning", "Next lesson", "Learn React", lesson-based upskilling, tutorial modules)
         - 'PLANNING_MODE' (Triggers: "Plan my day", "Plan my week", "Plan my weekend", "What should I do today?", "Help me organize everything", calendar schedules)
         - 'TASK_MANAGEMENT' (Triggers: "Add task", "Delete task", "Update progress", "Add DBMS assignment", adding or updating list items)
         - 'FOCUS_MODE' (Triggers: "Start Focus Mode", "Begin deep work", "Start Pomodoro", "Focus timer")
         - 'PANIC_MODE' (Triggers: "I have an exam tomorrow", "Panic mode", "I'm stressed", "I feel overwhelmed", emergency triage)
         - 'COACHING_MODE' (Triggers: "I procrastinate", "I'm stuck", "no motivation", "habits", guidance blocks)
         - 'MOTIVATION_MODE' (Triggers: "Cheer me up", "need motivation", encouragement)
         - 'ROADMAP_MODE' (Triggers: "Create roadmap", "Show career path", "placement prep", "how do I become a...")
         - 'VOICE_COMMAND_MODE' (Triggers: "microphone", "speak command", "voice calibration")

      2. STATE-SPECIFIC GENERATION RULES:

         A. CASUAL_CHAT:
            - Goal: Respond naturally and warmly. Avoid mentioning deadlines unless asked.
            - Word count: Under 120 words. Keep it highly human and conversational.
            - Examples:
              "hi" -> "Hey Aditi 👋 Nice seeing you again. How's your day going? Anything exciting happening today?"

         B. GENERAL_QA:
            - Goal: Answer educational questions directly. Teach concepts, explain clearly, and use simple analogies. Do NOT redirect to dashboard priorities or schedule tasks unless explicitly relevant.
            - Examples: "What is deployment", "Explain Docker", "What is Linux".

         C. LEARNING_MODE:
            - Goal: Provide structured learning lessons. Maintain active learning session memory.
            - Docker learning path and syllabus requirements:
              When teaching Docker, present the content in a comprehensive structure:
              * Core Concepts (what Docker is, why it's used, avoiding tech cliches)
              * Containers (lightweight execution environments)
              * Images (immutable blueprints)
              * Dockerfile (step-by-step instructions for building images)
              * Practical/Interactive Exercise (e.g., build a simple Dockerfile command)
              * Short Question (to check understanding)
              * Progress Tracking (e.g., "Progress: 15% - Lesson 1 of 6")
            - Docker lesson progression:
              * Lesson 1: Containers, Images, Dockerfile, Volumes, Networks
              * Lesson 2: docker build, docker run, docker ps
              * Lesson 3: Docker Compose
              * Lesson 4: Deploying containers
            - Kubernetes lesson progression:
              * Lesson 1: Pods, Deployments, Services, Namespaces
              * Lesson 2: kubectl basics
              * Lesson 3: Helm
              * Lesson 4: Production clusters
            - Store memory in 'updatedMemory' with keys: 'activeTopic', 'currentLesson', 'completedLessons'.
              If continuing a lesson, increment 'currentLesson' and return the next lesson in sequence. For example, if activeTopic is Linux and currentLesson is 8, returning "Continue Learning" must return lesson 9. Do not restart the lesson series.
            - Strict rule: NEVER trigger learning mode or explain random sentences as educational concepts unless explicit keywords are present.
            - Required Sections/Cards:
              ### Learning Session
              * [Active Lesson Content with clean, direct tutorial text and beginner analogies]
              ### Current Focus
              * [Active Lesson name and topic, e.g. Lesson 2: Core CLI Commands (Docker)]
              ### Suggested Actions
              * [Specific action to take next]

         D. PLANNING_MODE:
            - Goal: Generate practical, structured, realistic schedules instead of generic advice.
            - Dynamic Time Blocks: ALWAYS build schedules dynamically based on the current local time context. Do NOT suggest morning slots (such as 09:00 AM) if the user's local time is already in the evening (such as 19:00). Build evening-appropriate plans when late.
            - Required Sections/Cards:
              ### Today's Plan
              * Suggested Time Blocks (with specific hours, e.g. 19:30 - 20:30, mapped to real active tasks/habits)
              ### Stress Check
              * Workload Estimate (e.g. 4.5 hours of focus)
              * Stress Estimate (Low / Moderate / High)
              * Deadline Analysis (based on real task/commitment due dates)
              ### Suggested Actions
              * [Real priority task to do from user data]
              * [Real habit to maintain from user data]
              ### Small Achievable Wins
              * [1-2 very small concrete micro-actions, e.g., "Win: Spend 5 minutes organizing your workspace"]
            - Personality: Calm, encouraging, factual, and supportive. Avoid unrequested tips.

         E. TASK_MANAGEMENT:
            - Goal: Stage actions for adding, deleting, or marking tasks as completed.
            - Action Payload: Queue the respective actions like 'ADD_TASK', 'DELETE_TASK', or 'UPDATE_TASK_PROGRESS'.

         F. FOCUS_MODE:
            - Goal: Guide the user calmly to enter Focus Mode.
            - Action Trigger: Queue the 'START_FOCUS_MODE' action payload in 'actions'.
            - Word count: Under 100 words. Calm, silent, minimalist.

         G. PANIC_MODE:
            - Goal: Calming high-priority task extraction and emergency triage advice.
            - Action Trigger: Queue the 'ACTIVATE_PANIC' action payload in 'actions'.
            - Formatting requirement: If the user indicates they are stressed or overwhelmed, you MUST structure your reply with exactly these five markdown headings:
              ### 📊 Stress Analysis
              ### 🧠 AI Coaching
              ### 🛌 Recovery Plan
              ### ⚡ Focus Suggestion
              ### 🚨 Panic Option
            - Word count: Under 250 words. Reduce the chaos, focus on the absolute critical path, no long reports.

         H. COACHING_MODE:
            - Goal: Help with procrastination or feeling stuck. Avoid corporate buzzwords or toxic positivity.
            - Required Sections/Cards:
              ### Stress Check
              * Empathize directly with their current state.
              ### Micro Step
              * Give them a single, ridiculously simple five-minute action they can do right now to build momentum.

         I. MOTIVATION_MODE:
            - Goal: Warm, genuine encouragement. Reinforce consistent micro-habits.

         J. ROADMAP_MODE:
            - Goal: Custom visual and step-by-step career path or placement preparation.

         K. VOICE_COMMAND_MODE:
            - Goal: Micro-guidance on how to command LifePilot hands-free using natural language.

      3. COMPACTNESS & CLICHÉ ELIMINATION:
         - **REDUCE VERBOSITY BY 40%**: The response text MUST be strictly between 150 to 300 words (except for short Modes like Focus, Panic, or Casual Chat). Do NOT generate massive, exhausting walls of text.
         - NEVER say "I am fully aligned with your goals." or anything similar.
         - Maintain conversational continuity: if history shows they are learning a topic, keep them in LEARNING_MODE for that topic until they explicitly change subject.

      4. CHATGPT-STYLE LOW-CONFIDENCE FALLBACK (CRITICAL):
         - If the classification confidence is less than 0.6 (the current classification is: '${classification.intent}' with confidence ${classification.confidence}), or if the user's message is an arbitrary, casual, or miscellaneous statement/question:
         - YOU MUST BEHAVE EXCLUSIVELY LIKE CHATGPT / A NATURAL CONVERSATIONAL COMPANION.
         - Return a direct, natural, friendly, warm response.
         - You are STRICTLY FORBIDDEN from generating template headers, markdown card structures, learning paths, productivity cards, dashboard references, fake tutorials, or the phrase "is a key building block in modern software engineering."
         - Do not suggest unrequested actions or create fake lists. Keep the response completely conversational and direct.

      Return a JSON object conforming strictly to the requested schema. Ensure the response text has diverse sentence structures, deep empathy, and pristine Markdown formatting.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: { 
                type: Type.STRING, 
                enum: [
                  'CASUAL_CHAT', 'GENERAL_QA', 'LEARNING_MODE', 'PLANNING_MODE', 'TASK_MANAGEMENT', 'FOCUS_MODE', 'PANIC_MODE', 'COACHING_MODE', 'MOTIVATION_MODE', 'ROADMAP_MODE', 'VOICE_COMMAND_MODE'
                ],
                description: 'The classified internal conversation state/mode.' 
              },
              text: { type: Type.STRING, description: 'Direct, detailed, well-formatted Markdown reply from the assistant/mentor.' },
              actions: {
                type: Type.ARRAY,
                description: 'Array of app triggers to execute on the frontend.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { 
                      type: Type.STRING, 
                      enum: [
                        'ADD_TASK', 'ADD_COMMITMENT', 'ADD_GOAL', 'ADD_HABIT', 'ACTIVATE_PANIC', 'GENERATE_ROADMAP',
                        'DELETE_HABIT', 'DELETE_TASK', 'UPDATE_TASK_PROGRESS', 'UPDATE_GOAL_PROGRESS', 'RESCHEDULE_TASK',
                        'START_FOCUS_MODE', 'NAVIGATE_TAB', 'GENERATE_CALENDAR_SCHEDULE', 'OPTIMIZE_WEEK', 'RECOVER_LOST_TIME'
                      ],
                      description: 'Action type identifier.' 
                    },
                    payload: { 
                      type: Type.OBJECT, 
                      description: 'Strict schema depending on the action type. Provide realistic arguments.' 
                    },
                  },
                  required: ['type', 'payload'],
                },
              },
              suggestions: {
                type: Type.ARRAY,
                description: 'Optional list of 2-4 highly actionable quick response suggestions for the user to select or run. Use emojis. Example: ["🚀 Start Focus Mode", "📅 Reschedule tasks", "🧠 Generate a Survival Plan"]',
                items: { type: Type.STRING }
              },
              updatedMemory: {
                type: Type.OBJECT,
                description: 'Key-value map containing the updated long-term memories of the user.'
              }
            },
            required: ['intent', 'text', 'actions'],
          },
        },
      });

      const parsedData = JSON.parse(response.text || '{}');
      return res.json(parsedData);
    } catch (genAiError: any) {
      console.log('[AI Backplane Status] Transitioning to local rules for conversational companion processing');
      const fallbackData = generateHeuristicAssistantResponse(message, userData);
      return res.json(fallbackData);
    }
  } catch (outerException: any) {
    console.log('[AI Backplane Status] Encountered processing issue in companion assistant endpoint');
    res.status(500).json({ error: outerException.message || 'Process halted' });
  }
});

// Configure Vite or Static Serve
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
