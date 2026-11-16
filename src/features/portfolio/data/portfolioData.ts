import { JobItem, ProjectItem, SkillItem, StatItem } from "../types";

export const developerProfile = {
  name: "Tu Nombre",
  role: "Desarrollador Full-Stack",
  headline: "Código limpio, detalles cuidados.",
  description:
    "Desarrollador Full-Stack. Construyo productos web rápidos, escalables y con experiencias interactivas en 3D.",
  bio: "Soy desarrollador con foco en arquitectura frontend y experiencias interactivas. Me gusta llevar una idea desde el diseño hasta producción, cuidando rendimiento, accesibilidad y mantenibilidad.",
  email: "hola@tudominio.dev",
  socialLinks: [
    { label: "github", href: "#" },
    { label: "linkedin", href: "#" },
    { label: "twitter", href: "#" },
  ],
};

export const stats: StatItem[] = [
  { number: "6", label: "años exp." },
  { number: "40", label: "proyectos" },
  { number: "12", label: "OSS repos" },
];

export const skills: SkillItem[] = [
  { t: "Frontend", d: "React, Next.js, TypeScript, Tailwind", n: "01" },
  { t: "Backend", d: "Node.js, NestJS, PostgreSQL, Redis", n: "02" },
  { t: "3D & Motion", d: "Three.js, R3F, GSAP, WebGL", n: "03" },
  { t: "DevOps", d: "Docker, CI/CD, AWS, Vercel", n: "04" },
];

export const projects: ProjectItem[] = [
  {
    n: "01",
    t: "Nebula Dashboard",
    d: "Panel de analítica en tiempo real con WebSockets y gráficos WebGL.",
    s: ["React", "D3", "WebSocket"],
    c: "from-emerald-400/30",
  },
  {
    n: "02",
    t: "Orbit Commerce",
    d: "E-commerce headless con checkout optimizado y visor de producto 3D.",
    s: ["Next.js", "Stripe", "Three.js"],
    c: "from-indigo-400/30",
  },
  {
    n: "03",
    t: "Pulse API",
    d: "API escalable con colas, caché y observabilidad end-to-end.",
    s: ["Node", "PostgreSQL", "Docker"],
    c: "from-fuchsia-400/30",
  },
  {
    n: "04",
    t: "CodeLens CLI",
    d: "Herramienta open source para auditar dependencias y rendimiento.",
    s: ["TypeScript", "CLI", "OSS"],
    c: "from-amber-300/30",
  },
];

export const jobs: JobItem[] = [
  {
    y: "2023 — Actual",
    r: "Senior Full-Stack Developer",
    c: "Empresa Tech",
    d: "Lidero el frontend de una plataforma SaaS con más de 200k usuarios.",
  },
  {
    y: "2020 — 2023",
    r: "Full-Stack Developer",
    c: "Studio Digital",
    d: "Producto web, APIs y experiencias interactivas para marcas internacionales.",
  },
  {
    y: "2018 — 2020",
    r: "Frontend Developer",
    c: "Startup Labs",
    d: "Primer producto desde cero hasta producción en 8 meses.",
  },
];

export const techStack: string[] = [
  "React",
  "TypeScript",
  "Next.js",
  "Node.js",
  "Three.js",
  "GSAP",
  "PostgreSQL",
  "Docker",
  "Tailwind",
  "AWS",
];
