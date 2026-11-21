import { prisma } from "@/lib/prisma";
import { ProjectItem, SkillItem, JobItem } from "@/features/portfolio/types";

const GRADIENT_COLORS = [
  "from-emerald-400/30",
  "from-indigo-400/30",
  "from-fuchsia-400/30",
  "from-amber-300/30",
  "from-cyan-400/30",
  "from-rose-400/30",
];

export async function getPublicProfile() {
  const profile = await prisma.profile.findFirst();
  if (!profile) {
    return {
      name: "Beckham Torres Caceres",
      role: "Desarrollador Full-Stack",
      headline: "Código limpio, detalles cuidados.",
      description: "Desarrollador Full-Stack. Construyo productos web rápidos, escalables y con experiencias interactivas en 3D.",
      bio: "Soy desarrollador con foco en arquitectura frontend y experiencias interactivas.",
      email: "beckhamjosethtorrescaceres@gmail.com",
      socialLinks: [
        { label: "github", href: "https://github.com/BeckhamTorresCaceres" },
        { label: "linkedin", href: "#" },
        { label: "twitter", href: "#" },
      ],
    };
  }

  return {
    name: profile.name,
    role: profile.role,
    headline: profile.headline || "",
    description: profile.description || "",
    bio: profile.bio,
    email: profile.email,
    socialLinks: [
      { label: "github", href: profile.githubUrl || "#" },
      { label: "linkedin", href: profile.linkedinUrl || "#" },
      { label: "twitter", href: profile.twitterUrl || "#" },
    ],
  };
}

export async function getPublicProjects(): Promise<ProjectItem[]> {
  const dbProjects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  return dbProjects.map((p, idx) => ({
    n: String(idx + 1).padStart(2, "0"),
    t: p.title,
    d: p.description,
    s: p.stack,
    c: GRADIENT_COLORS[idx % GRADIENT_COLORS.length],
    demoUrl: p.demoUrl,
    repoUrl: p.repoUrl,
    slug: p.slug,
  }));
}

export async function getPublicSkills(): Promise<SkillItem[]> {
  const dbSkills = await prisma.skill.findMany({
    orderBy: { order: "asc" },
  });

  // Group skills by category
  const grouped = dbSkills.reduce<Record<string, string[]>>((acc, s) => {
    acc[s.category] = acc[s.category] || [];
    acc[s.category].push(s.name);
    return acc;
  }, {});

  const categories = Object.keys(grouped);
  return categories.map((cat, idx) => ({
    t: cat,
    d: grouped[cat].join(", "),
    n: String(idx + 1).padStart(2, "0"),
  }));
}

export async function getPublicExperiences(): Promise<JobItem[]> {
  const experiences = await prisma.experience.findMany({
    orderBy: { order: "asc" },
  });

  return experiences.map((exp) => ({
    y: exp.period,
    r: exp.role,
    c: exp.company,
    d: exp.description,
  }));
}

export async function getPublicTechStack(): Promise<string[]> {
  const skills = await prisma.skill.findMany({
    select: { name: true },
    orderBy: { order: "asc" },
  });

  return skills.map((s) => s.name);
}
