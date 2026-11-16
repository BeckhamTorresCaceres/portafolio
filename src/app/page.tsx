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
  usePortfolioAnimations,
} from "@/features/portfolio";
import { FighterJetCrash, useThemeMode } from "@/features/theme-toggle";

const Scene = dynamic(() => import("@/features/three"), { ssr: false });

export default function Home() {
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

  const goto = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

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
        <HeroSection onNavigate={goto} />
        <AboutSection />
        <MarqueeSection />
        <SkillsSection />
        <ProjectsSection trackRef={trackRef} />
        <ExperienceSection />
        <ContactSection year={year} />
      </main>
    </div>
  );
}
