"use client";

interface ContactSectionProps {
  year: number;
  profile?: {
    name: string;
    email: string;
    socialLinks: { label: string; href: string }[];
  };
}

export function ContactSection({
  year,
  profile = {
    name: "Beckham Torres Caceres",
    email: "beckhamjosethtorrescaceres@gmail.com",
    socialLinks: [
      { label: "github", href: "https://github.com/BeckhamTorresCaceres" },
      { label: "linkedin", href: "#" },
      { label: "twitter", href: "#" },
    ],
  },
}: ContactSectionProps) {
  const { name, email, socialLinks } = profile;

  return (
    <section
      id="contact"
      className="min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 py-20 sm:py-32"
    >
      <p className="font-mono text-accent text-sm mb-4 sm:mb-6 reveal">{"// contacto"}</p>
      <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold leading-tight sm:leading-none reveal">
        ¿Construimos
        <br />
        algo juntos?
      </h2>
      <a
        href={`mailto:${email}`}
        className="reveal mt-8 sm:mt-12 font-mono text-sm sm:text-lg md:text-2xl px-5 sm:px-8 py-3 sm:py-4 rounded-full bg-accent text-on-accent font-medium hover:scale-105 transition-transform max-w-[90vw] truncate"
      >
        {email}
      </a>
      <div className="reveal mt-8 sm:mt-10 flex flex-wrap justify-center gap-6 sm:gap-8 font-mono text-xs sm:text-sm text-fg/50">
        {socialLinks.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="hover:text-accent transition-colors"
          >
            {label}↗
          </a>
        ))}
      </div>
      <p className="mt-16 sm:mt-24 font-mono text-[10px] sm:text-xs text-fg/30 max-w-sm px-4">
        © {year} {name} — hecho con React, Three.js, GSAP & Lenis
      </p>
    </section>
  );
}
