"use server";

import {
  getPublicProfile,
  getPublicProjects,
  getPublicSkills,
  getPublicExperiences,
  getPublicTechStack,
} from "./portfolio";

export async function getPortfolioData() {
  const [profile, projects, skills, experiences, techStack] = await Promise.all([
    getPublicProfile(),
    getPublicProjects(),
    getPublicSkills(),
    getPublicExperiences(),
    getPublicTechStack(),
  ]);
  return { profile, projects, skills, experiences, techStack };
}
