"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ScrollIndicator } from "@/shared";
import {
  PortfolioHeader,
  HeroSection,
  AboutSection,
  MarqueeSection,
  SkillsSection,
  ProjectsSection,
  ExperienceSection,
  ContactSection,
} from "@/features/portfolio/components";
import { usePortfolioAnimations } from "@/features/portfolio/hooks/usePortfolioAnimations";
import { CommentsSection } from "@/features/comments";
import { FighterJetCrash, useThemeMode } from "@/features/theme-toggle";

const Scene = dynamic(() => import("@/features/three"), { ssr: false });

interface PortfolioClientProps {
  initialData: {
    profile?: any;
    projects?: any[];
    skills?: any[];
    experiences?: any[];
    techStack?: string[];
  };
}

export function PortfolioClient({ initialData }: PortfolioClientProps) {
  const [year, setYear] = useState<number>(2026);
  const { rootRef, trackRef } = usePortfolioAnimations();
  const {
    light,
    mounted,
    isCrashing,
    themeBtnRef,
    handleThemeClick,
    handleImpact,
    handleCrashComplete,
  } = useThemeMode();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const goto = (id: string) => {
    const target = document.querySelector(id);
    if (!target) return;
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: Element, opt?: object) => void } }).lenis;
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <Scene light={light} />
      <div className="fixed inset-0 z-0 grid-bg pointer-events-none opacity-60" />

      {/* Cyber Aerospace Scroll Indicator (Laser Top Bar + Lateral HUD Rail) */}
      <ScrollIndicator onNavigate={goto} />

      {/* Header and navigation */}
      <PortfolioHeader
        onNavigate={goto}
        themeBtnRef={themeBtnRef}
        onThemeClick={handleThemeClick}
        isCrashing={isCrashing}
        light={light}
        mounted={mounted}
      />

      {/* Supersonic Fighter Jet Impact Animation */}
      <FighterJetCrash
        active={isCrashing}
        targetRef={themeBtnRef}
        onImpact={handleImpact}
        onComplete={handleCrashComplete}
      />

      {/* Content Sections */}
      <main className="relative z-10">
        <HeroSection onNavigate={goto} profile={initialData.profile} />
        <AboutSection profile={initialData.profile} />
        <MarqueeSection techStack={initialData.techStack} />
        <SkillsSection skills={initialData.skills} />
        <ProjectsSection trackRef={trackRef} projects={initialData.projects} />
        <ExperienceSection experiences={initialData.experiences} />
        <CommentsSection />
        <ContactSection year={year} profile={initialData.profile} />
      </main>
    </div>
  );
}
