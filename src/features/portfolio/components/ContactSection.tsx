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
      className="min-h-screen flex flex-col justify-center items-center text-center px-6 py-32"
    >
      <p className="font-mono text-accent text-sm mb-6 reveal">{"// contacto"}</p>
      <h2 className="text-5xl md:text-8xl font-bold leading-none reveal">
        ¿Construimos
        <br />
        algo juntos?
      </h2>
      <a
        href={`mailto:${email}`}
        className="reveal mt-12 font-mono text-lg md:text-2xl px-8 py-4 rounded-full bg-accent text-on-accent font-medium hover:scale-105 transition-transform"
      >
        {email}
      </a>
      <div className="reveal mt-10 flex gap-8 font-mono text-sm text-fg/50">
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
      <p className="mt-24 font-mono text-xs text-fg/30">
        © {year} {name} — hecho con React, Three.js, GSAP & Lenis
      </p>
    </section>
  );
}
