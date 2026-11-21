"use client";

interface HeroSectionProps {
  onNavigate: (id: string) => void;
  profile?: {
    name: string;
    description: string;
  };
}

export function HeroSection({
  onNavigate,
  profile = {
    name: "Beckham Torres Caceres",
    description: "Desarrollador Full-Stack. Construyo productos web rápidos, escalables y con experiencias interactivas en 3D.",
  },
}: HeroSectionProps) {
  const { name, description } = profile;

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center px-6 md:px-12 relative"
    >
      <div className="hero-content max-w-3xl">
        <p className="hero-fade font-mono text-accent text-sm mb-6">
          <span className="text-fg/40">$</span> whoami
          <span className="cursor-blink">_</span>
        </p>
        <h1
          className="text-4xl sm:text-6xl md:text-8xl font-bold leading-[1.05] sm:leading-[0.95] tracking-tight"
          style={{ perspective: 600 }}
        >
          {["Hola, soy", name].map((line, li) => (
            <span key={li} className="block overflow-hidden pb-1 sm:pb-2">
              {line.split("").map((ch, i) => (
                <span
                  key={i}
                  className={`hero-char inline-block ${
                    li === 1
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent2"
                      : ""
                  }`}
                >
                  {ch === " " ? "\u00A0" : ch}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p className="hero-fade mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-fg/60 max-w-xl font-normal leading-relaxed">
          {description}
        </p>
        <div className="hero-fade mt-8 sm:mt-10 flex flex-wrap gap-3 sm:gap-4 font-mono text-sm">
          <button
            onClick={() => onNavigate("#projects")}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-accent text-on-accent font-medium text-sm hover:scale-105 transition-transform cursor-pointer text-center"
          >
            Ver proyectos
          </button>
          <button
            onClick={() => onNavigate("#contact")}
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-fg/20 text-sm hover:border-fg/50 transition-colors cursor-pointer text-center"
          >
            Contacto
          </button>
        </div>
      </div>
    </section>
  );
}
