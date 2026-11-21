export interface SkillItem {
  t: string;
  d: string;
  n: string;
}

export interface ProjectItem {
  n: string;
  t: string;
  d: string;
  s: string[];
  c: string;
  demoUrl?: string | null;
  repoUrl?: string | null;
  slug?: string;
}

export interface JobItem {
  y: string;
  r: string;
  c: string;
  d: string;
}

export interface StatItem {
  number: string;
  label: string;
}
