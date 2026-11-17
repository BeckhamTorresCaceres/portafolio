"use client";

interface MarqueeSectionProps {
  techStack?: string[];
}

export function MarqueeSection({ techStack = [] }: MarqueeSectionProps) {
  const stack = techStack.length > 0 ? techStack : ["React", "Next.js", "TypeScript", "Node.js", "Three.js", "PostgreSQL", "Docker"];
  const repeatedStack = [...stack, ...stack, ...stack, ...stack];

  return (
    <div className="overflow-hidden border-y border-fg/10 py-6 bg-ink/60 backdrop-blur">
      <div className="marquee-inner flex w-max font-mono text-3xl md:text-5xl text-fg/20 whitespace-nowrap">
        {repeatedStack.map((tech, idx) => (
          <span key={idx} className="px-8">
            {tech} <span className="text-accent/60">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
