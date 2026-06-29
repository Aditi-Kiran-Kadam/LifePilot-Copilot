/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, ShieldAlert, Cpu, Network, ArrowRight, User, Mail, Hash, GraduationCap, Calendar, Target, X } from 'lucide-react';

interface NeuralLoginModalProps {
  onLoginSuccess: () => void;
}

export const NeuralLoginModal: React.FC<NeuralLoginModalProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    collegeId: '',
    major: '',
    semester: '',
    careerGoal: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNetworkStatus, setShowNetworkStatus] = useState(true);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const autofillGuest = () => {
    setFormData({
      name: 'Aditi Kadam',
      email: 'aditi@university.edu',
      collegeId: '2023CS001',
      major: 'Computer Science',
      semester: 'Third Year',
      careerGoal: 'AI Engineer',
    });
  };

  const handleEnterAsGuest = () => {
    // Autofill and submit immediately
    const guestData = {
      name: 'Aditi Kadam',
      email: 'aditi@university.edu',
      collegeId: '2023CS001',
      major: 'Computer Science',
      semester: 'Third Year',
      careerGoal: 'AI Engineer',
    };
    setFormData(guestData);
    submitData(guestData);
  };

  const submitData = (data: typeof formData) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      // 1. Prepare profile info matching the User Profile System guidelines
      const userProfilePayload = {
        name: data.name || "Aditi Kadam",
        email: data.email || "aditi@university.edu",
        department: data.major || "Computer Science",
        semester: data.semester || "Third Year",
        careerGoal: data.careerGoal || "AI Engineer",
        goal: data.careerGoal || "AI Engineer",
        avatar: "🎓",
        college: "University Department of Computer Science",
        role: "Student"
      };

      // 2. Set BOTH lifepilot_user and lifepilotUser keys for absolute safety
      localStorage.setItem("lifepilot_user", JSON.stringify(userProfilePayload));
      localStorage.setItem("lifepilotUser", JSON.stringify(userProfilePayload));
      localStorage.setItem("lifepilot_authenticated", "true");
      localStorage.setItem("lifepilotAuthenticated", "true");

      // 3. Synchronize with the existing lp_profile schema to make the dashboard dynamic
      const lpProfileData = {
        name: userProfilePayload.name,
        role: "Student",
        bio: `Majoring in ${userProfilePayload.department} (${userProfilePayload.semester}). Career goal: ${userProfilePayload.goal}. College: ${userProfilePayload.college}.`,
        strengths: ["Rigorous DSA skills", "Keen curiosity", "Strong technical foundations"],
        challenges: ["Context switching under heavy workload", "Occasions of exam-season anxiety"],
        coreGoals: [userProfilePayload.goal, "Secure top internship", "Maintain top GPA"],
        interests: [userProfilePayload.department, "Artificial Intelligence", "Software Systems"],
        growthAreas: ["Effective time boxing", "Project portfolio construction"],
        recommendedSkills: ["Docker Containerization", "Kubernetes", "React", "AI Prompting"],
        onboarded: true
      };
      localStorage.setItem("lp_profile", JSON.stringify(lpProfileData));

      setIsSubmitting(false);
      onLoginSuccess();
    }, 1200); //snappy loading delay for sci-fi HUD sync simulation
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    if (!formData.collegeId.trim()) newErrors.collegeId = 'Required';
    if (!formData.major.trim()) newErrors.major = 'Required';
    if (!formData.semester.trim()) newErrors.semester = 'Required';
    if (!formData.careerGoal.trim()) newErrors.careerGoal = 'Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    submitData(formData);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Immersive background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Dynamic floating soft blurred nodes */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-emerald-500/8 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />

        {/* Floating geometric tech coordinates */}
        <div className="absolute top-8 left-10 text-[10px] text-cyan-500/20 font-mono select-none">
          SECURE_NODE_ONLINE // SYS_PORT_3000
        </div>
        <div className="absolute bottom-8 right-10 text-[10px] text-emerald-500/20 font-mono select-none">
          SECURE_LINK_ESTABLISHED // VER_1.4.2
        </div>
      </div>

      {/* Main Glassmorphism Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-slate-900/60 backdrop-blur-2xl border border-cyan-500/20 rounded-[24px] shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden my-auto"
      >
        {/* Accent glow line at top */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500 to-emerald-500" />

        {/* Header/Controls area */}
        <div className="flex justify-between items-center p-6 pb-0">
          {/* Connection status badge */}
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">SYSTEM READY</span>
          </div>

          {/* Quick actions top-right */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleEnterAsGuest}
              type="button"
              className="text-xs text-slate-400 hover:text-cyan-400 font-mono tracking-wider transition-colors duration-200 uppercase flex items-center space-x-1 hover:underline cursor-pointer"
            >
              <span>Continue as Guest</span>
              <ArrowRight size={12} />
            </button>
            <button
              onClick={handleEnterAsGuest}
              type="button"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close & Enter as Guest"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Form Body Container */}
        <div className="p-8 sm:p-10 flex flex-col items-center">
          {/* Animated Glowing Orb & Title */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="relative mb-5 flex items-center justify-center">
              {/* Outer animated scanning circle */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute w-20 h-20 rounded-full border border-dashed border-cyan-500/30"
              />
              {/* Pulsing glow background */}
              <div className="absolute w-14 h-14 rounded-full bg-cyan-500/20 blur-md animate-pulse" />
              {/* Center CPU/Network Icon */}
              <div className="relative w-12 h-12 rounded-full bg-slate-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Network size={22} className="animate-pulse" />
              </div>
            </div>

            {/* Heading removed */}
            <p className="text-xs text-slate-400 mt-1 font-sans tracking-wide">
              Initialize your LifePilot identity to configure the AI Operating System
            </p>
          </div>

          {/* Main Input Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Field 1: Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <User size={12} className="text-cyan-400" />
                  <span>Student Name</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Aditi Kadam"
                    className={`w-full bg-slate-950/70 border ${errors.name ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-cyan-500/50'} text-slate-200 rounded-xl py-3 px-4 text-sm font-sans placeholder-slate-600 focus:outline-none transition-all duration-300`}
                  />
                  {errors.name && (
                    <span className="absolute right-3 top-3 text-[10px] font-mono text-rose-400">
                      Required
                    </span>
                  )}
                </div>
              </div>

              {/* Field 2: University Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Mail size={12} className="text-cyan-400" />
                  <span>University Email</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="aditi@university.edu"
                    className={`w-full bg-slate-950/70 border ${errors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-cyan-500/50'} text-slate-200 rounded-xl py-3 px-4 text-sm font-sans placeholder-slate-600 focus:outline-none transition-all duration-300`}
                  />
                  {errors.email && (
                    <span className="absolute right-3 top-3 text-[10px] font-mono text-rose-400">
                      Required
                    </span>
                  )}
                </div>
              </div>

              {/* Field 3: College ID */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Hash size={12} className="text-cyan-400" />
                  <span>College ID</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.collegeId}
                    onChange={(e) => handleInputChange('collegeId', e.target.value)}
                    placeholder="2023CS001"
                    className={`w-full bg-slate-950/70 border ${errors.collegeId ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-cyan-500/50'} text-slate-200 rounded-xl py-3 px-4 text-sm font-sans placeholder-slate-600 focus:outline-none transition-all duration-300`}
                  />
                  {errors.collegeId && (
                    <span className="absolute right-3 top-3 text-[10px] font-mono text-rose-400">
                      Required
                    </span>
                  )}
                </div>
              </div>

              {/* Field 4: Major / Department */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <GraduationCap size={12} className="text-cyan-400" />
                  <span>Major / Department</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => handleInputChange('major', e.target.value)}
                    placeholder="Computer Science"
                    className={`w-full bg-slate-950/70 border ${errors.major ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-cyan-500/50'} text-slate-200 rounded-xl py-3 px-4 text-sm font-sans placeholder-slate-600 focus:outline-none transition-all duration-300`}
                  />
                  {errors.major && (
                    <span className="absolute right-3 top-3 text-[10px] font-mono text-rose-400">
                      Required
                    </span>
                  )}
                </div>
              </div>

              {/* Field 5: Semester */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Calendar size={12} className="text-cyan-400" />
                  <span>Semester / Level</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.semester}
                    onChange={(e) => handleInputChange('semester', e.target.value)}
                    placeholder="Third Year"
                    className={`w-full bg-slate-950/70 border ${errors.semester ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-cyan-500/50'} text-slate-200 rounded-xl py-3 px-4 text-sm font-sans placeholder-slate-600 focus:outline-none transition-all duration-300`}
                  />
                  {errors.semester && (
                    <span className="absolute right-3 top-3 text-[10px] font-mono text-rose-400">
                      Required
                    </span>
                  )}
                </div>
              </div>

              {/* Field 6: Career Goal */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Target size={12} className="text-cyan-400" />
                  <span>Career Goal</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.careerGoal}
                    onChange={(e) => handleInputChange('careerGoal', e.target.value)}
                    placeholder="Software Engineer"
                    className={`w-full bg-slate-950/70 border ${errors.careerGoal ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-cyan-500/50'} text-slate-200 rounded-xl py-3 px-4 text-sm font-sans placeholder-slate-600 focus:outline-none transition-all duration-300`}
                  />
                  {errors.careerGoal && (
                    <span className="absolute right-3 top-3 text-[10px] font-mono text-rose-400">
                      Required
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Quick autofill helper */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={autofillGuest}
                className="text-[11px] font-mono text-cyan-400/80 hover:text-cyan-400 transition-colors flex items-center space-x-1.5 hover:underline cursor-pointer"
              >
                <Sparkles size={11} className="animate-spin [animation-duration:6s]" />
                <span>Autofill Sample Profile</span>
              </button>
            </div>

            {/* Bottom Large Action Button */}
            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.015, boxShadow: "0 0 20px rgba(6,182,212,0.3)" }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={isSubmitting}
                className="relative w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-mono font-bold uppercase tracking-[0.15em] text-sm flex items-center justify-center space-x-2.5 transition-all duration-300 shadow-lg shadow-cyan-500/10 cursor-pointer overflow-hidden disabled:opacity-80"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-950/25 border-t-slate-950 animate-spin" />
                    <span>Synchronizing Core...</span>
                  </>
                ) : (
                  <>
                    <span>Enter LifePilot</span>
                    <ArrowRight size={16} className="text-slate-950 stroke-[2.5]" />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>

        {/* Console / Aesthetic sub-footer */}
        <div className="bg-slate-950/50 border-t border-slate-800/40 p-4 px-8 text-center flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500">
            SECURE HANDSHAKE: COMPLETED
          </span>
          <span className="text-[10px] font-mono text-slate-500 tracking-wide">
            "Built for students, creators and ambitious learners"
          </span>
        </div>
      </motion.div>
    </div>
  );
};
