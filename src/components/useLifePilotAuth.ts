/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';

export interface NeuralUserData {
  name: string;
  email: string;
  collegeId: string;
  major: string;
  semester: string;
  careerGoal: string;
}

export const useLifePilotAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("lifepilot_authenticated") === "true" ||
           localStorage.getItem("lifepilotAuthenticated") === "true";
  });

  const [seenIntro, setSeenIntro] = useState<boolean>(() => {
    return localStorage.getItem("lifepilot_seen_intro") === "true";
  });

  const loginAsGuest = useCallback((data: NeuralUserData) => {
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

    localStorage.setItem("lifepilot_user", JSON.stringify(userProfilePayload));
    localStorage.setItem("lifepilotUser", JSON.stringify(userProfilePayload));
    localStorage.setItem("lifepilot_authenticated", "true");
    localStorage.setItem("lifepilotAuthenticated", "true");
    localStorage.setItem("lifepilot_seen_intro", "true");
    
    // Seed standard profile so existing dashboard elements remain cohesive and fully customized
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

    setIsAuthenticated(true);
    setSeenIntro(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("lifepilot_authenticated");
    localStorage.removeItem("lifepilotAuthenticated");
    localStorage.removeItem("lifepilotUser");
    localStorage.removeItem("lifepilot_user");
    localStorage.removeItem("lifepilot_seen_intro");
    setIsAuthenticated(false);
    setSeenIntro(false);
  }, []);

  return {
    isAuthenticated,
    seenIntro,
    loginAsGuest,
    logout,
    setIsAuthenticated,
    setSeenIntro,
  };
};
