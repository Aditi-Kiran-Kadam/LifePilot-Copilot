/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, Sparkles, BookOpen, Clock, Plus, ChevronDown, ChevronUp, Trophy,
  ArrowRight, BookMarked, Code, Compass, FileText, HelpCircle, Award, Zap, 
  BarChart, Mic, MessageSquare, RotateCw, Check, AlertCircle, PlayCircle, Star, 
  Terminal, Briefcase, RefreshCw, Send, ChevronRight, Save, ExternalLink, Play,
  X, Pause
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Predefined types and structures for the comprehensive engine
interface PredefinedCareer {
  id: string;
  title: string;
  timeline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skillsRequired: string[];
  certifications: string[];
  suggestedHabits: string[];
  schedule: string;
  projects: string[];
}

interface RecommendedProject {
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skillsCovered: string[];
  duration: string;
  resumeValue: 'High' | 'Very High' | 'Medium';
  industryRelevance: string;
  description: string;
}

interface RecommendedVideo {
  title: string;
  channel: 'freeCodeCamp' | 'TechWorld with Nana' | 'Traversy Media' | 'NetworkChuck' | 'Fireship' | 'Striver' | 'NeetCode' | 'Andrew Ng' | 'The Primeagen' | 'Kunal Kushwaha' | string;
  url: string;
  youtubeId: string;
}

interface InteractiveQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface InteractiveLesson {
  id: string;
  topic: string;
  lessonNum: number;
  totalLessons: number;
  difficulty: 'Beginner' | 'Medium' | 'Advanced';
  estimatedTime: string; // duration
  title: string;
  keyConcepts: string[]; // concepts
  lecture: string;
  analogy: string;
  miniExercise: string; // fallback exercise
  exercises?: string[]; // full exercises list
  quizQuestion: string; // fallback quiz
  quizOptions: string[];
  correctOptionIndex: number;
  explanation: string;
  
  // New Enhanced Fields
  notes?: string;
  youtubeEmbedId?: string;
  videoUrl?: string;
  recommendedVideos?: RecommendedVideo[];
  aiResources?: string[];
  quizzes?: InteractiveQuiz[];
}

// Validation Helper for YouTube Embed URLs
const isValidYoutubeEmbed = (url?: string): boolean => {
  if (!url) return false;
  const regex = /^https:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/;
  return regex.test(url);
};

// Helper to convert embed link or extract ID to make a watch link
const getYoutubeWatchUrl = (url?: string): string => {
  if (!url) return '#';
  const match = url.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/watch?v=${match[1]}`;
  }
  return url;
};

// Fallback visual placeholder view
const showPlaceholderVideo = (lesson: InteractiveLesson) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-white space-y-4">
      <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 animate-pulse">
        <PlayCircle size={32} />
      </div>
      <div className="max-w-md space-y-2">
        <p className="text-sm font-bold text-slate-100">Educational Course Playback Fallback</p>
        <p className="text-xs text-slate-400">
          The video source for <span className="text-indigo-400 font-semibold">"{lesson.title}"</span> is currently being calibrated by the system.
        </p>
        <p className="text-[11px] text-amber-400/80 bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/10 inline-block">
          💡 Pro-Tip: You can still complete the full lecture, interactive study guides, and test your knowledge in the Unit Quiz below to earn your badge!
        </p>
      </div>
    </div>
  );
};

export const GrowthHub: React.FC = () => {
  const { profile, roadmaps, generateRoadmap, updateRoadmapStep, addTask, addHabit, addXP, incrementStat } = useApp();

  // Unified State Engine with localStorage persistence
  const [subTab, setSubTab] = useState<'recommendations' | 'roadmaps' | 'assistant' | 'placement' | 'review'>(() => {
    return (localStorage.getItem('gh_active_subtab') as any) || 'recommendations';
  });

  const [xp, setXp] = useState<number>(() => {
    return Number(localStorage.getItem('gh_xp') || '750');
  });

  const [level, setLevel] = useState<number>(() => {
    return Number(localStorage.getItem('gh_level') || '3');
  });

  const [learningDays, setLearningDays] = useState<number>(() => {
    return Number(localStorage.getItem('gh_learning_days') || '12');
  });

  const [hoursInvested, setHoursInvested] = useState<number>(() => {
    return Number(localStorage.getItem('gh_hours_invested') || '43');
  });

  const [topicsCompleted, setTopicsCompleted] = useState<number>(() => {
    return Number(localStorage.getItem('gh_topics_completed') || '7');
  });

  const [currentStreak, setCurrentStreak] = useState<number>(() => {
    return Number(localStorage.getItem('gh_current_streak') || '5');
  });

  const [longestStreak, setLongestStreak] = useState<number>(() => {
    return Number(localStorage.getItem('gh_longest_streak') || '12');
  });

  // Badge list state
  const [badges, setBadges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gh_badges');
      return saved ? JSON.parse(saved) : ["🏆 Linux Explorer", "🏆 DSA Beginner", "🏆 consistency Champion"];
    } catch {
      return ["🏆 Linux Explorer", "🏆 DSA Beginner", "🏆 consistency Champion"];
    }
  });

  // Track lesson progress
  const [selectedTopic, setSelectedTopic] = useState<string>(() => {
    return localStorage.getItem('gh_selected_topic') || 'Linux';
  });

  const [lessonIndex, setLessonIndex] = useState<number>(() => {
    return Number(localStorage.getItem('gh_lesson_index') || '0'); // Start at 0
  });

  const [assistantMode, setAssistantMode] = useState<'educational' | 'quiz'>('educational');
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizIsCorrect, setQuizIsCorrect] = useState<boolean>(false);
  
  // Local watch progress for video player
  const [watchProgress, setWatchProgress] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('gh_watch_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Track manual/autosaved classroom spot
  const [savedSpot, setSavedSpot] = useState<{ topic: string; lessonIndex: number; timestamp: number } | null>(() => {
    try {
      const saved = localStorage.getItem('gh_last_saved_progress');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Custom critique sandbox states for prep hub
  const [behavioralDraft, setBehavioralDraft] = useState<string>('');
  const [critiqueOutput, setCritiqueOutput] = useState<string>('');
  const [critiqueLoading, setCritiqueLoading] = useState<boolean>(false);

  // Roadmap creation form
  const [topicInput, setTopicInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedRoadmapId, setExpandedRoadmapId] = useState<string | null>(null);
  const [rmSubTabs, setRmSubTabs] = useState<Record<string, 'syllabus' | 'skills' | 'projects' | 'readiness' | 'weekly'>>({});

  // Selected Career Path
  const [selectedCareer, setSelectedCareer] = useState<string>('Software Engineer');

  // Success flash messages for gamification
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  // Sync state to localStorage on modification
  useEffect(() => {
    localStorage.setItem('gh_active_subtab', subTab);
    localStorage.setItem('gh_xp', xp.toString());
    localStorage.setItem('gh_level', level.toString());
    localStorage.setItem('gh_learning_days', learningDays.toString());
    localStorage.setItem('gh_hours_invested', hoursInvested.toString());
    localStorage.setItem('gh_topics_completed', topicsCompleted.toString());
    localStorage.setItem('gh_current_streak', currentStreak.toString());
    localStorage.setItem('gh_longest_streak', longestStreak.toString());
    localStorage.setItem('gh_badges', JSON.stringify(badges));
    localStorage.setItem('gh_selected_topic', selectedTopic);
    localStorage.setItem('gh_lesson_index', lessonIndex.toString());
    localStorage.setItem('gh_watch_progress', JSON.stringify(watchProgress));
  }, [subTab, xp, level, learningDays, hoursInvested, topicsCompleted, currentStreak, longestStreak, badges, selectedTopic, lessonIndex, watchProgress]);

  // Video Playback Modal state
  const [activeVideoModal, setActiveVideoModal] = useState<InteractiveLesson | null>(null);
  const [modalProgress, setModalProgress] = useState<number>(0);
  const [modalIsPlaying, setModalIsPlaying] = useState<boolean>(false);
  const [modalResumed, setModalResumed] = useState<boolean>(false);
  const [currentLessonProgressBeforeModal, setCurrentLessonProgressBeforeModal] = useState<number>(0);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const [embedFailed, setEmbedFailed] = useState<boolean>(false);

  // ESC key listener to close video modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseVideoModal();
      }
    };
    if (activeVideoModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeVideoModal]);

  const handlePlayVideo = (lesson: InteractiveLesson) => {
    const existingProgress = watchProgress[lesson.id] || 0;
    setActiveVideoModal(lesson);
    setModalProgress(existingProgress);
    setCurrentLessonProgressBeforeModal(existingProgress);
    setModalResumed(existingProgress > 0);
    setModalIsPlaying(true);
    setIsVideoLoading(true);
    setEmbedFailed(false);
  };

  const handleCloseVideoModal = () => {
    setActiveVideoModal(null);
    setModalIsPlaying(false);
    setModalResumed(false);
    setEmbedFailed(false);
  };

  const handleModalProgressChange = (val: number) => {
    setModalProgress(val);
    setWatchProgress(prev => {
      const updated = { ...prev, [activeVideoModal!.id]: val };
      localStorage.setItem('gh_watch_progress', JSON.stringify(updated));
      return updated;
    });
    if (val >= 100 && (watchProgress[activeVideoModal!.id] || 0) < 100) {
      grantXP(50, `Completed video for "${activeVideoModal!.title}"! 🎥`);
      triggerFlash(`🎉 100% Watched! You unlocked +50 Video Completion XP.`);
    }
  };

  const handlePlayRecommendedVideo = (vid: RecommendedVideo) => {
    const mockLesson: InteractiveLesson = {
      id: `rec-${vid.youtubeId}`,
      topic: selectedTopic,
      lessonNum: 0,
      totalLessons: 0,
      difficulty: 'Beginner',
      estimatedTime: '8-15 min',
      title: vid.title,
      keyConcepts: [],
      lecture: `Recommended creator video from ${vid.channel}`,
      analogy: '',
      miniExercise: '',
      quizQuestion: '',
      quizOptions: [],
      correctOptionIndex: 0,
      explanation: '',
      videoUrl: `https://www.youtube.com/embed/${vid.youtubeId}`
    };
    handlePlayVideo(mockLesson);
  };

  // Simulated live video watch progress incremental loop for both inline & modal
  useEffect(() => {
    let interval: any = null;
    if (modalIsPlaying && activeVideoModal) {
      interval = setInterval(() => {
        setModalProgress(prev => {
          if (prev >= 100) {
            setModalIsPlaying(false);
            clearInterval(interval);
            setWatchProgress(wp => {
              const updated = { ...wp, [activeVideoModal.id]: 100 };
              localStorage.setItem('gh_watch_progress', JSON.stringify(updated));
              return updated;
            });
            grantXP(50, `Completed video for "${activeVideoModal.title}"! 🎥`);
            triggerFlash(`🎉 100% Watched! You unlocked +50 Video Completion XP.`);
            return 100;
          }
          const next = Math.min(100, prev + 5); // 5% per second
          setWatchProgress(wp => {
            const updated = { ...wp, [activeVideoModal.id]: next };
            localStorage.setItem('gh_watch_progress', JSON.stringify(updated));
            return updated;
          });
          return next;
        });
      }, 1000);
    } else if (isPlaying) {
      interval = setInterval(() => {
        // Find current lesson ID safely
        const activeList = lessonsDatabase[selectedTopic] || lessonsDatabase['Linux'];
        const currentL = activeList[lessonIndex] || activeList[0];
        if (currentL) {
          setWatchProgress(prev => {
            const curP = prev[currentL.id] || 0;
            if (curP >= 100) {
              setIsPlaying(false);
              clearInterval(interval);
              grantXP(50, `Completed video for "${currentL.title}"! 🎥`);
              triggerFlash(`🎉 100% Watched! You unlocked +50 Video Completion XP.`);
              return { ...prev, [currentL.id]: 100 };
            }
            const nextP = Math.min(100, curP + 5); // 5% per second
            const updated = { ...prev, [currentL.id]: nextP };
            localStorage.setItem('gh_watch_progress', JSON.stringify(updated));
            return updated;
          });
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, modalIsPlaying, activeVideoModal, selectedTopic, lessonIndex]);

  // Listener for Voice Companion Custom Event
  useEffect(() => {
    const handleVoiceCommand = (e: Event) => {
      const customEvent = e as CustomEvent;
      const cmdText = (customEvent.detail?.text || "").toLowerCase();
      
      // Match "Teach me Linux", "Teach Docker" etc.
      if (cmdText.includes('teach me linux') || cmdText.includes('teach linux')) {
        setSubTab('assistant');
        setSelectedTopic('Linux');
        setLessonIndex(0);
        setAssistantMode('educational');
        triggerFlash('📚 Loaded Linux Essentials Classroom!');
      } else if (cmdText.includes('teach docker') || cmdText.includes('explain docker')) {
        setSubTab('assistant');
        setSelectedTopic('Docker');
        setLessonIndex(0);
        setAssistantMode('educational');
        triggerFlash('🐳 Loaded Docker Containerization Classroom!');
      } else if (cmdText.includes('teach kubernetes') || cmdText.includes('what is kubernetes') || cmdText.includes('explain kubernetes')) {
        setSubTab('assistant');
        setSelectedTopic('Kubernetes');
        setLessonIndex(0);
        setAssistantMode('educational');
        triggerFlash('☸️ Loaded Kubernetes Orchestration Classroom!');
      } else if (cmdText.includes('teach python') || cmdText.includes('explain recursion')) {
        setSubTab('assistant');
        setSelectedTopic('Python Basics');
        setLessonIndex(0);
        setAssistantMode('educational');
        triggerFlash('🐍 Loaded Python & Algorithms Classroom!');
      } else if (cmdText.includes('continue lesson') || cmdText.includes('continue learning')) {
        setSubTab('assistant');
        handleNextLesson();
      } else if (cmdText.includes('prepare me for placements') || cmdText.includes('prepare for placements') || cmdText.includes('placement')) {
        setSubTab('placement');
        triggerFlash('💼 Placement Preparation Hub activated!');
      } else if (cmdText.includes('generate python roadmap') || cmdText.includes('become full stack developer') || cmdText.includes('generate roadmap')) {
        setSubTab('roadmaps');
        const searchTopic = cmdText.includes('python') ? 'Python Basics' : cmdText.includes('full stack') ? 'Full Stack Web Development' : 'System Design';
        setTopicInput(searchTopic);
        triggerFlash(`🔮 Set Roadmap Prompt: "${searchTopic}"`);
      } else if (cmdText.includes('suggest projects')) {
        setSubTab('recommendations');
        // Scroll to projects
        setTimeout(() => {
          document.getElementById('project-recommendations-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else if (cmdText.includes('what should i learn next') || cmdText.includes('recommend skills')) {
        setSubTab('recommendations');
        triggerFlash('🔥 Analyzing your skills and priorities...');
      } else if (cmdText.includes('show my progress') || cmdText.includes('show progress')) {
        setSubTab('review');
        triggerFlash('📊 Loaded Sunday Growth Review!');
      } else if (cmdText.includes('resume learning') || cmdText.includes('resume roadmap')) {
        setSubTab('roadmaps');
        triggerFlash('🗺️ Opening active roadmaps...');
      }
    };

    window.addEventListener('growth-command', handleVoiceCommand);
    return () => {
      window.removeEventListener('growth-command', handleVoiceCommand);
    };
  }, [lessonIndex, selectedTopic]);

  const triggerFlash = (msg: string) => {
    setFlashMessage(msg);
    setTimeout(() => {
      setFlashMessage(null);
    }, 4500);
  };

  const grantXP = (amount: number, reason: string) => {
    addXP(amount, reason);
    if (reason.toLowerCase().includes('lesson') || reason.toLowerCase().includes('quiz')) {
      incrementStat('lessonsWatched', 1);
    }
    setXp(prev => {
      const nextXp = prev + amount;
      if (nextXp >= 1000) {
        setLevel(l => l + 1);
        triggerFlash(`⭐ LEVEL UP! You reached Level ${level + 1}! 🏆`);
        return nextXp - 1000;
      }
      triggerFlash(`🎉 +${amount} XP: ${reason}`);
      return nextXp;
    });
  };

  if (!profile) return null;

  // Professional AI Skill recommendations mapping
  const skillCategoryMapping = {
    Student: [
      { title: '🔥 Python Programming', score: 94, reason: 'Highly requested for software development internships.', duration: '8 weeks', difficulty: 'Beginner' },
      { title: '📦 Data Structures & Algorithms', score: 97, reason: 'Essential for passing elite technical placement reviews.', duration: '12 weeks', difficulty: 'Advanced' },
      { title: '🐧 Linux Commands', score: 89, reason: 'Prerequisite for system administrations and build setups.', duration: '4 weeks', difficulty: 'Beginner' },
      { title: '🛠️ Git & GitHub', score: 91, reason: 'Underpins all collaborative class projects.', duration: '2 weeks', difficulty: 'Beginner' },
      { title: '🐳 Docker Essentials', score: 86, reason: 'Adds huge resume weight for dev roles.', duration: '5 weeks', difficulty: 'Medium' },
      { title: '📊 SQL & Relational Databases', score: 92, reason: 'Required database mastery for full stack portfolios.', duration: '6 weeks', difficulty: 'Medium' },
      { title: '💻 System Design Basics', score: 83, reason: 'Differentiates your candidate profile during tech screens.', duration: '7 weeks', difficulty: 'Medium' },
      { title: '🌱 Open Source Contribution', score: 85, reason: 'Builds real public proof of software capability.', duration: '10 weeks', difficulty: 'Advanced' },
      { title: '🗣️ Effective Communication', score: 88, reason: 'Key to passing HR behavioral assessment phases.', duration: '3 weeks', difficulty: 'Beginner' },
      { title: '📝 Resume & Portfolio Building', score: 95, reason: 'First impressions are crucial for placement pipelines.', duration: '2 weeks', difficulty: 'Beginner' },
      { title: '🏆 Hackathon Prep', score: 84, reason: 'Compounding project development under strict time limits.', duration: '4 weeks', difficulty: 'Medium' }
    ],
    Designer: [
      { title: '🎨 UI/UX Design Fundamentals', score: 96, reason: 'Provides the visual architecture core.', duration: '6 weeks', difficulty: 'Beginner' },
      { title: '✏️ Advanced Figma Prototyping', score: 98, reason: 'Industry standard design workbench tool.', duration: '5 weeks', difficulty: 'Medium' },
      { title: '💡 Product Thinking & Strategy', score: 92, reason: 'Drives decision validation for digital products.', duration: '8 weeks', difficulty: 'Advanced' },
      { title: '💼 Case Study Writing', score: 90, reason: 'Creates stunning visual narratives for portfolios.', duration: '4 weeks', difficulty: 'Medium' },
      { title: '✨ Intro to Motion Design', score: 87, reason: 'Differentiates design outputs with micro-interactions.', duration: '6 weeks', difficulty: 'Medium' },
      { title: '🔬 User Research Methods', score: 93, reason: 'Grounds creative choices in objective tester feedback.', duration: '7 weeks', difficulty: 'Advanced' }
    ],
    Entrepreneur: [
      { title: '🚀 Lean Startup Validation', score: 95, reason: 'Guards against building unvalidated ideas.', duration: '4 weeks', difficulty: 'Medium' },
      { title: '📣 B2B Sales & Outbound', score: 91, reason: 'Crucial for immediate startup revenue generation.', duration: '6 weeks', difficulty: 'Medium' },
      { title: '📈 Venture Capital Fundraising', score: 88, reason: 'Prepares pitch desks and financial run rates.', duration: '8 weeks', difficulty: 'Advanced' },
      { title: '👥 Building High-Performing Teams', score: 94, reason: 'Unlocks operational delegation capabilities.', duration: '6 weeks', difficulty: 'Advanced' },
      { title: '⚡ growth Hacking Strategy', score: 93, reason: 'Acquires early user volumes with minimal budgets.', duration: '5 weeks', difficulty: 'Medium' },
      { title: '🗣️ Investor Storytelling', score: 97, reason: 'Nails the startup narrative for key partners.', duration: '4 weeks', difficulty: 'Beginner' }
    ],
    Professional: [
      { title: '👔 Servant Leadership', score: 93, reason: 'Positions you for senior management promotions.', duration: '6 weeks', difficulty: 'Medium' },
      { title: '🤖 AI Productivity Tools', score: 95, reason: 'Slashes weekly manual effort by up to 10 hours.', duration: '3 weeks', difficulty: 'Beginner' },
      { title: '🗓️ Senior Agile Project Management', score: 90, reason: 'Validates delivery of cross-team work loops.', duration: '8 weeks', difficulty: 'Advanced' },
      { title: '🎤 Tech Demo Public Speaking', score: 88, reason: 'Increases authority visibility among corporate stakeholders.', duration: '4 weeks', difficulty: 'Beginner' },
      { title: '🧱 Distributed Systems Design', score: 94, reason: 'Required architectural mastery for senior roles.', duration: '12 weeks', difficulty: 'Advanced' },
      { title: '🤝 Executive Networking', score: 86, reason: 'Opens doors to fast-track career opportunities.', duration: '3 weeks', difficulty: 'Beginner' }
    ]
  };

  // Predefined Career Paths definition
  const careerPaths: PredefinedCareer[] = [
    {
      id: 'swe',
      title: 'Software Engineer',
      timeline: '12 - 18 Months',
      difficulty: 'Advanced',
      skillsRequired: ['Python', 'DSA', 'SQL', 'System Design', 'Git', 'Linux'],
      certifications: ['AWS Certified Developer', 'Google Associate Cloud Engineer'],
      suggestedHabits: ['Solve 1 DSA daily', 'Review 1 system design architecture weekly', 'Code for 45 minutes without distractions'],
      schedule: '10 hours / week standard allocation',
      projects: ['Full-Stack SaaS Platform', 'Mini OS Shell Compiler']
    },
    {
      id: 'devops',
      title: 'DevOps Engineer',
      timeline: '9 - 12 Months',
      difficulty: 'Advanced',
      skillsRequired: ['Linux', 'Docker Basics', 'Kubernetes', 'CI/CD Pipelines', 'Terraform'],
      certifications: ['Certified Kubernetes Administrator (CKA)', 'AWS DevOps Engineer Professional'],
      suggestedHabits: ['Automate 1 manual task weekly', 'Read Linux release notes', 'Analyze security logs'],
      schedule: '8 hours / week intensive labs',
      projects: ['Highly-Available Dockerized Cluster', 'Terraform Cloud Infrastructure Blueprint']
    },
    {
      id: 'ai_ml',
      title: 'AI / ML Engineer',
      timeline: '18 - 24 Months',
      difficulty: 'Advanced',
      skillsRequired: ['Python', 'Linear Algebra & Statistics', 'TensorFlow/PyTorch', 'Gemini SDK', 'NLP'],
      certifications: ['Google Professional Machine Learning Engineer', 'TensorFlow Developer Certificate'],
      suggestedHabits: ['Read 1 AI research paper weekly', 'Train/tune 1 model in notebook weekly'],
      schedule: '12 hours / week heavy math and programming',
      projects: ['AI Resume Analyzer Bot', 'Predictive Model API Pipeline']
    },
    {
      id: 'ux_designer',
      title: 'UX Designer',
      timeline: '6 - 9 Months',
      difficulty: 'Intermediate',
      skillsRequired: ['UI/UX Principles', 'Advanced Figma', 'User Research', 'Framer / Motion'],
      certifications: ['Google UX Design Certificate', 'Interaction Design Foundation Cert'],
      suggestedHabits: ['Deconstruct 1 mobile app UI daily', 'Sketch 3 layout alternatives daily'],
      schedule: '6 hours / week design studio',
      projects: ['Comprehensive Portfolio Website', 'E-Commerce Mobile App Redesign']
    },
    {
      id: 'founder',
      title: 'Founder / Tech Entrepreneur',
      timeline: 'Ongoing Journey',
      difficulty: 'Advanced',
      skillsRequired: ['Lean Validation', 'Sales & Pitching', 'KPI Tracking', 'Product Strategy'],
      certifications: ['Y Combinator Startup School Certificate'],
      suggestedHabits: ['Talk to 3 active users weekly', 'Analyze weekly cohort retention stats'],
      schedule: '15+ hours / week high initiative',
      projects: ['Launch MVP Platform', 'Validate Seed Pitch deck']
    }
  ];

  // Industry Projects recommendations
  const recommendedProjects: RecommendedProject[] = [
    {
      title: "Interactive Resume Analyzer Bot",
      difficulty: "Intermediate",
      skillsCovered: ["Python Basics", "Gemini API SDK", "NLP Frameworks"],
      duration: "3 weeks",
      resumeValue: "Very High",
      industryRelevance: "Critical for AI-powered SaaS recruitment tooling.",
      description: "Build an API that parses resumes and checks fit parameters against a specific job role description using Gemini NLP logic."
    },
    {
      title: "Custom Mini OS Terminal Shell",
      difficulty: "Advanced",
      skillsCovered: ["Linux Permissions", "System Calls", "Process Orchestration"],
      duration: "4 weeks",
      resumeValue: "Very High",
      industryRelevance: "Demands deep systems programming competency.",
      description: "Code a custom terminal prompt tool capable of spawning children processes, handling file descriptors, and pipes."
    },
    {
      title: "High-Traffic Expense Tracker Dashboard",
      difficulty: "Intermediate",
      skillsCovered: ["React Components", "State Management", "Tailwind CSS"],
      duration: "2 weeks",
      resumeValue: "High",
      industryRelevance: "Proves competency in building reactive real-time stateful dashboards.",
      description: "Construct a financial workspace complete with bento cards, spending reviews, and responsive graph representations."
    },
    {
      title: "Dockerized Load-Balanced Web Engine",
      difficulty: "Intermediate",
      skillsCovered: ["Docker Containers", "Nginx Reverse Proxy", "Linux Scripts"],
      duration: "2 weeks",
      resumeValue: "High",
      industryRelevance: "Core cloud engineering capability.",
      description: "Set up containerized Node servers behind an Nginx gateway, configuring health checks and script automation."
    }
  ];

  // Static rich course syllabus database for interactive tutor
  const lessonsDatabase: Record<string, InteractiveLesson[]> = {
    'Python': [
      {
        id: 'py-1',
        topic: 'Python',
        lessonNum: 1,
        totalLessons: 2,
        difficulty: 'Beginner',
        estimatedTime: '10 min',
        title: 'Variables & Control Flow',
        keyConcepts: ['Variables', 'Indentation', 'If-Else', 'Loops'],
        lecture: `Python is famous for its elegant syntax and readability. It does not use brackets or semicolons; instead, it uses strictly enforced indentation spaces.\n\nTo define variables, assign a value directly (e.g., \`score = 100\`). Use \`if-else\` blocks and \`for\` or \`while\` loops to govern code execution flow. For example:\n\`\`\`python\nif score >= 90:\n    print("Excellent!")\n\`\`\`\nIndentation is 4 spaces by standard convention.`,
        analogy: 'Indentation in Python is like indenting a paragraph when starting a new section in writing—except in Python, the computer reads it as structural boundaries.',
        miniExercise: 'Write a python line checking if a value x is greater than 10.',
        exercises: [
          'Create an if-else block checking if a user has a learning streak above 5 days.',
          'Implement a simple for loop iterating over a list of numbers from 1 to 5.'
        ],
        quizQuestion: 'How does Python determine the start and end of blocks of code like inside a loop or function?',
        quizOptions: ['Curly brackets {}', 'Semicolons ;', 'Strict whitespace indentation', 'Parentheses ()'],
        correctOptionIndex: 2,
        explanation: 'Python uses strict indentation spaces to establish blocks of code instead of curly braces.',
        notes: `• Variable declaration in Python does not require keyword modifiers like 'var' or 'let' (JavaScript). It is completely dynamic and context-driven.`,
        youtubeEmbedId: 'kqtD5dpn9C8',
        videoUrl: 'https://www.youtube-nocookie.com/embed/kqtD5dpn9C8',
        recommendedVideos: [
          { title: 'Python for Beginners Course', channel: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', youtubeId: 'rfscVS0vtbw' }
        ],
        aiResources: [
          'Kunal Kushwaha: Python Coding Foundations & Git',
          'Andrew Ng: Machine Learning For Everyone',
          'NeetCode: Elite Coding Interview Cheat-Sheets'
        ]
      },
      {
        id: 'py-2',
        topic: 'Python',
        lessonNum: 2,
        totalLessons: 2,
        difficulty: 'Medium',
        estimatedTime: '15 min',
        title: 'Object-Oriented Programming (OOP)',
        keyConcepts: ['Classes', 'Objects', 'Inheritance', 'Self Keyword'],
        lecture: `OOP allows developers to group data and methods into logical structures called Classes.\n\nIn Python, you define a class with the \`class\` keyword, and initialize its attributes inside the special \`__init__\` method, using the \`self\` keyword to refer to the current object instance.\n\n\`\`\`python\nclass Developer:\n    def __init__(self, name):\n        self.name = name\n\`\`\``,
        analogy: 'A Class is like a blueprint for a house, and an Object is the actual built physical house constructed based on that blueprint.',
        miniExercise: 'Define a simple class named Animal with an __init__ method.',
        exercises: [
          'Create a class named Rectangle with width and height properties.',
          'Add an area() method returning width * height.'
        ],
        quizQuestion: 'What special method is used in Python classes to initialize newly created objects?',
        quizOptions: ['__new__', '__init__', 'constructor', 'self'],
        correctOptionIndex: 1,
        explanation: 'The special method __init__ acts as the constructor in Python classes, configuring default attributes upon object initialization.',
        notes: `• Classes can inherit from other classes using: class Dog(Animal):\n• Private variables in Python are marked with double underscores (e.g., self.__private_var).`,
        youtubeEmbedId: 'kqtD5dpn9C8',
        videoUrl: 'https://www.youtube-nocookie.com/embed/kqtD5dpn9C8',
        recommendedVideos: [
          { title: 'Python OOP Tutorial', channel: 'TechWithTim', url: 'https://www.youtube.com/watch?v=8yjkWGRlUmY', youtubeId: '8yjkWGRlUmY' }
        ],
        aiResources: [
          'Official Python Documentation: Classes',
          'OOP Best Practices & Solid Principles in Python'
        ]
      }
    ],
    'Linux': [
      {
        id: 'lin-1',
        topic: 'Linux',
        lessonNum: 1,
        totalLessons: 4,
        difficulty: 'Beginner',
        estimatedTime: '10 min',
        title: 'Navigating the Command Line Interface',
        keyConcepts: ['CLI', 'Terminal', 'Shell', 'File System Tree'],
        lecture: `Welcome to Linux. The Command Line Interface (CLI) is not just a retro text tool—it's a direct, scriptable pathway to your server core.\n\nIn Linux, everything is structured as a single massive root-tree starting with a simple forward slash: \`/\`. Unlike Windows with separate \`C:\` or \`D:\` drives, Linux mounts all drives and files into this unified tree.\n\nTo move around and list contents, we use three absolute commands:\n1. \`pwd\`: Print Working Directory. Shows exactly where you stand inside the tree.\n2. \`ls\`: List. Shows what directories or files reside in your current folder.\n3. \`cd\`: Change Directory. Lets you walk up or down folders.\n\nFor example, typing \`cd /var/log\` takes you to the logs root. Typing \`pwd\` will then output \`/var/log\`.`,
        analogy: 'Think of the Linux terminal like driving a manual transmission car. It requires more effort to learn than an automatic dashboard GUI, but it gives you total control over the raw engine speed.',
        miniExercise: 'Type "cd /" in a terminal to jump to root, then run "ls" to inspect system files.',
        exercises: [
          'Open your local shell or web console and run "pwd" to print your active directory.',
          'Type "cd /" to access the absolute system root folder.',
          'Run "ls -la" to view all system folders and hidden files in detail.'
        ],
        quizQuestion: 'Which Linux command is used to display the full filepath of the folder you are currently in?',
        quizOptions: ['ls', 'cd', 'pwd', 'whoami'],
        correctOptionIndex: 2,
        explanation: 'The command "pwd" stands for Print Working Directory, which prints the absolute file path of your current session folder.',
        notes: `• Standard Linux folders: "/bin" contains essential user binaries, "/etc" contains system-wide configuration files, and "/var" contains variables files like system logs.\n• Absolute paths start with "/", while relative paths refer to folders from your current active directory.`,
        youtubeEmbedId: 'sWbUDq4S6Y8',
        videoUrl: 'https://www.youtube-nocookie.com/embed/sWbUDq4S6Y8',
        recommendedVideos: [
          { title: 'Linux for Beginners Course', channel: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=wbpMiQR_QDo', youtubeId: 'wbpMiQR_QDo' },
          { title: 'Linux Crash Course for Beginners', channel: 'Traversy Media', url: 'https://www.youtube.com/watch?v=v_190t99_uI', youtubeId: 'v_190t99_uI' }
        ],
        aiResources: [
          'Fireship: Linux in 100 Seconds',
          'GNU/Linux Core Utilities Documentation',
          'The Primeagen: Developer Terminal Customization Guides'
        ],
        quizzes: [
          {
            question: 'Which character represents the absolute root level directory in Linux?',
            options: ['~', '/', '.', '..'],
            correctIndex: 1,
            explanation: 'The forward slash "/" is the root directory in the Linux hierarchical file system.'
          },
          {
            question: 'What is the utility of the "cd" command?',
            options: ['Create Directory', 'Change Directory', 'Compile Driver', 'Clear Dashboard'],
            correctIndex: 1,
            explanation: 'The "cd" command changes the current working directory to a specified pathway.'
          }
        ]
      },
      {
        id: 'lin-2',
        topic: 'Linux',
        lessonNum: 2,
        totalLessons: 4,
        difficulty: 'Beginner',
        estimatedTime: '15 min',
        title: 'Working with Files & Folders',
        keyConcepts: ['mkdir', 'touch', 'rm', 'cp', 'mv'],
        lecture: `Managing files is the heart of automation. In Linux, there are strict tools for creating, duplicating, moving, and removing files:\n\n* \`touch filename\`: Instantly creates an empty text file or updates its access timestamp.\n* \`mkdir foldername\`: Creates a brand new directory.\n* \`cp source destination\`: Copies files from source to destination.\n* \`mv source destination\`: Moves or *renames* files.\n* \`rm filename\`: Deletes a file. Caution: there is NO recycle bin in raw server shells. Deletions are instantaneous and permanent.\n* \`rm -rf foldername\`: Recursively and forcefully deletes an entire directory tree.`,
        analogy: 'Imagine "touch" like dropping a blank piece of paper on your desk, "mkdir" like placing an empty folder box, and "rm -rf" like throwing the entire cabinet into an incinerator.',
        miniExercise: 'Touch a file named "note.txt", rename it to "memo.txt" using mv, and then delete it.',
        exercises: [
          'Create a directory named "lifepilot_playground" with mkdir.',
          'Create a blank file named "log.txt" inside it using touch.',
          'Copy "log.txt" to a new file named "archive.txt" using cp.'
        ],
        quizQuestion: 'What flag is combined with "rm" to forcefully and recursively delete an entire directory?',
        quizOptions: ['-f', '-r', '-rf', '-dir'],
        correctOptionIndex: 2,
        explanation: 'Combining "-r" (recursive) and "-f" (force) allows "rm" to delete files and folders without prompting for confirmation.',
        notes: `• Use "rm -rf" with extreme care. Running "rm -rf /" will wipe out the entire operating system permanently.\n• The "mv" command performs a file rename if the destination path is in the same folder with a different filename.`,
        youtubeEmbedId: 'sWbUDq4S6Y8',
        videoUrl: 'https://www.youtube-nocookie.com/embed/sWbUDq4S6Y8',
        recommendedVideos: [
          { title: 'The Linux Directory Structure Explained', channel: 'Fireship', url: 'https://www.youtube.com/watch?v=428989_ab', youtubeId: 'a8H_6x3x7X0' },
          { title: 'Bash Scripting Crash Course', channel: 'Traversy Media', url: 'https://www.youtube.com/watch?v=tK91a826Q-g', youtubeId: 'tK91a826Q-g' }
        ],
        aiResources: [
          'NetworkChuck: Linux Labs and Automation',
          'Bash Shell Scripting Handbook',
          'Kunal Kushwaha: Linux Filesystem Core Principles'
        ],
        quizzes: [
          {
            question: 'Which of these commands is used to create a new folder/directory?',
            options: ['touch', 'mkdir', 'mkfolder', 'dir'],
            correctIndex: 1,
            explanation: '"mkdir" stands for Make Directory.'
          }
        ]
      },
      {
        id: 'lin-3',
        topic: 'Linux',
        lessonNum: 3,
        totalLessons: 4,
        difficulty: 'Medium',
        estimatedTime: '15 min',
        title: 'Linux Permissions Explained (rwx)',
        keyConcepts: ['chmod', 'chown', 'groups', 'permissions', 'rwx'],
        lecture: `Linux is fundamentally a multi-user OS. Every single file has strict ownership rules divided into three user tiers:\n1. **User (Owner)**: The specific person who owns the file.\n2. **Group**: A team of users sharing similar authorization levels.\n3. **Others**: Anyone else on the network.\n\nEach tier can have up to three rights represented by letters:\n* \`r\` (Read - value 4): Permissions to view the file content.\n* \`w\` (Write - value 2): Permissions to modify or delete the file.\n* \`x\` (Execute - value 1): Permissions to run the file as an application.\n\nThese represent an octal score. E.g., read (4) + write (2) + execute (1) = \`7\` (Full permissions). \n* Command \`chmod 755 script.sh\` sets rwx for Owner, and rx for Group/Others.\n* Command \`chown username filename\` changes owner.`,
        analogy: 'Think of file permissions like a VIP club guest list. You can read the flyer (r), write a reservation (w), or enter the VIP lounge (x) based on your wristband color tier.',
        miniExercise: 'Type "ls -l" in terminal to see the permissions strings (like -rwxr-xr-x) for files.',
        exercises: [
          'Run "ls -l" in any terminal and read the permissions string for existing files.',
          'Create a shell script and make it executable using "chmod +x script.sh".',
          'Verify that the file is marked with green executable status.'
        ],
        quizQuestion: 'If a file has octal permissions set to 755, what rights does the general group or "others" have?',
        quizOptions: ['Read and Write only', 'Read and Execute only', 'Full permissions (rwx)', 'No permissions at all'],
        correctOptionIndex: 1,
        explanation: 'Octal 755 breaks down to: Owner = 7 (rwx), Group = 5 (r-x, read/execute), Others = 5 (r-x, read/execute).',
        notes: `• "chmod 644" is standard for public files: Read/Write for owner, and Read-only for group and others.\n• "chmod 700" is standard for high-security files: Full access for owner, and completely hidden from the rest of the ecosystem.`,
        youtubeEmbedId: 'sWbUDq4S6Y8',
        videoUrl: 'https://www.youtube-nocookie.com/embed/sWbUDq4S6Y8',
        recommendedVideos: [
          { title: 'Linux Permissions Tutorial', channel: 'NetworkChuck', url: 'https://www.youtube.com/watch?v=5p4YreDCH7M', youtubeId: '5p4YreDCH7M' }
        ],
        aiResources: [
          'interactive chmod octal calculator online',
          'Striver: Operating Systems (OS) Comprehensive Guide',
          'TechWorld with Nana: DevOps Security Principles'
        ]
      },
      {
        id: 'lin-4',
        topic: 'Linux',
        lessonNum: 4,
        totalLessons: 4,
        difficulty: 'Medium',
        estimatedTime: '20 min',
        title: 'Package Managers & Automations',
        keyConcepts: ['apt', 'yum', 'cron', 'systemctl'],
        lecture: `Instead of downloading installers manually, Linux leverages centralized packages repositories:\n* \`apt update && apt install nginx\`: Syncs Nginx web server into your machine instantly (Ubuntu/Debian).\n\nTo automate repeating routines, we use the Cron scheduler:\n* Edited via \`crontab -e\`\n* Format: \`* * * * * command_to_run\` (Minutes Hours Days Month DayOfWeek).\n* For instance, \`0 0 * * * /backup.sh\` runs your script exactly at midnight daily.\n\nTo control active background processes (daemons), we use systemd: \`systemctl start nginx\` or \`systemctl enable nginx\`.`,
        analogy: 'Imagine apt as a secure App Store built directly into your server dashboard. Cron is like setting an alarm on your phone to trigger a specific automated action every morning.',
        miniExercise: 'Write a cron line that triggers a script at 5 AM every Monday: "0 5 * * 1 /my_script.sh".',
        exercises: [
          'Run "crontab -l" to check if you have any existing automated cron jobs running.',
          'Learn the 5-field system of Cron: Minute Hour DayOfMonth Month DayOfWeek.',
          'Read about systemctl status checks.'
        ],
        quizQuestion: 'Which background utility is used to schedule recurring automated tasks in Linux?',
        quizOptions: ['systemctl', 'cron', 'apt', 'bash'],
        correctOptionIndex: 1,
        explanation: 'Cron is the standard background scheduler in Unix-like operating systems designed to run command routines periodically.',
        notes: `• Use "systemctl enable [service]" to configure a daemon process to automatically launch upon virtual machine reboot.`,
        youtubeEmbedId: 'sWbUDq4S6Y8',
        videoUrl: 'https://www.youtube-nocookie.com/embed/sWbUDq4S6Y8',
        recommendedVideos: [
          { title: 'DevOps Basics for Beginners', channel: 'TechWorld with Nana', url: 'https://www.youtube.com/watch?v=k4CHeV_M1-A', youtubeId: 'k4CHeV_M1-A' }
        ],
        aiResources: [
          'CronTab.guru - The interactive cron expression editor',
          'Striver Linux Shell Scripting Mastery Playlists'
        ]
      }
    ],
    'Git': [
      {
        id: 'git-1',
        topic: 'Git',
        lessonNum: 1,
        totalLessons: 2,
        difficulty: 'Beginner',
        estimatedTime: '12 min',
        title: 'Version Control Basics',
        keyConcepts: ['Repository', 'Commit', 'Staging', 'Working Directory'],
        lecture: `Git is a distributed version control system. It tracks code modifications in snapshots called Commits.\n\nYour file workflow has three main stages:\n1. Working Directory: The actual files you are editing.\n2. Staging Area (Index): A preparation area where files are listed before commitment.\n3. Repository: The finalized historic database of commits.\n\nUse \`git init\` to initialize a new repository, \`git add filename\` to stage changes, and \`git commit -m "message"\` to record changes securely.`,
        analogy: 'Think of Git like taking family photos. The staging area is posing everyone in their seats, and the commit is pressing the camera shutter button to capture the photograph forever.',
        miniExercise: 'Type "git status" inside a project terminal to inspect staged vs unstaged code edits.',
        exercises: [
          'Initialize a local git repository inside an empty test folder using "git init".',
          'Create a file, stage it with "git add .", and record your first commit with a clear description message.'
        ],
        quizQuestion: 'Which command is used to transition edited files from the working directory into the staging area in Git?',
        quizOptions: ['git stage', 'git commit', 'git add', 'git save'],
        correctOptionIndex: 2,
        explanation: 'The "git add" command prepares file edits for commitment by adding them to the intermediate staging index.',
        notes: `• Commits in Git are uniquely identified by a 40-character SHA-1 hash check.\n• Use ".gitignore" to exclude sensitive environment secrets and heavy node_modules packages from source control.`,
        youtubeEmbedId: 'RGOj5yH7evk',
        videoUrl: 'https://www.youtube-nocookie.com/embed/RGOj5yH7evk',
        recommendedVideos: [
          { title: 'Git & GitHub Crash Course', channel: 'Traversy Media', url: 'https://www.youtube.com/watch?v=apGV9Ad7XYY', youtubeId: 'apGV9Ad7XYY' }
        ],
        aiResources: [
          'Pro Git Book Official Documentation',
          'Learn Git Branching (Interactive Sandbox Playground)'
        ]
      },
      {
        id: 'git-2',
        topic: 'Git',
        lessonNum: 2,
        totalLessons: 2,
        difficulty: 'Medium',
        estimatedTime: '15 min',
        title: 'Branching, Merging & Collaboration',
        keyConcepts: ['Branch', 'Merge', 'Remote', 'Clone'],
        lecture: `Branching is Git's superpower. It allows you to duplicate your primary code tree (the master or main branch) into sandbox timelines where you can develop features safely without breaking the production build.\n\n* \`git branch feature-name\`: Creates a branch.\n* \`git checkout feature-name\`: Switches to that branch.\n* \`git merge feature-name\`: Integrates changes back to the primary main branch.`,
        analogy: 'Imagine a choose-your-own-adventure book. Branching creates separate chapters. Merging is joining those story branches back into a single definitive ending.',
        miniExercise: 'Create a branch named "dev-sandbox" using "git branch dev-sandbox".',
        exercises: [
          'Create and switch to a feature branch, execute standard code edits, and merge it back to master.',
          'Configure a remote repository link using git remote add origin.'
        ],
        quizQuestion: 'Which command allows you to merge sandboxed changes from a feature branch back into the active main branch?',
        quizOptions: ['git combine', 'git merge', 'git push', 'git pull'],
        correctOptionIndex: 1,
        explanation: 'The "git merge" command reconciles divergent lines of work by uniting independent branches into a single flow.',
        notes: `• Use "git rebase" to rewrite git commits history for cleaner PR lines.\n• Resolve merge conflicts carefully inside VSCode by reviewing standard HEAD delimiters.`,
        youtubeEmbedId: 'RGOj5yH7evk',
        videoUrl: 'https://www.youtube-nocookie.com/embed/RGOj5yH7evk',
        recommendedVideos: [
          { title: 'Git Branching Explained', channel: 'Fireship', url: 'https://www.youtube.com/watch?v=hwVvxSgbi6I', youtubeId: 'hwVvxSgbi6I' }
        ],
        aiResources: [
          'Fireship: Advanced Git Mastery Guides',
          'Atlassian Git Collaboration Workflows & Best Practices'
        ]
      }
    ],
    'Docker': [
      {
        id: 'doc-1',
        topic: 'Docker',
        lessonNum: 1,
        totalLessons: 2,
        difficulty: 'Medium',
        estimatedTime: '12 min',
        title: 'Containers vs. Virtual Machines',
        keyConcepts: ['Docker Engine', 'Hypervisor', 'Shared Kernel', 'Isolation'],
        lecture: `Have you ever heard the excuse: "Well, it worked on my machine"? Docker solves this classic problem.\n\nUnlike traditional Virtual Machines (VMs) which require a massive guest operating system, Docker shares the host machine's OS kernel. Containers are ultra-lightweight isolated pockets containing only your app code and runtime requirements.\n\nThis means while a VM takes minutes to boot and consumes gigabytes of memory, a Docker container boots in milliseconds and uses megabytes.`,
        analogy: 'Think of Virtual Machines like standalone family houses (heavy, private foundations). Containers are like apartments in a single high-rise building (shared plumbing/kernel, but fully locked individual doors).',
        miniExercise: 'Run "docker version" to verify the client-server Docker engine is running.',
        exercises: [
          'Inspect the Docker Desktop or CLI status using the command line.',
          'List active containers running on your local machine with "docker ps".'
        ],
        quizQuestion: 'Why are Docker containers so much lighter and faster than full Virtual Machines?',
        quizOptions: ['They use a custom compression protocol', 'They share the host operating system kernel instead of booting a full guest OS', 'They run only on Linux host machines', 'They do not require physical RAM allocation'],
        correctOptionIndex: 1,
        explanation: 'Docker bypasses the hypervisor hyper-heavy layer by isolation processes on top of the host\'s shared OS kernel.',
        notes: `• Docker Hub is the global warehouse holding pre-configured base environments for Node, Python, Java, Postgres, Redis, and thousands more.`,
        youtubeEmbedId: '3c-iBn73dDE',
        videoUrl: 'https://www.youtube-nocookie.com/embed/3c-iBn73dDE',
        recommendedVideos: [
          { title: 'Docker Tutorial for Beginners', channel: 'TechWorld with Nana', url: 'https://www.youtube.com/watch?v=pTFZFxd4hOI', youtubeId: 'pTFZFxd4hOI' }
        ],
        aiResources: [
          'Docker Core Engine Architecture Blueprints',
          'Kunal Kushwaha: Containerization Deep Dive'
        ]
      },
      {
        id: 'doc-2',
        topic: 'Docker',
        lessonNum: 2,
        totalLessons: 2,
        difficulty: 'Medium',
        estimatedTime: '15 min',
        title: 'The Dockerfile: Building App Blueprints',
        keyConcepts: ['Dockerfile', 'FROM', 'RUN', 'COPY', 'CMD'],
        lecture: `To create a container, we write a single receipt file named \`Dockerfile\`. It compiles into an executable "Image".\n\nHere is a simple example for a Node application:\n\n\`\`\`dockerfile\n# Base Image\nFROM node:18-alpine\n\n# Working directory inside container\nWORKDIR /app\n\n# Copy project files\nCOPY . .\n\n# Install dependency packages\nRUN npm install\n\n# Port exposure declaration\nEXPOSE 3000\n\n# Command to start application\nCMD ["node", "index.js"]\n\`\`\`\n\nYou compile this file using: \`docker build -t my-app .\`\nYou run it using: \`docker run -p 3000:3000 my-app\`.`,
        analogy: 'Imagine the Dockerfile like a cake recipe. The Image is the frozen cake box in the supermarket (compiled blueprint). The running Container is the baked, edible cake sitting on your kitchen table.',
        miniExercise: 'Inspect a package.json to see what base image and scripts are needed for your next container blueprint.',
        exercises: [
          'Write a custom Dockerfile blueprint for an HTML static file server.',
          'Define port 80 as the public exposure gate inside the container settings.'
        ],
        quizQuestion: 'Which command instruction inside a Dockerfile defines the default executable command run when the container starts?',
        quizOptions: ['RUN', 'COPY', 'CMD', 'FROM'],
        correctOptionIndex: 2,
        explanation: 'CMD (Command) sets the default runtime executable for a container. RUN runs during the build step to configure the image layers.',
        notes: `• Every single instruction in a Dockerfile creates an intermediate cached layer. Order commands from least-frequently-changed to most-frequently-changed to save compilation time.`,
        youtubeEmbedId: '3c-iBn73dDE',
        videoUrl: 'https://www.youtube-nocookie.com/embed/3c-iBn73dDE',
        recommendedVideos: [
          { title: 'Docker Crash Course for Beginners', channel: 'Traversy Media', url: 'https://www.youtube.com/watch?v=3c-iM_9pHyc', youtubeId: '3c-iM_9pHyc' }
        ],
        aiResources: [
          'Fireship: Advanced Dockerfile Techniques',
          'Dive: The tool for exploring Docker image layers'
        ]
      }
    ],
    'React': [
      {
        id: 'react-1',
        topic: 'React',
        lessonNum: 1,
        totalLessons: 2,
        difficulty: 'Beginner',
        estimatedTime: '15 min',
        title: 'Introduction to React & Virtual DOM',
        keyConcepts: ['Components', 'JSX', 'Virtual DOM', 'Props'],
        lecture: `React is a component-driven user interface library. It allows you to build modular, self-contained widgets using JSX (a syntax extension combining HTML and JavaScript).\n\nRather than repainting the entire page layout when changes occur (which is computationally expensive), React maintains an in-memory lightweight representation called the Virtual DOM. It calculates differences and updates only the altered DOM nodes, yielding remarkable performance.`,
        analogy: 'Think of the Virtual DOM like a blueprint draft. If you change a room layout, you don\'t rebuild the whole house; you update the paper draft, find the difference, and modify only that specific room.',
        miniExercise: 'Create a simple React component returning a heading: const Hello = () => <h1>Hello</h1>;',
        exercises: [
          'Design a functional component "UserCard" that accepts userName as a prop and renders a neat card.',
          'Compose multiple components inside App.tsx to see nesting hierarchies in practice.'
        ],
        quizQuestion: 'Why is React\'s Virtual DOM faster than traditional full-page HTML browser DOM updates?',
        quizOptions: ['It stores files on secondary cache drives', 'It computes layout changes in memory and updates only modified elements', 'It converts all code to assembly', 'It runs inside web workers background processes'],
        correctOptionIndex: 1,
        explanation: 'The Virtual DOM computes minimum required modifications to sync state changes, updating only the affected DOM branches.',
        notes: `• Props are completely immutable; they flow unidirectionally from parent containers down to child components.`,
        youtubeEmbedId: 'bMknfKXIFA8',
        videoUrl: 'https://www.youtube-nocookie.com/embed/bMknfKXIFA8',
        recommendedVideos: [
          { title: 'React JS Full Course', channel: 'Programming with Mosh', url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0', youtubeId: 'Ke90Tje7VS0' }
        ],
        aiResources: [
          'Official React.dev Reference Documentation',
          'Fireship: React JS in 100 Seconds'
        ]
      },
      {
        id: 'react-2',
        topic: 'React',
        lessonNum: 2,
        totalLessons: 2,
        difficulty: 'Medium',
        estimatedTime: '18 min',
        title: 'React State & Hook Lifecycle',
        keyConcepts: ['useState', 'useEffect', 'Hooks', 'State Management'],
        lecture: `State represents active data that changes over time inside your application. Hooks (like \`useState\` and \`useEffect\`) let you tap into component lifecycle states.\n\n* \`useState(initialValue)\` returns the current state and a modifier function to trigger re-renders.\n* \`useEffect(callback, dependencyArray)\` schedules a side-effect function to execute after the browser paint finishes.`,
        analogy: 'State is like a digital watch screen. Modifying the clock time (updating state) instantly causes the watch UI numbers to repaint (re-render) to show the new value.',
        miniExercise: 'Declare a state variable named "count" initialized to zero.',
        exercises: [
          'Implement a button counter that updates active state value upon cursor hover.',
          'Build a component that fetches system statistics via useEffect hook upon page load.'
        ],
        quizQuestion: 'Which React hook is used to handle side effects like data fetching or DOM subscriptions in functional components?',
        quizOptions: ['useState', 'useRef', 'useEffect', 'useReducer'],
        correctOptionIndex: 2,
        explanation: 'The "useEffect" hook is designed specifically to capture side effects and coordinate execution with state dependency arrays.',
        notes: `• Always supply dependencies inside your useEffect hook to prevent infinite component re-renders.`,
        youtubeEmbedId: 'bMknfKXIFA8',
        videoUrl: 'https://www.youtube-nocookie.com/embed/bMknfKXIFA8',
        recommendedVideos: [
          { title: 'React Hooks Crash Course', channel: 'Traversy Media', url: 'https://www.youtube.com/watch?v=w7ejDZ8dBjY', youtubeId: 'w7ejDZ8dBjY' }
        ],
        aiResources: [
          'Robin Wieruch: Advanced React State Patterns',
          'Web Dev Simplified: Hooks Demystified'
        ]
      }
    ],
    'DSA': [
      {
        id: 'dsa-1',
        topic: 'DSA',
        lessonNum: 1,
        totalLessons: 2,
        difficulty: 'Medium',
        estimatedTime: '20 min',
        title: 'Core Data Structures (Arrays & Lists)',
        keyConcepts: ['Arrays', 'Complexity', 'Big O Notation', 'Pointer Mechanics'],
        lecture: `Data Structures are organized methods for storing and retrieving computational data. The most foundational is the Array—a contiguous memory block storing items under sequential indices.\n\nWe analyze algorithms using Big O Notation, which measures scaling efficiency:\n* \`O(1)\`: Constant time (array read via index)\n* \`O(N)\`: Linear time (searching for an item in unsorted lists)\n* \`O(N log N)\`: Sorting time (Merge/Quick sort)`,
        analogy: 'An Array is like a post office drawer box. Knowing the box number lets you grab your letter instantly (O(1)). Searching without the box number means checking every single drawer in order (O(N)).',
        miniExercise: 'Write down the Big O lookup time for retrieving an element in an array by index.',
        exercises: [
          'Implement a function to search for an element in an unsorted list and analyze its complexity.',
          'Calculate memory offsets for multidimensional matrices'
        ],
        quizQuestion: 'What is the time complexity (Big O Notation) for accessing an element in an array at a specific known index?',
        quizOptions: ['O(1)', 'O(N)', 'O(log N)', 'O(N^2)'],
        correctOptionIndex: 0,
        explanation: 'Array lookups are O(1) constant time operations because computer memory can jump directly to the target address calculated using the index offset.',
        notes: `• Static arrays have a fixed size; dynamic arrays automatically double their capacity behind the scenes upon hitting bounds.`,
        youtubeEmbedId: '8hly31xKli0',
        videoUrl: 'https://www.youtube-nocookie.com/embed/8hly31xKli0',
        recommendedVideos: [
          { title: 'Data Structures and Algorithms Course', channel: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=8hly31xKjBY', youtubeId: '8hly31xKjBY' }
        ],
        aiResources: [
          'GeeksforGeeks Data Structures Handbook',
          'LeetCode Starter Roadmap'
        ]
      },
      {
        id: 'dsa-2',
        topic: 'DSA',
        lessonNum: 2,
        totalLessons: 2,
        difficulty: 'Advanced',
        estimatedTime: '20 min',
        title: 'Sorting Algorithms & Recursion',
        keyConcepts: ['Recursion', 'Divide and Conquer', 'Merge Sort', 'Quick Sort'],
        lecture: `Recursion is a programming technique where a function calls itself to solve smaller subdivisions of the same problem.\n\nFamous divide-and-conquer sorting algorithms like Merge Sort recursively divide an array into halves, sort them independently, and merge the sorted results in O(N log N) time, drastically outperforming nested loop bubble-sort algorithms which require O(N^2) operations.`,
        analogy: 'Think of sorting a large deck of cards. Instead of sorting all cards at once, split the deck into two piles, ask two helpers to sort their half recursively, and then merge the two sorted halves.',
        miniExercise: 'Identify the base case of a recursive factorial function.',
        exercises: [
          'Write a recursive Fibonacci solver and analyze its stack-frame footprint.',
          'Implement a manual Merge Sort in TypeScript.'
        ],
        quizQuestion: 'What is the average time complexity of the highly optimized Merge Sort algorithm?',
        quizOptions: ['O(1)', 'O(N)', 'O(N log N)', 'O(N^2)'],
        correctOptionIndex: 2,
        explanation: 'Merge Sort divides arrays into sub-arrays (log N steps) and merges elements back together (N steps), yielding an O(N log N) runtime complexity.',
        notes: `• Recursion without a base case triggers infinite execution, resulting in Stack Overflow crash errors.`,
        youtubeEmbedId: '8hly31xKli0',
        videoUrl: 'https://www.youtube-nocookie.com/embed/8hly31xKli0',
        recommendedVideos: [
          { title: 'Recursion and Merge Sort Tutorial', channel: 'NeetCode', url: 'https://www.youtube.com/watch?v=RBSGKlAVoR4', youtubeId: 'RBSGKlAVoR4' }
        ],
        aiResources: [
          'Visualgo.net - Interactive Algorithm Animations',
          'Striver: A2Z DSA Mastery sheet'
        ]
      }
    ],
    'NodeJS': [
      {
        id: 'node-1',
        topic: 'NodeJS',
        lessonNum: 1,
        totalLessons: 2,
        difficulty: 'Medium',
        estimatedTime: '15 min',
        title: 'The Event Loop & Backend Execution',
        keyConcepts: ['V8 Engine', 'Event Loop', 'Non-blocking I/O', 'Thread Pool'],
        lecture: `Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code server-side.\n\nNormally, operating systems run heavy threads per connection. Node.js utilizes a single-threaded non-blocking architecture, offloading expensive input/output operations to helper resources in the OS background thread pool. When operations complete, the Event Loop schedules callbacks for swift execution.`,
        analogy: 'Imagine a single busy restaurant waiter. Instead of standing in the kitchen waiting for a steak to grill, the waiter takes orders from other tables, and serves food only when notified by the chef (asynchronous event handler).',
        miniExercise: 'Run "node -v" to check your active Node.js execution runtime version.',
        exercises: [
          'Examine asynchronous process ticks using setTimeout and process.nextTick.',
          'Write a Node script that reads a text file asynchronously using fs module.'
        ],
        quizQuestion: 'How does Node.js handle high-concurrent connection volume while operating on a single primary execution thread?',
        quizOptions: ['By spawning children browser windows', 'By utilizing a non-blocking event-driven loop and offloading I/O', 'By converting JavaScript to Python', 'By limiting client connections to 5 simultaneous sessions'],
        correctOptionIndex: 1,
        explanation: 'The Event Loop delegates input/output operations as asynchronous callbacks, enabling Node.js to scale efficiently without blocking threads.',
        notes: `• Node.js wraps Google Chrome\'s high-performance open-source V8 JavaScript engine for raw server-side execution.`,
        youtubeEmbedId: 'TlB_eWDSMt4',
        videoUrl: 'https://www.youtube-nocookie.com/embed/TlB_eWDSMt4',
        recommendedVideos: [
          { title: 'Node.js & Express Crash Course', channel: 'Web Dev Simplified', url: 'https://www.youtube.com/watch?v=f2EqECiUALg', youtubeId: 'f2EqECiUALg' }
        ],
        aiResources: [
          'Node.js Official Diagnostics Documentation',
          'The Primeagen Node.js vs Go Benchmarks'
        ]
      },
      {
        id: 'node-2',
        topic: 'NodeJS',
        lessonNum: 2,
        totalLessons: 2,
        difficulty: 'Medium',
        estimatedTime: '15 min',
        title: 'API Design with Express',
        keyConcepts: ['REST', 'Express Routing', 'HTTP Methods', 'Middleware'],
        lecture: `Express is a minimal web framework for Node.js. It simplifies routing and server configurations.\n\nAPI routing allows clients to request data from the server using standardized HTTP methods:\n* \`GET\`: Retrieve records\n* \`POST\`: Create a new record\n* \`PUT/PATCH\`: Update existing records\n* \`DELETE\`: Delete records\n\nMiddleware functions act as interceptors, parsing headers, enforcing security protocols, or verifying user tokens before routes process the raw requests.`,
        analogy: 'Middleware is like a security guard standing at a building entrance. The guard inspects your ID (parses tokens) before letting you proceed to your target office room (route handler).',
        miniExercise: 'Write a simple Express GET endpoint returning a status object.',
        exercises: [
          'Develop an Express API serving a mockup list of lesson courses.',
          'Secure an Express routing endpoint using a header-checking interceptor middleware.'
        ],
        quizQuestion: 'Which HTTP method is specifically used by client interfaces to request data retrieval from an Express API?',
        quizOptions: ['GET', 'POST', 'PUT', 'DELETE'],
        correctOptionIndex: 0,
        explanation: 'The GET protocol retrieves server resources without introducing permanent modifications to state databases.',
        notes: `• Always return correct HTTP status codes (e.g. 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 500 Server Error) to help client integration developers.`,
        youtubeEmbedId: 'TlB_eWDSMt4',
        videoUrl: 'https://www.youtube-nocookie.com/embed/TlB_eWDSMt4',
        recommendedVideos: [
          { title: 'NodeJS in 100 Seconds', channel: 'Fireship', url: 'https://www.youtube.com/watch?v=ENrzD9HAZK4', youtubeId: 'ENrzD9HAZK4' }
        ],
        aiResources: [
          'ExpressJS Official API guides',
          'REST API design best practices checklist'
        ]
      }
    ],
    'System Design': [
      {
        id: 'sys-1',
        topic: 'System Design',
        lessonNum: 1,
        totalLessons: 2,
        difficulty: 'Advanced',
        estimatedTime: '18 min',
        title: 'Scalability & Load Balancers',
        keyConcepts: ['Vertical Scaling', 'Horizontal Scaling', 'Load Balancers', 'Availability'],
        lecture: `System Design explores how we structure massive web applications to handle billions of request operations reliably.\n\nWhen traffic explodes, we scale systems:\n* **Vertical Scaling**: Upgrading the raw power of a single machine (e.g., adding CPU/RAM). Has hard physical limits.\n* **Horizontal Scaling**: Adding more server machines in parallel.\n\nTo coordinate horizontal structures, we place a **Load Balancer** at the gateway to distribute requests evenly among active servers, preventing single machines from crashing.`,
        analogy: 'Vertical scaling is buying a larger delivery truck. Horizontal scaling is hiring a fleet of 50 standard delivery trucks coordinated by a central dispatcher (Load Balancer).',
        miniExercise: 'Differentiate between vertical scaling limits and horizontal scaling scalability.',
        exercises: [
          'Design an architecture diagram showing redundancy with multiple app servers behind Nginx.',
          'Model standard Round-Robin load allocation rules.'
        ],
        quizQuestion: 'What is the primary role of a Load Balancer in a high-traffic horizontally scaled backend architecture?',
        quizOptions: ['To compress files before storage', 'To distribute incoming network traffic evenly among multiple backend servers', 'To backup databases automatically', 'To compile TypeScript modules at runtime'],
        correctOptionIndex: 1,
        explanation: 'Load Balancers route client traffic among a pool of active servers to maximize resource efficiency and ensure high system availability.',
        notes: `• Single Points of Failure (SPOF) must be systematically purged by adding hot-standby machines and automatic replication.`,
        youtubeEmbedId: 'i53Gi_K3_kA',
        videoUrl: 'https://www.youtube-nocookie.com/embed/i53Gi_K3_kA',
        recommendedVideos: [
          { title: 'System Design for Beginners', channel: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=i53Gi_K3_kA', youtubeId: 'i53Gi_K3_kA' }
        ],
        aiResources: [
          'System Design Primer GitHub Guide',
          'ByteByteGo: High Scalability System Design Newsletter'
        ]
      },
      {
        id: 'sys-2',
        topic: 'System Design',
        lessonNum: 2,
        totalLessons: 2,
        difficulty: 'Advanced',
        estimatedTime: '18 min',
        title: 'Caching Strategies & Content Delivery Networks',
        keyConcepts: ['Caching', 'Redis', 'CDN', 'Latency Reduction'],
        lecture: `Caching is storing computed data in high-speed in-memory hardware databases (like Redis) so future requests can resolve instantly without triggering slow database queries.\n\nA Content Delivery Network (CDN) is a geographically distributed network of proxy servers that cache static assets (like images, JS, and CSS) close to end users, slashing latency globally.`,
        analogy: 'Caching is keeping your active textbook open on your desk for immediate reference (memory). If you close it and pack it away, retrieving it means walking to the public library index catalog (database query).',
        miniExercise: 'Describe how CDNs reduce web page load latency for international audiences.',
        exercises: [
          'Design a Cache-Aside database query execution flow.',
          'Analyze cache validation rules (TTL and Cache-Invalidation triggers).'
        ],
        quizQuestion: 'Where does an active cache (such as Redis) typically store records to achieve sub-millisecond retrieval speeds?',
        quizOptions: ['Secondary HDD storage disks', 'In-memory RAM blocks', 'Cloud backup zip archives', 'Client-side cookies'],
        correctOptionIndex: 1,
        explanation: 'Caching servers use primary memory (RAM) instead of slow persistent disks, enabling super-fast lookup latency.',
        notes: `• Stale data is a critical caching risk. Use strategic time-to-live (TTL) bounds or active database triggers to update outdated values.`,
        youtubeEmbedId: 'i53Gi_K3_kA',
        videoUrl: 'https://www.youtube-nocookie.com/embed/i53Gi_K3_kA',
        recommendedVideos: [
          { title: 'Caching and CDNs Explained', channel: 'ByteByteGo', url: 'https://www.youtube.com/watch?v=m8I0fD_rZ1U', youtubeId: 'm8I0fD_rZ1U' }
        ],
        aiResources: [
          'Redis Labs Developer Tutorials',
          'Cloudflare Global CDN Architecture Documentation'
        ]
      }
    ]
  };

  const handleCreateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    setIsGenerating(true);
    try {
      await generateRoadmap(topicInput);
      setTopicInput('');
      triggerFlash('🗺️ Personalized Roadmap Syllabus appended successfully!');
    } catch (err) {
      console.error(err);
      triggerFlash('⚠️ Error generating roadmap. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickRoadmap = (t: string) => {
    setTopicInput(t);
    // Smooth scroll to form
    document.getElementById('roadmap-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Learning Assistant Functions
  const activeLessons = lessonsDatabase[selectedTopic] || lessonsDatabase['Linux'];
  const currentLesson = activeLessons[lessonIndex] || activeLessons[0];

  const handleSelectTopic = (t: string) => {
    setSelectedTopic(t);
    setLessonIndex(0);
    setAssistantMode('educational');
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
  };

  const handleNextLesson = () => {
    if (lessonIndex < activeLessons.length - 1) {
      setLessonIndex(prev => {
        const next = prev + 1;
        // Autosave watch progress and location
        localStorage.setItem('gh_lesson_index', next.toString());
        return next;
      });
      setAssistantMode('educational');
      setSelectedQuizOption(null);
      setQuizSubmitted(false);
      grantXP(60, `Completed Lesson: ${currentLesson.title}!`);
    } else {
      // Loop or complete
      grantXP(150, `Mastered entire topic ${selectedTopic}! Unlocked Achievement! 🏆`);
      const badgeTitle = `🏆 ${selectedTopic} Master`;
      if (!badges.includes(badgeTitle)) {
        setBadges(prev => [...prev, badgeTitle]);
      }
      setTopicsCompleted(prev => prev + 1);
      setHoursInvested(prev => prev + 4);
      triggerFlash(`🎉 You have mastered all milestones for ${selectedTopic}!`);
      setLessonIndex(0);
    }
  };

  const handleSaveProgress = () => {
    const progressObj = {
      topic: selectedTopic,
      lessonIndex: lessonIndex,
      timestamp: Date.now()
    };
    localStorage.setItem('gh_last_saved_progress', JSON.stringify(progressObj));
    setSavedSpot(progressObj);

    // Update study streak
    const todayStr = new Date().toDateString();
    const lastStudyDay = localStorage.getItem('gh_last_study_day');
    if (lastStudyDay !== todayStr) {
      setCurrentStreak(prev => {
        const next = prev + 1;
        if (next > longestStreak) {
          setLongestStreak(next);
        }
        localStorage.setItem('gh_last_study_day', todayStr);
        return next;
      });
      setLearningDays(prev => prev + 1);
    }

    // Set watch progress for current lesson to 100% when saved if not already
    setWatchProgress(prev => {
      const updated = { ...prev, [currentLesson.id]: 100 };
      localStorage.setItem('gh_watch_progress', JSON.stringify(updated));
      return updated;
    });

    grantXP(40, `Saved Progress! Spot secured for ${selectedTopic} - Unit ${lessonIndex + 1}! 💾`);
    triggerFlash(`💾 Progress saved successfully! Active streak updated.`);
  };

  const handleResumeLearning = () => {
    try {
      const saved = localStorage.getItem('gh_last_saved_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSubTab('assistant');
        setSelectedTopic(parsed.topic);
        setLessonIndex(parsed.lessonIndex);
        setAssistantMode('educational');
        triggerFlash(`🚀 Resumed spot at ${parsed.topic} - Unit ${parsed.lessonIndex + 1}!`);
      }
    } catch (e) {
      console.error("Failed to parse resume progress", e);
    }
  };

  const getEstimatedCompletionDate = () => {
    const remaining = Math.max(1, activeLessons.length - lessonIndex);
    const date = new Date();
    date.setDate(date.getDate() + remaining);
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleQuizSubmit = () => {
    if (selectedQuizOption === null) return;
    setQuizSubmitted(true);
    const correct = selectedQuizOption === currentLesson.correctOptionIndex;
    setQuizIsCorrect(correct);
    if (correct) {
      grantXP(100, "Answered quiz question correctly on first attempt!");
    } else {
      triggerFlash("❌ Incorrect option. Try analyzing the explanation card below.");
    }
  };

  const handleAcceptProject = (proj: RecommendedProject) => {
    addTask({
      title: `Build Project: ${proj.title}`,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks out
      complexity: proj.difficulty === 'Beginner' ? 'Low' : proj.difficulty === 'Intermediate' ? 'Medium' : 'High',
      priority: 'High',
      status: 'Todo',
      subtasks: [],
      category: 'Growth',
      estimatedHours: proj.difficulty === 'Advanced' ? 15 : 8
    });
    triggerFlash(`💼 Added project "${proj.title}" directly to your active priorities!`);
  };

  const handleCritiqueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!behavioralDraft.trim()) return;
    setCritiqueLoading(true);
    setTimeout(() => {
      setCritiqueLoading(false);
      // Construct detailed AI critique heuristic
      const cleanInput = behavioralDraft.toLowerCase();
      let feedback = `### Placement Critique Assessment\n\n`;
      if (cleanInput.length < 50) {
        feedback += `⚠️ **Length Assessment: High Friction**\nYour explanation is a bit too brief. In competitive technical evaluations, interviewer frameworks look for the **STAR Method** (Situation, Task, Action, Result) described with structural numbers.\n\n`;
      } else {
        feedback += `✅ **Structure Assessment: Solid Flow**\nGreat narrative footprint! You've provided an authentic depth of action.\n\n`;
      }

      if (cleanInput.includes('i ') && !cleanInput.includes('we ')) {
        feedback += `💡 **Collaboration Insight**: Good individual focus, but balance your answer by highlighting how you collaborated or aligned with team partners during friction points.\n\n`;
      }

      feedback += `🌟 **Constructive Adjustments**:\n1. *Refine with Metrics*: Quantify the Result. Instead of "improved code", say "slashed build runtime by 32%".\n2. *Describe the Tech Stack*: Explicitly state the CLI parameter, language, or system call used (e.g., "leveraged Python's multiprocessing thread pool to bypass file system limits").\n\n*Excellent sandbox trial! +40 Practice XP granted.*`;
      
      setCritiqueOutput(feedback);
      grantXP(40, "Completed interview practice prompt!");
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto selection:bg-indigo-250 animate-fade-in relative pb-12">
      
      {/* Toast notifications flash panel */}
      {flashMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-4.5 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center space-x-2.5 animate-slide-in">
          <Zap size={14} className="text-yellow-400 animate-bounce" />
          <span>{flashMessage}</span>
        </div>
      )}

      {/* TOP HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <GraduationCap size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 tracking-tight">AI Personal Development Coach</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Intelligent roadmaps, gamified courses, and interview preparation copiloted by Gemini.</p>
            </div>
          </div>
        </div>

        {/* Level and XP visual tracker */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl p-4 flex items-center space-x-4 shrink-0 shadow-sm">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Rank</span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-display font-black text-sm shadow-md">
              Lvl {level}
            </div>
          </div>

          <div className="space-y-1 w-32 md:w-40">
            <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500">
              <span>{xp} / 1000 XP</span>
              <span className="text-indigo-600">Level Progress</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full transition-all duration-300"
                style={{ width: `${(xp / 1000) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* GAMIFICATION STATS COUNTER BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <div className="backdrop-blur-md bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-white/40 dark:border-white/5 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <Zap size={18} className="animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider">Active Streak</p>
            <p className="text-base font-display font-bold text-slate-800 dark:text-slate-200">{currentStreak} days</p>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-white/40 dark:border-white/5 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider">Study Time</p>
            <p className="text-base font-display font-bold text-slate-800 dark:text-slate-200">{hoursInvested} hours</p>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-white/40 dark:border-white/5 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Check size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider">Topics Mastered</p>
            <p className="text-base font-display font-bold text-slate-800 dark:text-slate-200">{topicsCompleted} items</p>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-white/40 dark:border-white/5 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
            <Star size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider">Consistency Record</p>
            <p className="text-base font-display font-bold text-slate-800 dark:text-slate-200">{longestStreak} days</p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 backdrop-blur-md bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-white/40 dark:border-white/5 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-xl">
            <Trophy size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider">Earned Badges</p>
            <p className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">{badges.length} unlocked</p>
          </div>
        </div>
      </div>

      {/* HORIZONTAL SUB-NAVIGATION BAR */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 pt-2 scrollbar-none">
        <button
          onClick={() => setSubTab('recommendations')}
          className={`flex items-center space-x-2 py-2 px-4.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            subTab === 'recommendations' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Compass size={14} />
          <span>Recommended & Careers</span>
        </button>

        <button
          onClick={() => setSubTab('roadmaps')}
          className={`flex items-center space-x-2 py-2 px-4.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            subTab === 'roadmaps' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <BookMarked size={14} />
          <span>Personal Roadmaps</span>
        </button>

        <button
          onClick={() => setSubTab('assistant')}
          className={`flex items-center space-x-2 py-2 px-4.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            subTab === 'assistant' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Code size={14} />
          <span>Interactive Classrooms</span>
        </button>

        <button
          onClick={() => setSubTab('placement')}
          className={`flex items-center space-x-2 py-2 px-4.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            subTab === 'placement' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Briefcase size={14} />
          <span>Placement Prep Hub</span>
        </button>

        <button
          onClick={() => setSubTab('review')}
          className={`flex items-center space-x-2 py-2 px-4.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            subTab === 'review' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <BarChart size={14} />
          <span>Weekly Growth Review</span>
        </button>
      </div>

      {/* --- CONTENT CONTAINER --- */}
      <div className="space-y-6">

        {/* 1. RECOMMENDED SKILLS & PREDEFINED CAREERS TAB */}
        {subTab === 'recommendations' && (
          <div className="space-y-6">
            
            {/* AI Skill Recommendations Section */}
            <div className="backdrop-blur-md bg-white/45 dark:bg-slate-900/45 p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-lg">
                    <Sparkles size={16} className="animate-spin-slow" />
                  </div>
                  <h2 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">Recommended For You</h2>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 px-2.5 py-1 bg-white/60 dark:bg-slate-950/40 rounded-full border border-slate-200 dark:border-slate-800">
                  Profile: {profile.role}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(skillCategoryMapping[profile.role as keyof typeof skillCategoryMapping] || skillCategoryMapping.Professional)
                  .slice(0, 4)
                  .map((skill, index) => (
                    <div 
                      key={index}
                      className="p-4 backdrop-blur-md bg-white/50 dark:bg-slate-900/60 hover:bg-white/75 dark:hover:bg-slate-900/80 border border-white/40 dark:border-white/5 rounded-2xl flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm">{skill.title}</p>
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950 rounded-full text-[10px] font-extrabold font-mono">
                            Match {skill.score}%
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">{skill.reason}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-bold font-mono border-t border-slate-100 dark:border-slate-800/50">
                        <span className="flex items-center space-x-1">
                          <Clock size={10} />
                          <span>{skill.duration}</span>
                        </span>
                        <span>Diff: {skill.difficulty}</span>

                        <button 
                          onClick={() => handleQuickRoadmap(skill.title.replace(/[🔥🐧🛠️🐳📊💡🚀👔🧱]/g, '').trim())}
                          className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400 flex items-center space-x-0.5 transition-colors font-display uppercase font-bold tracking-wider text-[9px]"
                        >
                          <span>Generate Roadmap</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Predefined AI Career Paths Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Selector: Predefined Career Paths */}
              <div className="lg:col-span-5 backdrop-blur-md bg-white/40 dark:bg-slate-900/40 rounded-3xl p-6 border border-white/40 dark:border-white/5 shadow-xl space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">AI Predefined Career Pathways</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">Select a senior technology role to generate standard credentials, requirements, and study habits.</p>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {careerPaths.map((cp) => (
                    <button
                      key={cp.id}
                      onClick={() => setSelectedCareer(cp.title)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-150 ${
                        selectedCareer === cp.title 
                          ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-700 dark:text-indigo-300 shadow-sm font-bold' 
                          : 'border-slate-100 dark:border-slate-800 bg-white/30 dark:bg-slate-950/10 text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-950/30'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                        <div>
                          <p className="text-xs font-bold">{cp.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono font-semibold">{cp.timeline} timeline</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Detail: Predefined path syllabus */}
              <div className="lg:col-span-7 backdrop-blur-md bg-white/45 dark:bg-slate-900/45 rounded-3xl p-6 border border-white/40 dark:border-white/5 shadow-xl space-y-5">
                {(() => {
                  const cp = careerPaths.find(c => c.title === selectedCareer) || careerPaths[0];
                  return (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <h4 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">Path: Senior {cp.title}</h4>
                          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest font-mono">Recommended curriculum milestones</p>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/10 rounded-lg text-[10px] font-bold font-mono">
                          {cp.difficulty}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/40 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                          <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Required Core Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {cp.skillsRequired.map((s, i) => (
                              <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white/40 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                          <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Certifications to Target</p>
                          <div className="space-y-1">
                            {cp.certifications.map((c, i) => (
                              <p key={i} className="text-[9px] font-semibold text-slate-600 dark:text-slate-300 leading-tight">🏆 {c}</p>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Suggested Productive Habits</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {cp.suggestedHabits.map((h, i) => (
                            <div key={i} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                              <span className="text-indigo-500 mt-0.5">➔</span>
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] font-mono text-slate-400 font-semibold">
                          ⌚ Allocation: <span className="font-bold text-slate-700 dark:text-slate-300">{cp.schedule}</span>
                        </div>
                        <button
                          onClick={() => handleQuickRoadmap(`Become Senior ${cp.title}`)}
                          className="w-full sm:w-auto bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition-all"
                        >
                          <GraduationCap size={14} />
                          <span>Instantiate Career Roadmap</span>
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>

            </div>

            {/* AI Suggested Projects Section */}
            <div id="project-recommendations-section" className="backdrop-blur-md bg-white/45 dark:bg-slate-900/45 p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">AI-Suggested Portfolio Projects</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">Craft real products mapped to industry demands. Accepting a recommendation populates your active daily scheduler.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedProjects.map((proj, index) => (
                  <div 
                    key={index} 
                    className="backdrop-blur-md bg-white/50 dark:bg-slate-950/10 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between space-y-4 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-display font-bold text-xs md:text-sm text-slate-900 dark:text-slate-100">{proj.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold font-mono">Duration: {proj.duration} | Diff: {proj.difficulty}</p>
                        </div>
                        <span className="shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/10">
                          Value: {proj.resumeValue}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs font-semibold leading-relaxed">{proj.description}</p>
                      
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.skillsCovered.map((s, idx) => (
                          <span key={idx} className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      <p className="text-[9px] text-slate-400 font-semibold italic">{proj.industryRelevance}</p>
                      <button
                        onClick={() => handleAcceptProject(proj)}
                        className="w-full sm:w-auto shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold uppercase tracking-wider py-2 px-3.5 rounded-lg transition-all"
                      >
                        Accept & Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 2. PERSONALIZED ROADMAPS & GENERATOR TAB */}
        {subTab === 'roadmaps' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Custom Roadmap Builder & Prompt Suggestions */}
            <div id="roadmap-form-section" className="lg:col-span-5 backdrop-blur-md bg-white/40 dark:bg-slate-900/40 rounded-3xl p-6 border border-white/40 dark:border-white/5 shadow-xl h-fit space-y-5">
              <div className="space-y-1.5">
                <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">Custom Roadmap Generator</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                  Type any skill, framework, or target role. Gemini will instantly outline a week-by-week timeline custom fitted to your strengths and weekly pace.
                </p>
              </div>

              <form onSubmit={handleCreateRoadmap} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="e.g., Python Backend, React, Become Product Manager..."
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="w-full backdrop-blur-md bg-white/40 dark:bg-slate-950/20 border-2 border-white/40 dark:border-slate-800/60 focus:border-indigo-500 rounded-2xl py-3.5 px-4 outline-none text-slate-800 dark:text-slate-200 text-xs md:text-sm font-semibold"
                />

                <button
                  type="submit"
                  disabled={isGenerating || !topicInput.trim()}
                  id="btn-generate-roadmap-custom"
                  className="w-full bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-5 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-650/15 transition-all duration-150"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Consulting AI Knowledge Base...</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap size={16} />
                      <span className="text-xs">Compile Dynamic Pathway</span>
                    </>
                  )}
                </button>
              </form>

              {/* Suggested Roadmap Prompts Grid */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Suggested Learning Targets</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Learn Python", "Learn React", "Learn Machine Learning", "Prepare for Google",
                    "Become Full Stack Developer", "Become Product Manager", "Prepare for Placements",
                    "Learn Kubernetes", "Learn System Design"
                  ].map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTopicInput(sug)}
                      className="p-2 bg-white/40 dark:bg-slate-950/20 hover:bg-white/70 dark:hover:bg-slate-950/50 text-[10px] font-bold text-slate-700 dark:text-slate-300 rounded-xl text-left border border-slate-100 dark:border-slate-800/85 transition-all truncate"
                    >
                      💡 {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Roadmap syllabus viewer */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">Your Active Roadmaps ({roadmaps.length})</h3>

              {roadmaps.length === 0 ? (
                <div className="text-center py-14 bg-white/30 dark:bg-slate-900/30 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl text-slate-500 text-xs">
                  <BookMarked size={32} className="mx-auto text-indigo-400 mb-3 opacity-70" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No active roadmap</p>
                  <p className="text-slate-500 text-[11px] mt-1">Let's build your first roadmap.</p>
                  <p className="text-slate-400 text-[10px] mt-2">Choose a learning track to begin: DSA, Web Dev, AI, DevOps, Cybersecurity, Cloud, Placements.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {roadmaps.map((rm) => {
                    const isExpanded = expandedRoadmapId === rm.id;
                    return (
                      <div key={rm.id} className="backdrop-blur-md bg-white/45 dark:bg-slate-900/45 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl overflow-hidden">
                        
                        {/* Summary panel */}
                        <div 
                          onClick={() => setExpandedRoadmapId(isExpanded ? null : rm.id)}
                          className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/35 dark:hover:bg-slate-950/15 transition-colors select-none"
                        >
                          <div className="space-y-1 min-w-0 flex-1 pr-4">
                            <h4 className="font-display font-bold text-xs md:text-sm text-slate-900 dark:text-slate-100 truncate">
                              🗺️ {rm.topic}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-semibold font-mono">
                              <span>{rm.steps.length} Milestones</span>
                              <span>•</span>
                              <span>Est Completion: 18 days</span>
                              <span>•</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{rm.progress}% Completed</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 shrink-0">
                            <div className="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                              <div 
                                className="h-full bg-indigo-650 transition-all duration-300"
                                style={{ width: `${rm.progress}%` }}
                              />
                            </div>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>

                        {/* Step detailed checklist expansion */}
                        {isExpanded && (() => {
                          const activeRmTab = rmSubTabs[rm.id] || 'syllabus';
                          const setRmTab = (tab: 'syllabus' | 'skills' | 'projects' | 'readiness' | 'weekly') => {
                            setRmSubTabs(prev => ({ ...prev, [rm.id]: tab }));
                          };

                          return (
                            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 p-5 space-y-4">
                              
                              {/* Tab Controls */}
                              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100/80 dark:border-slate-800/80">
                                <button
                                  type="button"
                                  onClick={() => setRmTab('syllabus')}
                                  className={`px-3 py-1.5 text-[10px] md:text-xs font-bold font-display rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                                    activeRmTab === 'syllabus'
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
                                  }`}
                                >
                                  <BookOpen size={13} />
                                  <span>Milestones ({rm.steps.length})</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => setRmTab('skills')}
                                  className={`px-3 py-1.5 text-[10px] md:text-xs font-bold font-display rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                                    activeRmTab === 'skills'
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
                                  }`}
                                >
                                  <Award size={13} />
                                  <span>Skills & Habits</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setRmTab('projects')}
                                  className={`px-3 py-1.5 text-[10px] md:text-xs font-bold font-display rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                                    activeRmTab === 'projects'
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
                                  }`}
                                >
                                  <Code size={13} />
                                  <span>Projects ({rm.projects?.length || 0})</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setRmTab('readiness')}
                                  className={`px-3 py-1.5 text-[10px] md:text-xs font-bold font-display rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                                    activeRmTab === 'readiness'
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
                                  }`}
                                >
                                  <Briefcase size={13} />
                                  <span>Readiness ({rm.placementReadiness?.score || 0}%)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setRmTab('weekly')}
                                  className={`px-3 py-1.5 text-[10px] md:text-xs font-bold font-display rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                                    activeRmTab === 'weekly'
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
                                  }`}
                                >
                                  <Clock size={13} />
                                  <span>Weekly Plan ({rm.weeklyPlan?.length || 0}w)</span>
                                </button>
                              </div>

                              {/* TAB 1: SYLLABUS / MILESTONES */}
                              {activeRmTab === 'syllabus' && (
                                <div className="space-y-4">
                                  {/* Current / Next Lesson Tracker Subcard */}
                                  <div className="grid grid-cols-2 gap-3 bg-white/60 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-150/50 dark:border-slate-800/60">
                                    <div>
                                      <p className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Current Lesson</p>
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                        {rm.steps.find(s => s.status !== 'Completed')?.title || "Course Completed! 🎉"}
                                      </p>
                                    </div>
                                    <div className="border-l border-slate-100 dark:border-slate-800 pl-3">
                                      <p className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Next Milestone</p>
                                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                                        {rm.steps.filter(s => s.status !== 'Completed')[1]?.title || "Finalizing Project"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Syllabus Step list mapping */}
                                  <div className="space-y-3.5">
                                    {rm.steps.map((step, idx) => (
                                      <div key={step.id} className="relative flex items-start space-x-3.5">
                                        {/* Connector Line */}
                                        {idx < rm.steps.length - 1 && (
                                          <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />
                                        )}

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextStatus = step.status === 'Completed' ? 'Pending' : 'Completed';
                                            updateRoadmapStep(rm.id, step.id, nextStatus);
                                            if (nextStatus === 'Completed') {
                                              grantXP(80, `Mastered Milestone: ${step.title}`);
                                            }
                                          }}
                                          className={`
                                            z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                                            ${step.status === 'Completed' 
                                              ? 'bg-indigo-650 border-indigo-600 text-white' 
                                              : 'bg-white/80 dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-indigo-500'}
                                          `}
                                        >
                                          {step.status === 'Completed' && <Check size={11} />}
                                        </button>

                                        <div className="min-w-0 flex-1 bg-white/70 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1.5">
                                          <div className="flex items-start justify-between gap-2">
                                            <div>
                                              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">Week {idx + 1} Milestone</p>
                                              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs md:text-sm">{step.title}</p>
                                            </div>
                                            <span className="shrink-0 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                              ⏱️ {step.estimatedHours}h
                                            </span>
                                          </div>
                                          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-semibold">{step.description}</p>
                                          
                                          {/* Appended resources & exercises triggers */}
                                          <div className="pt-2 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/60 text-[9px] font-mono font-bold uppercase text-slate-400 select-none">
                                            <span className="text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer" onClick={() => triggerFlash("📚 Custom textbook resources loaded for this milestone.")}>📚 Docs & resources</span>
                                            <span>|</span>
                                            <span className="text-emerald-650 dark:text-emerald-400 hover:underline cursor-pointer" onClick={() => triggerFlash("🧩 Sandbox challenge generated for this milestone. Open Classroom assistant.")}>🧩 Practice Exercise</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* TAB 2: SKILLS & HABITS */}
                              {activeRmTab === 'skills' && (
                                <div className="space-y-4">
                                  {/* Overall parameters subcard */}
                                  <div className="grid grid-cols-2 gap-3 bg-white/60 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-150/50 dark:border-slate-800/60">
                                    <div>
                                      <p className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Overall Timeline</p>
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        ⏱️ {rm.timeline || "6 Months"}
                                      </p>
                                    </div>
                                    <div className="border-l border-slate-100 dark:border-slate-800 pl-3">
                                      <p className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Learning Schedule</p>
                                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        📅 {rm.learningSchedule || "10 hours / week"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Skills checklist */}
                                  <div className="bg-white/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-2.5">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center space-x-1.5">
                                      <Zap size={12} className="text-indigo-600" />
                                      <span>Target Skills Matrix</span>
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                      {rm.skills?.map((skill, index) => (
                                        <span key={index} className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-semibold">
                                          <span>✓</span>
                                          <span>{skill}</span>
                                        </span>
                                      )) || <p className="text-xs text-slate-400 italic">No target skills defined.</p>}
                                    </div>
                                  </div>

                                  {/* Suggested Habits integration */}
                                  <div className="bg-white/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-2.5">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center space-x-1.5">
                                      <RotateCw size={12} className="text-emerald-600" />
                                      <span>Recommended Daily Routines</span>
                                    </h5>
                                    <div className="space-y-2">
                                      {rm.suggestedHabits?.map((habitText, index) => (
                                        <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100/50 dark:border-slate-800/50">
                                          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{habitText}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              addHabit({
                                                title: habitText,
                                                frequency: 'daily'
                                              });
                                              triggerFlash(`⚡ Habit "${habitText}" synchronized successfully to your Dashboard!`);
                                            }}
                                            className="px-2 py-1 text-[9px] font-mono font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-750 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100 dark:border-emerald-900/40 shrink-0"
                                          >
                                            ➕ Sync
                                          </button>
                                        </div>
                                      )) || <p className="text-xs text-slate-400 italic">No suggested habits defined.</p>}
                                    </div>
                                  </div>

                                  {/* Target Certifications */}
                                  <div className="bg-white/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-2.5">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center space-x-1.5">
                                      <Award size={12} className="text-amber-500" />
                                      <span>High-Impact Certifications</span>
                                    </h5>
                                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pl-1 font-semibold">
                                      {rm.certifications?.map((cert, index) => (
                                        <li key={index} className="flex items-center space-x-2">
                                          <span className="text-amber-500 shrink-0">★</span>
                                          <span>{cert}</span>
                                        </li>
                                      )) || <li className="italic text-slate-400">Standard Completion Credentials.</li>}
                                    </ul>
                                  </div>

                                  {/* Badges list */}
                                  {rm.badges && rm.badges.length > 0 && (
                                    <div className="bg-white/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-2.5">
                                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center space-x-1.5">
                                        <Trophy size={12} className="text-yellow-500" />
                                        <span>Unlockable Badges ({rm.badges.length})</span>
                                      </h5>
                                      <div className="flex flex-wrap gap-2">
                                        {rm.badges.map((badge, idx) => (
                                          <span key={idx} className="inline-flex items-center space-x-1 px-2.5 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-xl text-[10px] font-mono font-bold">
                                            <span>{badge}</span>
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* TAB 3: PORTFOLIO PROJECTS */}
                              {activeRmTab === 'projects' && (
                                <div className="space-y-4">
                                  <div className="space-y-3">
                                    {rm.projects?.map((project, index) => (
                                      <div key={index} className="bg-white/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-2.5">
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <span className={`inline-block px-2 py-0.5 text-[8px] font-mono font-bold uppercase rounded-sm ${
                                              project.difficulty === 'Advanced' 
                                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100' 
                                                : project.difficulty === 'Intermediate'
                                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100'
                                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100'
                                            }`}>
                                              {project.difficulty}
                                            </span>
                                            <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs md:text-sm mt-1">{project.title}</h5>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              addTask({
                                                title: `Build Portfolio Project: ${project.title}`,
                                                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                                complexity: project.difficulty === 'Advanced' ? 'High' : project.difficulty === 'Intermediate' ? 'Medium' : 'Low',
                                                priority: 'High',
                                                status: 'Todo',
                                                subtasks: project.skillsCovered.map((s, sidx) => ({ id: `pt-${sidx}-${Date.now()}`, title: `Implement ${s}`, completed: false })),
                                                category: 'Projects',
                                                estimatedHours: project.difficulty === 'Advanced' ? 30 : project.difficulty === 'Intermediate' ? 15 : 8
                                              });
                                              triggerFlash(`🎯 Project Task created on your main Schedule! Go to Dashboard/Calendar.`);
                                            }}
                                            className="shrink-0 px-2 py-1 text-[9px] font-mono font-bold uppercase bg-indigo-50 dark:bg-indigo-950/50 text-indigo-750 dark:text-indigo-300 rounded-lg border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-100 transition-colors"
                                          >
                                            ➕ Add to Tasks
                                          </button>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-semibold">{project.description}</p>
                                        <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                                          {project.skillsCovered.map((s, sidx) => (
                                            <span key={sidx} className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                              #{s}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )) || (
                                      <div className="text-center py-8 text-slate-400 italic text-xs">
                                        No portfolio projects loaded. Add a career target topic to generate professional capstones!
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* TAB 4: PLACEMENT READINESS */}
                              {activeRmTab === 'readiness' && (
                                <div className="space-y-4">
                                  {rm.placementReadiness ? (
                                    <div className="space-y-4">
                                      {/* Score meter & advice */}
                                      <div className="bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                        <div className="col-span-1 flex flex-col items-center justify-center text-center p-2 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-100 dark:border-slate-800">
                                          <p className="text-[8px] uppercase font-bold text-slate-400 font-mono tracking-wider">Readiness Score</p>
                                          <p className="text-3xl font-display font-extrabold text-indigo-605 dark:text-indigo-400 mt-1">{rm.placementReadiness.score}%</p>
                                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                                            <div 
                                              className="bg-indigo-600 h-full rounded-full transition-all"
                                              style={{ width: `${rm.placementReadiness.score}%` }}
                                            />
                                          </div>
                                        </div>
                                        <div className="col-span-3">
                                          <p className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider mb-0.5">AI Professional Placement Analysis</p>
                                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">{rm.placementReadiness.feedback}</p>
                                        </div>
                                      </div>

                                      {/* Professional checklist checks */}
                                      <div className="bg-white/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-2.5">
                                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center space-x-1.5">
                                          <Check size={12} className="text-indigo-600" />
                                          <span>Placement Readiness Checklist</span>
                                        </h5>
                                        <div className="space-y-2">
                                          {rm.placementReadiness.checks.map((check, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100/50 dark:border-slate-800/50">
                                              <div className="flex items-center space-x-2">
                                                <span className={`w-2 h-2 rounded-full ${check.passed ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{check.title}</span>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                                                  check.passed 
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' 
                                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                                }`}>
                                                  {check.passed ? 'Passed ✓' : 'In Progress'}
                                                </span>
                                                
                                                {!check.passed && (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      // Simulate toggle passing
                                                      triggerFlash(`Check "${check.title}" completed! Keep up the prep.`);
                                                      grantXP(50, `Completed prep metric: ${check.title}`);
                                                    }}
                                                    className="p-1 text-slate-400 hover:text-indigo-600 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                                                  >
                                                    <Check size={10} />
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 text-slate-400 italic text-xs">
                                      Placement evaluation is reserved for career-oriented goals. Switch to a career roadmap to calculate your metrics!
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* TAB 5: WEEKLY INTENSIVE SCHEDULE */}
                              {activeRmTab === 'weekly' && (
                                <div className="space-y-4">
                                  {rm.weeklyPlan && rm.weeklyPlan.length > 0 ? (
                                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                                      {rm.weeklyPlan.map((wk, idx) => (
                                        <div key={idx} className="bg-white/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 font-mono">WEEK {wk.week}</p>
                                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold uppercase">Focus Period</span>
                                          </div>
                                          <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs md:text-sm">{wk.focus}</h5>
                                          <div className="pl-3 border-l border-indigo-100 dark:border-indigo-900/40 space-y-1.5 pt-1">
                                            {wk.tasks.map((taskText, tidx) => (
                                              <div key={tidx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                                                <span className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-1">•</span>
                                                <span>{taskText}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 text-slate-400 italic text-xs">
                                      Weekly intensive planner is customized for high-stakes preparation. Change your goal to career target to unlock 12-week micro-schedule!
                                    </div>
                                  )}
                                </div>
                              )}

                              {rm.progress === 100 && (
                                <div className="p-4 bg-emerald-500/10 text-emerald-800 border border-emerald-500/10 rounded-2xl flex items-center space-x-3 text-xs font-bold shadow-xs">
                                  <Trophy size={16} className="text-emerald-600 shrink-0" />
                                  <span>Masterful! You completed the custom learning syllabus for {rm.topic}! +200 Mastery XP</span>
                                </div>
                              )}

                            </div>
                          );
                        })()}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 3. AI LEARNING ASSISTANT CLASSROOM TAB */}
        {subTab === 'assistant' && (
          <div className="space-y-6">
            {/* 1. Global "Resume Learning" Alert Banner */}
            {savedSpot && (
              <div id="resume-learning-banner" className="bg-indigo-650/10 dark:bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-indigo-950 dark:text-indigo-250">
                <div className="flex items-center space-x-3">
                  <div className="w-8.5 h-8.5 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
                    <PlayCircle size={17} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">Resume Learning</p>
                    <p className="text-slate-600 dark:text-slate-300">You have a saved bookmark in <span className="font-black underline text-indigo-700 dark:text-indigo-400">{savedSpot.topic} Academy</span> (Unit {savedSpot.lessonIndex + 1})</p>
                  </div>
                </div>
                <button
                  onClick={handleResumeLearning}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                >
                  Jump to Unit {savedSpot.lessonIndex + 1} 🚀
                </button>
              </div>
            )}

            {(() => {
              const recentlyWatched = Object.values(lessonsDatabase)
                .flat()
                .filter((lesson) => (watchProgress[lesson.id] || 0) > 0);

              const continueLearningLesson = Object.values(lessonsDatabase)
                .flat()
                .find((lesson) => {
                  const progress = watchProgress[lesson.id] || 0;
                  return progress > 0 && progress < 100;
                });

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Available Classroom Courses & Hub Widgets */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="backdrop-blur-md bg-white/40 dark:bg-slate-900/40 p-5 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl h-fit space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">Interactive Classrooms</h3>
                        <p className="text-slate-500 text-xs font-semibold leading-relaxed">Choose an interactive course topic. LifePilot will teach, explain, and quiz you hands-free.</p>
                      </div>

                      <div className="space-y-2">
                        {Object.keys(lessonsDatabase).map((topicName) => (
                          <button
                            key={topicName}
                            onClick={() => handleSelectTopic(topicName)}
                            className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all duration-150 ${
                              selectedTopic === topicName 
                                ? 'bg-indigo-600 text-white shadow-md font-bold border-indigo-600' 
                                : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/10 text-slate-700 dark:text-slate-300 hover:bg-white/85 dark:hover:bg-slate-950/30'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <PlayCircle size={14} className="shrink-0" />
                              <span className="text-xs">{topicName} Academy</span>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full ${selectedTopic === topicName ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                              {lessonsDatabase[topicName].length} units
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* 2. Interactive Streak Tracker, Progress & Save Progress Button */}
                      <div className="border-t border-slate-200/60 dark:border-slate-800 pt-4 space-y-3">
                        <div className="flex items-center justify-between bg-slate-100/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Classroom Streak</span>
                          <span className="text-xs font-black text-amber-500 flex items-center space-x-1">
                            <span>🔥 {currentStreak} Days</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-100/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Est. Completion</span>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {getEstimatedCompletionDate()}
                          </span>
                        </div>
                        
                        <button
                          onClick={handleSaveProgress}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <Save size={13} />
                          <span>Save Lesson Progress</span>
                        </button>
                      </div>
                    </div>

                    {/* Continue Learning Widget */}
                    {continueLearningLesson ? (
                      <div className="backdrop-blur-md bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-5 rounded-3xl border border-indigo-500/20 shadow-lg space-y-3">
                        <div className="flex items-center space-x-2">
                          <PlayCircle className="text-indigo-500 shrink-0 animate-pulse" size={16} />
                          <span className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">Continue Learning</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{continueLearningLesson.title}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">{continueLearningLesson.topic} • Unit {continueLearningLesson.lessonNum}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="bg-slate-200 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                            <div className="bg-indigo-650 h-full" style={{ width: `${watchProgress[continueLearningLesson.id] || 0}%` }}></div>
                          </div>
                          <p className="text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400">{Math.round(watchProgress[continueLearningLesson.id] || 0)}% completed</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTopic(continueLearningLesson.topic);
                            const list = lessonsDatabase[continueLearningLesson.topic] || [];
                            const idx = list.findIndex(l => l.id === continueLearningLesson.id);
                            if (idx !== -1) {
                              setLessonIndex(idx);
                            }
                            handlePlayVideo(continueLearningLesson);
                          }}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-all shadow-md"
                        >
                          <span>Resume Video Lesson</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    ) : currentLesson ? (
                      <div className="backdrop-blur-md bg-white/40 dark:bg-slate-900/40 p-5 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl space-y-3">
                        <div className="flex items-center space-x-2">
                          <PlayCircle className="text-slate-400 shrink-0" size={16} />
                          <span className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">Continue Learning</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{currentLesson.title}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">{selectedTopic} • Unit {currentLesson.lessonNum}</p>
                        </div>
                        <button
                          onClick={() => handlePlayVideo(currentLesson)}
                          className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-all"
                        >
                          <span>Start Video Lesson 🎥</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    ) : null}

                    {/* Recently Watched Widget */}
                    {recentlyWatched.length > 0 && (
                      <div className="backdrop-blur-md bg-white/40 dark:bg-slate-900/40 p-5 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl space-y-3 text-left">
                        <h4 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">Recently Watched</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {recentlyWatched.map((lesson) => (
                            <div 
                              key={lesson.id} 
                              onClick={() => {
                                setSelectedTopic(lesson.topic);
                                const idx = (lessonsDatabase[lesson.topic] || []).findIndex(l => l.id === lesson.id);
                                if (idx !== -1) setLessonIndex(idx);
                                handlePlayVideo(lesson);
                              }}
                              className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/10 hover:bg-white/80 dark:hover:bg-slate-950/30 transition-all flex items-center justify-between gap-2 cursor-pointer"
                            >
                              <div className="space-y-0.5 truncate flex-1">
                                <p className="text-xs font-bold text-slate-850 dark:text-slate-250 truncate">{lesson.title}</p>
                                <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 font-semibold">
                                  <span>{lesson.topic}</span>
                                  <span>•</span>
                                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{Math.round(watchProgress[lesson.id] || 0)}%</span>
                                </div>
                              </div>
                              <PlayCircle size={14} className="text-indigo-600 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Creator Videos Widget */}
                    {currentLesson.recommendedVideos && currentLesson.recommendedVideos.length > 0 && (
                      <div className="backdrop-blur-md bg-white/40 dark:bg-slate-900/40 p-5 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl space-y-3 text-left">
                        <h4 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">Recommended Videos</h4>
                        <p className="text-[10px] text-slate-500 font-semibold">Curated directly from premium developer channels.</p>
                        <div className="space-y-2">
                          {currentLesson.recommendedVideos.map((vid, idx) => (
                            <button
                              key={idx}
                              onClick={() => handlePlayRecommendedVideo(vid)}
                              className="w-full p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/10 hover:bg-indigo-650/5 hover:border-indigo-400 dark:hover:border-indigo-900/40 transition-all flex items-center justify-between gap-2 text-left cursor-pointer"
                            >
                              <div className="space-y-0.5 truncate flex-1">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{vid.title}</p>
                                <p className="text-[9px] font-bold text-indigo-605 dark:text-indigo-400">{vid.channel}</p>
                              </div>
                              <ExternalLink size={12} className="text-slate-400 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Active Interactive Lesson Dashboard */}
                  <div className="lg:col-span-8 backdrop-blur-md bg-white/45 dark:bg-slate-900/45 rounded-3xl p-6 border border-white/40 dark:border-white/5 shadow-xl space-y-5">
                
                {/* Active Unit Header */}
                <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3">
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                      Unit {currentLesson.lessonNum} of {currentLesson.totalLessons} | Topic: {selectedTopic}
                    </span>
                    <h4 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base md:text-lg">
                      {currentLesson.title}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[9px] font-mono font-bold uppercase shrink-0">
                      {currentLesson.estimatedTime}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded text-[9px] font-mono font-bold uppercase shrink-0">
                      {currentLesson.difficulty}
                    </span>
                  </div>
                </div>

                {/* Classroom Toggle controls */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit gap-1">
                  <button
                    onClick={() => setAssistantMode('educational')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      assistantMode === 'educational' 
                        ? 'bg-white dark:bg-slate-900 text-slate-850 dark:text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📖 Educational Lesson
                  </button>
                  <button
                    onClick={() => {
                      setAssistantMode('quiz');
                      setSelectedQuizOption(null);
                      setQuizSubmitted(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      assistantMode === 'quiz' 
                        ? 'bg-white dark:bg-slate-900 text-slate-850 dark:text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🧩 Interactive Test Quiz
                  </button>
                </div>

                {/* EDUCATIONAL STUDY VIEW */}
                {assistantMode === 'educational' && (
                  <div className="space-y-5 animate-fade-in text-left">
                    
                    {/* Embedded YouTube video card with Play trigger opening the modal */}
                    {(currentLesson.videoUrl || currentLesson.youtubeEmbedId) && (
                      <div className="space-y-3">
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-md group">
                          {/* Rich background cover with topic text overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
                            <div className="space-y-1">
                              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[9px] font-mono font-black uppercase tracking-wider">
                                YouTube Video Course
                              </span>
                              <h5 className="text-sm md:text-base font-bold text-slate-100 max-w-md line-clamp-1">
                                {currentLesson.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 font-medium">
                                Recommended Channel: {currentLesson.recommendedVideos?.[0]?.channel || 'Developer Creator'}
                              </p>
                            </div>

                            <button 
                              onClick={() => handlePlayVideo(currentLesson)}
                              className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg shadow-indigo-600/35 group-hover:scale-110 animate-fade-in"
                            >
                              <Play size={24} className="ml-1 fill-white text-white" />
                            </button>
                            
                            <p className="text-[11px] text-indigo-300 font-bold tracking-wide">
                              Click to Play Video Lesson 🎥
                            </p>
                          </div>
                        </div>
                        
                        {/* Interactive live watch progress display */}
                        <div className="space-y-1.5">
                          <div className="bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                            <div 
                              className="bg-indigo-650 h-full transition-all duration-300"
                              style={{ width: `${watchProgress[currentLesson.id] || 0}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span className="font-bold">Watch Progress: {Math.round(watchProgress[currentLesson.id] || 0)}%</span>
                            <span className="font-bold flex items-center space-x-1 text-slate-400">
                              <span>{watchProgress[currentLesson.id] >= 100 ? '✅ Completed (+50 XP)' : '⏱️ Saved automatically'}</span>
                              {watchProgress[currentLesson.id] > 0 && watchProgress[currentLesson.id] < 100 && (
                                <span className="text-indigo-500 font-bold">(Resumed from {Math.round(watchProgress[currentLesson.id])}%)</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lecture body */}
                    <div className="bg-white/60 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-150/50 dark:border-slate-850 text-xs md:text-sm text-slate-800 dark:text-slate-100 leading-relaxed space-y-3.5 shadow-xs">
                      <p className="whitespace-pre-line font-medium">{currentLesson.lecture}</p>
                    </div>

                    {/* Analogy & Beginner Explanation */}
                    <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10 space-y-1.5">
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase font-mono tracking-wider">💡 Realworld Analogy</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed italic">"{currentLesson.analogy}"</p>
                    </div>

                    {/* 4. Classroom Study Notes */}
                    {currentLesson.notes && (
                      <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 space-y-1.5">
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase font-mono tracking-wider">📝 Study & Review Notes</p>
                        <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">{currentLesson.notes}</p>
                      </div>
                    )}

                    {/* 5. Hands-on Classroom Exercises */}
                    {currentLesson.exercises && currentLesson.exercises.length > 0 ? (
                      <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 space-y-3">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase font-mono tracking-wider">🛠️ Hands-on Classroom Lab Exercises</p>
                        <div className="space-y-2">
                          {currentLesson.exercises.map((ex, idx) => (
                            <div key={idx} className="flex items-start space-x-2.5">
                              <span className="w-5 h-5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[10px] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">{ex}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 space-y-1.5">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase font-mono tracking-wider">🛠️ Recommended Hands-on Lab Task</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                          {currentLesson.miniExercise}
                        </p>
                      </div>
                    )}

                    {/* 6. AI Recommended Resources & Suggested Channels */}
                    {currentLesson.recommendedVideos && currentLesson.recommendedVideos.length > 0 && (
                      <div className="bg-slate-100/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                        <p className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold uppercase font-mono tracking-wider">🎥 Curated Creator video Channels</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {currentLesson.recommendedVideos.map((vid, idx) => (
                            <a
                              key={idx}
                              href={vid.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-3 bg-white/70 dark:bg-slate-950/20 rounded-xl border border-slate-150 dark:border-slate-800 flex items-center justify-between hover:border-indigo-400 dark:hover:border-indigo-900 transition-all text-xs"
                            >
                              <div className="space-y-0.5 truncate pr-1">
                                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{vid.title}</p>
                                <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-450">{vid.channel}</p>
                              </div>
                              <ExternalLink size={12} className="text-slate-400 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentLesson.aiResources && currentLesson.aiResources.length > 0 && (
                      <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10 space-y-2">
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase font-mono tracking-wider">🤖 AI Recommended Resources</p>
                        <div className="space-y-1.5 pl-3 border-l border-purple-150 dark:border-purple-900/40">
                          {currentLesson.aiResources.map((res, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                              <span className="text-purple-500 shrink-0">•</span>
                              <span>{res}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Navigation controls */}
                    <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex justify-between items-center">
                      <button
                        disabled={lessonIndex === 0}
                        onClick={() => {
                          setIsPlaying(false);
                          setLessonIndex(prev => Math.max(0, prev - 1));
                        }}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
                      >
                        Previous Lesson
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsPlaying(false);
                          handleNextLesson();
                        }}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white px-4.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Continue & Next Lesson</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                  </div>
                )}

                {/* INTERACTIVE QUIZ MODE */}
                {assistantMode === 'quiz' && (
                  <div className="space-y-5 animate-fade-in text-left">
                    
                    <div className="bg-white/60 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-150/50 dark:border-slate-850 space-y-3.5 shadow-xs">
                      <p className="text-xs uppercase font-bold text-indigo-500 font-mono">Evaluation Challenge</p>
                      <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                        {currentLesson.quizQuestion}
                      </p>
                    </div>

                    {/* Multiple Choice Options */}
                    <div className="space-y-2">
                      {currentLesson.quizOptions.map((opt, i) => {
                        const isSelected = selectedQuizOption === i;
                        const isCorrect = i === currentLesson.correctOptionIndex;
                        
                        let optionStyle = "border-slate-250 dark:border-slate-800 bg-white/35 dark:bg-slate-950/10 text-slate-800 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-950/20";
                        if (isSelected) {
                          optionStyle = "bg-indigo-600/10 border-indigo-500/50 text-indigo-700 dark:text-indigo-300 font-bold";
                        }
                        if (quizSubmitted) {
                          if (isCorrect) {
                            optionStyle = "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 font-bold";
                          } else if (isSelected) {
                            optionStyle = "bg-rose-500/10 border-rose-500/50 text-rose-700 dark:text-rose-300 font-bold";
                          }
                        }

                        return (
                          <button
                            key={i}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedQuizOption(i)}
                            className={`w-full p-4 rounded-xl border text-left text-xs md:text-sm font-semibold flex items-center justify-between transition-all ${optionStyle}`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="w-5.5 h-5.5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black shrink-0">
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span>{opt}</span>
                            </div>
                            
                            {quizSubmitted && isCorrect && <Check size={16} className="text-emerald-600 shrink-0" />}
                            {quizSubmitted && isSelected && !isCorrect && <AlertCircle size={16} className="text-rose-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quiz critique description card */}
                    {quizSubmitted && (
                      <div className={`p-4 rounded-2xl border leading-relaxed space-y-1.5 ${
                        quizIsCorrect ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-800 dark:text-slate-100' : 'bg-slate-100 dark:bg-slate-900 border-slate-200/50 text-slate-800 dark:text-slate-100'
                      }`}>
                        <p className="text-[10px] font-bold uppercase font-mono tracking-wider">
                          {quizIsCorrect ? "🌟 Answer Verified: Correct!" : "💡 System Assessment & Explanation"}
                        </p>
                        <p className="text-xs font-semibold">{currentLesson.explanation}</p>
                      </div>
                    )}

                    {/* Multiple Quizzes if available */}
                    {currentLesson.quizzes && currentLesson.quizzes.length > 0 && (
                      <div className="mt-4 space-y-4">
                        <p className="text-xs uppercase font-bold text-slate-400 font-mono">Additional Practice Quizzes</p>
                        {currentLesson.quizzes.map((qz, qIdx) => (
                          <div key={qIdx} className="bg-slate-100/40 dark:bg-slate-950/20 p-4.5 rounded-2xl border border-slate-200/50 dark:border-slate-850 space-y-3 text-left">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Bonus {qIdx + 1}: {qz.question}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {qz.options.map((opt, oIdx) => (
                                <div key={oIdx} className="p-3.5 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-150 dark:border-slate-800 text-xs font-semibold flex items-center space-x-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold uppercase shrink-0">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                            <div className="bg-indigo-50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-150/40 dark:border-indigo-900/40 text-[11px] leading-relaxed">
                              <p className="font-bold text-indigo-600 dark:text-indigo-400">💡 Correct Option: Option {String.fromCharCode(65 + qz.correctIndex)}</p>
                              <p className="text-slate-600 dark:text-slate-300 font-medium">{qz.explanation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex justify-between items-center">
                      <button
                        onClick={() => {
                          setSelectedQuizOption(null);
                          setQuizSubmitted(false);
                        }}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Reset Challenge
                      </button>

                      {!quizSubmitted ? (
                        <button
                          disabled={selectedQuizOption === null}
                          onClick={handleQuizSubmit}
                          className="bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Verify Selection
                        </button>
                      ) : (
                        <button
                          onClick={handleNextLesson}
                          className="bg-indigo-650 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Advance Unit</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>

                  </div>
                )}

              </div>

            </div>
          );
        })()}
      </div>
    )}

        {/* 4. PLACEMENT PREPARATION HUB TAB */}
        {subTab === 'placement' && (
          <div className="space-y-6">
            
            {/* Prep Hub subcategories checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: "Coding & DSA", total: 120, completed: 32, color: "from-blue-500 to-indigo-500" },
                { title: "Resume & Portfolio", total: 8, completed: 6, color: "from-emerald-500 to-teal-500" },
                { title: "System Design", total: 24, completed: 4, color: "from-purple-500 to-pink-500" },
                { title: "Mock Interview Prep", total: 15, completed: 8, color: "from-amber-500 to-orange-500" }
              ].map((sub, i) => (
                <div key={i} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Category {i + 1}</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{sub.title}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400">
                      <span>{Math.round((sub.completed / sub.total) * 100)}%</span>
                      <span>{sub.completed}/{sub.total} Solved</span>
                    </div>
                    <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${sub.color}`} style={{ width: `${(sub.completed / sub.total) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main boards layout: Mock prep prompts and STAR critique sandboxes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Placement Preps Cards board */}
              <div className="lg:col-span-6 backdrop-blur-md bg-white/40 dark:bg-slate-900/40 p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">Placement Milestone Tasks</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">Curated preparation tasks designed to get you past elite technical and behavioral screeners.</p>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {[
                    { title: "Implement binary search and tree traversals in Python", category: "Coding", difficulty: "Medium", points: "+50 XP" },
                    { title: "Review microservices scaling strategies and reverse proxies", category: "System Design", difficulty: "Advanced", points: "+80 XP" },
                    { title: "Write case narrative outlining impact of your chat server project", category: "Resume", difficulty: "Beginner", points: "+40 XP" },
                    { title: "Format professional portfolio header highlighting your hackathon wins", category: "Resume", difficulty: "Beginner", points: "+30 XP" },
                    { title: "Draft behavioral narrative explaining a conflict with a peer student", category: "Interview", difficulty: "Medium", points: "+60 XP" }
                  ].map((task, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 bg-white/60 dark:bg-slate-950/20 hover:bg-white/85 dark:hover:bg-slate-950/40 rounded-2xl border border-slate-150/50 dark:border-slate-850/60 flex items-center justify-between transition-all"
                    >
                      <div className="space-y-1 pr-3">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[8px] font-bold uppercase tracking-wider font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-1 rounded">
                            {task.category}
                          </span>
                          <span className="text-[8px] font-bold uppercase tracking-wider font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 px-1 rounded">
                            {task.difficulty}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-relaxed">{task.title}</p>
                      </div>

                      <button
                        onClick={() => grantXP(50, `Completed task "${task.title.slice(0, 20)}..."`)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase font-mono tracking-wider shrink-0 transition-colors"
                      >
                        {task.points}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* STAR Behavioral Interview critique sandbox */}
              <div className="lg:col-span-6 backdrop-blur-md bg-white/45 dark:bg-slate-900/45 p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">Behavioral Critique Sandbox</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">Interviewer Prompt: *"Tell me about a time when you had to work under a tight deadline with incomplete requirements."*</p>
                </div>

                <form onSubmit={handleCritiqueSubmit} className="space-y-3">
                  <textarea
                    required
                    rows={4}
                    placeholder="Draft your Situation, Task, Action, and Result narrative here..."
                    value={behavioralDraft}
                    onChange={(e) => setBehavioralDraft(e.target.value)}
                    className="w-full p-3.5 backdrop-blur-md bg-white/40 dark:bg-slate-950/20 border-2 border-white/40 dark:border-slate-800/60 focus:border-indigo-500 rounded-2xl outline-none text-slate-800 dark:text-slate-200 text-xs md:text-sm font-semibold leading-relaxed"
                  />

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setBehavioralDraft("Situation: In our college hackathon, we lost internet access with 3 hours left. Task: Deploy our machine learning flask API server offline. Action: Set up local SQLite and mock test queries. Result: Finished development on time, scoring 3rd place.")}
                      className="text-xs text-indigo-600 hover:underline font-bold"
                    >
                      💡 Insert STAR Demo Template
                    </button>
                    
                    <button
                      type="submit"
                      disabled={critiqueLoading || !behavioralDraft.trim()}
                      className="bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-indigo-650/15"
                    >
                      {critiqueLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>AI evaluating...</span>
                        </>
                      ) : (
                        <>
                          <Send size={12} />
                          <span>Submit Draft for critique</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Heuristic Evaluation critique result */}
                {critiqueOutput && (
                  <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 p-4.5 rounded-2xl text-xs text-slate-700 dark:text-slate-300 space-y-2 max-h-[180px] overflow-y-auto leading-relaxed font-semibold">
                    <ReactMarkdown>{critiqueOutput}</ReactMarkdown>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* 5. WEEKLY GROWTH REVIEWS TAB */}
        {subTab === 'review' && (
          <div className="space-y-6">
            
            {/* Main Weekly Growth Report Visual Panel */}
            <div className="backdrop-blur-md bg-white/45 dark:bg-slate-900/45 p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-600 rounded-lg">
                    <BarChart size={16} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">Weekly Growth Report (Sunday Review)</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-widest">Compounding knowledge summary</p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-indigo-650 text-white rounded-lg text-[10px] font-black tracking-widest uppercase font-mono">
                  Confidence score: 82%
                </span>
              </div>

              {/* Highlight metrics panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="bg-white/40 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Hours Logged</p>
                  <p className="text-xl font-display font-bold text-slate-800 dark:text-slate-200">12.5 hours</p>
                  <p className="text-[9px] text-emerald-600 font-bold">▲ +14% from target</p>
                </div>

                <div className="bg-white/40 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Lessons Completed</p>
                  <p className="text-xl font-display font-bold text-slate-800 dark:text-slate-200">9 units</p>
                  <p className="text-[9px] text-indigo-600 font-bold">▲ +3 milestones</p>
                </div>

                <div className="bg-white/40 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Roadmap Progress</p>
                  <p className="text-xl font-display font-bold text-slate-800 dark:text-slate-200">35% average</p>
                  <p className="text-[9px] text-slate-400 font-semibold">Active syllabus sync</p>
                </div>

                <div className="bg-white/40 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Suggested next skill</p>
                  <p className="text-xs font-display font-bold text-indigo-700 dark:text-indigo-400 truncate pt-1">Git & GitHub versioning</p>
                  <p className="text-[9px] text-slate-400 font-semibold">Ready to unlock</p>
                </div>
              </div>

              {/* Narrative Analysis */}
              <div className="bg-white/60 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-150/50 dark:border-slate-850 space-y-3 leading-relaxed text-slate-700 dark:text-slate-300 text-xs font-semibold">
                <p className="font-bold text-slate-850 dark:text-slate-200">🤖 AI Coach Evaluation Summary:</p>
                <p>
                  "Your learning velocity is compounding beautifully, Aditi. This week, your Linux and Python core programming milestones showed consistent engagement, keeping your active daily streak at 5 days. However, your response analytics indicate minor friction with complex permission hierarchies in Linux.
                </p>
                <p>
                  **Identified Weak Areas**: Linux advanced permission parameters (octal modes and executable script permissions).
                </p>
                <p>
                  **Recommendation**: Re-evaluate Lesson 3 of the Linux Academy and run hands-on file creation exercises using the STAR terminal critique before launching into advanced Docker containerizations next Sunday."
                </p>
              </div>
            </div>

            {/* Badges & Achievements Display */}
            <div className="backdrop-blur-md bg-white/45 dark:bg-slate-900/45 p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-xl space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">Your Unlocked Achievement Badges</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">Each master lesson and successful quiz awards rare, persistent community ranks.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                {[
                  { title: "🏆 Linux Explorer", desc: "Completed Unit 3 Linux Permissions", unlocked: true },
                  { title: "🏆 DSA Beginner", desc: "First trees problem solved", unlocked: true },
                  { title: "🏆 Consistency Champion", desc: "Maintained 5-day study loop", unlocked: true },
                  { title: "🏆 Docker Starter", desc: "Wrote first functional Dockerfile", unlocked: false },
                  { title: "🏆 AI Enthusiast", desc: "Called a Gemini SDK model", unlocked: false },
                  { title: "🏆 Placement Warrior", desc: "Completed 5 mock prompts", unlocked: false }
                ].map((badge, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between space-y-2 transition-all duration-150 ${
                      badge.unlocked 
                        ? 'bg-gradient-to-br from-indigo-50/50 to-indigo-100/10 dark:from-indigo-950/20 border-indigo-200 text-slate-800 dark:text-slate-200' 
                        : 'bg-slate-100/40 dark:bg-slate-950/10 border-slate-200/40 dark:border-slate-800/60 text-slate-400 opacity-55'
                    }`}
                  >
                    <div className="text-2xl">{badge.title.split(' ')[0]}</div>
                    <div>
                      <p className="text-[10px] font-bold leading-tight">{badge.title.substring(2)}</p>
                      <p className="text-[8px] text-slate-400 leading-tight mt-0.5">{badge.desc}</p>
                    </div>
                    <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded ${badge.unlocked ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {badge.unlocked ? "UNLOCKED" : "LOCKED"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Cinematic Video Playback Cinema Modal */}
      {activeVideoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 md:p-6 animate-fade-in"
          onClick={handleCloseVideoModal}
        >
          <div 
            className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-800 bg-slate-900/50">
              <div className="space-y-1 text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 font-mono">
                  Classroom Cinema | {activeVideoModal.topic} Academy
                </span>
                <h3 className="text-sm md:text-base font-bold text-slate-100 font-display">
                  {activeVideoModal.title}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {isValidYoutubeEmbed(activeVideoModal.videoUrl) && !embedFailed && (
                  <button
                    onClick={() => setEmbedFailed(true)}
                    className="px-2.5 py-1 text-[10px] font-mono text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 rounded-lg transition-all cursor-pointer"
                    title="If video is blocked or unavailable, play directly on YouTube"
                  >
                    Video Unavailable? ⚠️
                  </button>
                )}
                <button 
                  onClick={handleCloseVideoModal} 
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Video Iframe Container */}
            <div className="relative aspect-video bg-black w-full border-b border-slate-850">
              {embedFailed || !isValidYoutubeEmbed(activeVideoModal.videoUrl) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-white space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500">
                    <AlertCircle size={32} />
                  </div>
                  <div className="max-w-md space-y-2">
                    <p className="text-sm font-bold text-slate-100">This video cannot be embedded.</p>
                    <p className="text-xs text-slate-400">Watch directly on YouTube.</p>
                    <a
                      href={getYoutubeWatchUrl(activeVideoModal.videoUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      <span>▶ Open in YouTube</span>
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  {isVideoLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 space-y-3 z-10 animate-pulse">
                      <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin" />
                      <span className="text-[11px] font-mono font-medium tracking-wide">Connecting to YouTube...</span>
                    </div>
                  )}
                  <iframe
                    src={activeVideoModal.videoUrl}
                    title={activeVideoModal.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="absolute inset-0 w-full h-full"
                    onLoad={() => setIsVideoLoading(false)}
                  ></iframe>
                </>
              )}
            </div>

            {/* Controls / Information */}
            <div className="p-4 md:p-6 bg-slate-900/90 space-y-4 text-left">
              {/* Progress Tracker Slider & Duration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="font-bold flex items-center space-x-1">
                    <Clock size={12} className="text-indigo-400" />
                    <span>Duration: {activeVideoModal.estimatedTime}</span>
                  </span>
                  <span className="font-bold text-indigo-400">
                    Watch Progress: {Math.round(modalProgress)}%
                  </span>
                </div>

                {/* Styled interactive slider */}
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-mono text-slate-500">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isNaN(modalProgress) ? 0 : modalProgress}
                    onChange={(e) => handleModalProgressChange(Number(e.target.value) || 0)}
                    className="flex-1 h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] font-mono text-slate-500">100%</span>
                </div>
              </div>

              {/* Action controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setModalIsPlaying(!modalIsPlaying)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      modalIsPlaying 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {modalIsPlaying ? (
                      <>
                        <Pause size={12} className="fill-white" />
                        <span>Pause Tracker</span>
                      </>
                    ) : (
                      <>
                        <Play size={12} className="fill-white" />
                        <span>Auto Increment Tracker</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">
                    {modalIsPlaying ? '🎥 Progress auto-incrementing...' : '⏸️ Paused. Scrub slider manually.'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleModalProgressChange(100)}
                    className="px-3.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/15 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Mark 100% Watched (+50 XP)
                  </button>
                  <button
                    onClick={handleCloseVideoModal}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Keep Position
                  </button>
                </div>
              </div>

              {/* Resumed progress notification */}
              {modalResumed && (
                <p className="text-[10px] font-mono text-indigo-400/80 bg-indigo-500/5 px-2.5 py-1 rounded-md border border-indigo-500/10 w-fit">
                  🔄 Resumed from your previous session at {Math.round(currentLessonProgressBeforeModal)}%!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
